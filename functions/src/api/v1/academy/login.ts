import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { DI } from '../../../shared/di.js';
import { SecurityMiddleware } from '../../../shared/middleware/security.js';
import { RateLimiter } from '../../../shared/middleware/rateLimit.js';
import { parseRequest, ok, fail } from '../../../shared/api/contract.js';
import * as bcrypt from 'bcryptjs';

const loginRateLimiter = RateLimiter.apply('academy_login', 8, 60000);

/**
 * api_v1_academy_login
 *
 * Replaces the legacy client-side plaintext-password check against
 * `courses_credentials` (which required an open Firestore read rule and
 * compared passwords in the browser). This callable verifies the
 * credential server-side with the Admin SDK (no client read of the
 * password field is ever needed/allowed anymore), then lazily
 * provisions/links a real Firebase Auth account for that legacy
 * student/instructor and returns a custom token so the client completes
 * sign-in through the standard `firebase.auth()` flow.
 */
export const login = functions.https.onCall(async (rawData, context) => {
  const startTime = performance.now();

  // 1. Security — public endpoint (user isn't authenticated yet), so we
  // rely on App Check + IP-based rate limiting instead of requireAuth.
  SecurityMiddleware.requireAppCheck(context);
  await loginRateLimiter(context);

  // 2. Parse unified request
  const req = parseRequest(rawData);
  const { username, password } = req.payload as { username?: string; password?: string };
  const correlationId = req.metadata?.correlationId;

  if (!username || !password) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing username or password.');
  }

  // Support the same historical username formats the legacy client used.
  const uLow = username.trim().toLowerCase();
  const candidates = Array.from(new Set([
    username.trim(),
    uLow,
    `${uLow}@jhome.sd`,
    `${username.trim()}@jhome.sd`,
  ]));

  try {
    let credDoc: FirebaseFirestore.DocumentSnapshot | null = null;
    for (const candidate of candidates) {
      const snap = await DI.db.collection('courses_credentials').doc(candidate).get();
      if (snap.exists && snap.data()?.password !== undefined) {
        credDoc = snap;
        break;
      }
    }

    // Check if the stored password matches
    let passwordMatches = false;
    let needsMigration = false;
    
    if (!credDoc) {
      return fail('invalid-credentials', 'اسم المستخدم أو كلمة المرور غير صحيحة.', false);
    }
    
    const storedPasswordRaw = credDoc.data()?.password;
    const storedPassword = storedPasswordRaw != null ? String(storedPasswordRaw) : '';

    if (storedPassword && (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$'))) {
      // It is already a bcrypt hash
      passwordMatches = await bcrypt.compare(password, storedPassword);
    } else {
      // Plaintext password comparison
      if (storedPassword === password) {
        passwordMatches = true;
        needsMigration = true; // We should hash it now
      }
    }

    if (!passwordMatches) {
      return fail('invalid-credentials', 'اسم المستخدم أو كلمة المرور غير صحيحة.', false);
    }

    // Lazy migration: hash the plaintext password immediately for future logins
    if (needsMigration) {
      try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await credDoc.ref.update({
          password: hashedPassword,
          password_migrated: true,
          migratedAt: new Date().toISOString()
        });
        DI.logger.info(`Lazily migrated password for user ${credDoc.id}`);
      } catch (err) {
        DI.logger.warn(`Failed to lazy-migrate password for user ${credDoc.id}`, { err });
      }
    }

    const data = credDoc.data()!;
    const uid = data.uid || `legacy_${credDoc.id}`.replace(/[^a-zA-Z0-9_\-@.]/g, '_').slice(0, 128);
    // Preserve the legacy lowercase role values ('student'/'instructor') the
    // frontend already checks against, rather than the RBAC enum casing.
    const role = data.role || 'student';
    const displayName = data.fullName || data.studentName || (data.student && (data.student.fullName || data.student.name)) || data.fullname || data.name || credDoc.id;

    // Lazily provision a real Firebase Auth account on first server-verified login.
    try {
      await DI.auth.getUser(uid);
    } catch (e) {
      await DI.auth.createUser({ uid, displayName, disabled: false });
    }
    await DI.auth.setCustomUserClaims(uid, { role, courseId: data.courseId || null });

    // Mirror a real profile doc so the account shows up like any other user.
    await DI.db.collection('users').doc(uid).set({
      uid, displayName, role,
      courseId: data.courseId || null,
      legacyCredentialId: credDoc.id,
      migratedAt: new Date().toISOString(),
      disabled: false,
    }, { merge: true });

    // Track login stats on the legacy doc (client can no longer write this
    // directly since courses_credentials writes are now Admin-SDK-only).
    await credDoc.ref.update({
      lastLogin: new Date().toISOString(),
      loginCount: (data.loginCount || 0) + 1,
    });

    await DI.db.collection('auditLogs').add({
      action: 'LOGIN', collection: 'courses_credentials',
      targetId: credDoc.id, performedBy: uid,
      description: `Legacy credential login for ${credDoc.id}, migrated to real Auth uid ${uid}`,
      timestamp: new Date(), success: true, correlationId,
    });

    const token = await DI.auth.createCustomToken(uid, { role, courseId: data.courseId || null });

    return ok({ token, role, courseId: data.courseId || null, displayName, username: credDoc.id }, 'Login verified.', startTime, correlationId);
  } catch (error: any) {
    if (error instanceof functions.https.HttpsError) throw error;
    DI.logger.error('academy login failed', { message: error.message, stack: error.stack });
    throw new functions.https.HttpsError('internal', 'Login failed due to a server error.');
  }
});
