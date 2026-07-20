import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { DI } from '../../../shared/di.js';
import { AuthMiddleware } from '../../../shared/middleware/auth.js';
import { SecurityMiddleware } from '../../../shared/middleware/security.js';
import { Role } from '../../../shared/permissions/rbac.js';
import { parseRequest, ok } from '../../../shared/api/contract.js';

export const users = functions.https.onCall(async (rawData, context) => {
  const startTime = performance.now();

  // 1. Security & Identity
  SecurityMiddleware.requireAppCheck(context);
  const authContext = AuthMiddleware.requireAuth(context);

  // 2. Parse unified request
  const req = parseRequest(rawData);
  const { action } = req;
  const payload = req.payload;
  const correlationId = req.metadata?.correlationId;
  const { uid, email, password, displayName, role, courseId } = payload;

  // 3. Idempotency
  await SecurityMiddleware.enforceIdempotency(correlationId);

  const isAdmin = authContext.role === Role.ADMIN || authContext.role === Role.SUPER_ADMIN;
  const isSuperAdmin = authContext.role === Role.SUPER_ADMIN;

  // Only admins can manage users
  if (!isAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can manage users.');
  }

  try {
    switch (action) {

      // ── CREATE ───────────────────────────────────────────────────────────
      case 'create': {
        if (!email || !password || !displayName) {
          throw new functions.https.HttpsError('invalid-argument', 'Missing email, password, or displayName.');
        }

        const userRecord = await admin.auth().createUser({ email, password, displayName });
        const assignedRole = role || Role.STUDENT;

        // Set custom claims for RBAC
        await admin.auth().setCustomUserClaims(userRecord.uid, { role: assignedRole });

        // Write user profile to Firestore in a batch
        const profileRef = DI.db.collection('users').doc(userRecord.uid);
        const auditRef = DI.db.collection('auditLogs').doc();
        const batch = DI.db.batch();

        batch.set(profileRef, {
          uid: userRecord.uid, email, displayName,
          role: assignedRole,
          ...(courseId ? { courseId } : {}),
          createdAt: new Date().toISOString(),
          createdBy: authContext.auth.uid,
          disabled: false
        });
        batch.set(auditRef, {
          action: 'CREATE', collection: 'users',
          targetId: userRecord.uid, performedBy: authContext.auth.uid,
          description: `Created user: ${email} with role ${assignedRole}`,
          timestamp: new Date(), success: true, correlationId
        });
        await batch.commit();

        return ok({ uid: userRecord.uid, email, role: assignedRole }, 'User created successfully.', startTime, correlationId);
      }

      // ── UPDATE ───────────────────────────────────────────────────────────
      case 'update': {
        if (!uid) throw new functions.https.HttpsError('invalid-argument', 'Missing uid.');

        const updatePayload: admin.auth.UpdateRequest = {};
        if (displayName) updatePayload.displayName = displayName;
        if (email) updatePayload.email = email;

        await admin.auth().updateUser(uid, updatePayload);

        const profileRef = DI.db.collection('users').doc(uid);
        const auditRef = DI.db.collection('auditLogs').doc();
        const batch = DI.db.batch();

        batch.update(profileRef, {
          ...(displayName ? { displayName } : {}),
          ...(email ? { email } : {}),
          updatedAt: new Date().toISOString(),
          updatedBy: authContext.auth.uid
        });
        batch.set(auditRef, {
          action: 'UPDATE', collection: 'users',
          targetId: uid, performedBy: authContext.auth.uid,
          description: `Updated user: ${uid}`,
          timestamp: new Date(), success: true, correlationId
        });
        await batch.commit();

        return ok({ uid }, 'User updated.', startTime, correlationId);
      }

      // ── CHANGE ROLE ──────────────────────────────────────────────────────
      case 'changeRole': {
        if (!isSuperAdmin) {
          throw new functions.https.HttpsError('permission-denied', 'Only super admins can change roles.');
        }
        if (!uid || !role) throw new functions.https.HttpsError('invalid-argument', 'Missing uid or role.');

        await admin.auth().setCustomUserClaims(uid, { role });

        const profileRef = DI.db.collection('users').doc(uid);
        const auditRef = DI.db.collection('auditLogs').doc();
        const batch = DI.db.batch();

        batch.update(profileRef, { role, updatedAt: new Date().toISOString() });
        batch.set(auditRef, {
          action: 'CHANGE_ROLE', collection: 'users',
          targetId: uid, performedBy: authContext.auth.uid,
          description: `Changed role for ${uid} → ${role}`,
          timestamp: new Date(), success: true, correlationId
        });
        await batch.commit();

        return ok({ uid, role }, 'User role updated.', startTime, correlationId);
      }

      // ── DISABLE ──────────────────────────────────────────────────────────
      case 'disable': {
        if (!uid) throw new functions.https.HttpsError('invalid-argument', 'Missing uid.');
        await admin.auth().updateUser(uid, { disabled: true });

        const profileRef = DI.db.collection('users').doc(uid);
        const auditRef = DI.db.collection('auditLogs').doc();
        const batch = DI.db.batch();

        batch.update(profileRef, { disabled: true, disabledAt: new Date().toISOString() });
        batch.set(auditRef, {
          action: 'DISABLE', collection: 'users',
          targetId: uid, performedBy: authContext.auth.uid,
          description: `Disabled user: ${uid}`,
          timestamp: new Date(), success: true, correlationId
        });
        await batch.commit();

        return ok({ uid }, 'User disabled.', startTime, correlationId);
      }

      // ── ENABLE ───────────────────────────────────────────────────────────
      case 'enable': {
        if (!uid) throw new functions.https.HttpsError('invalid-argument', 'Missing uid.');
        await admin.auth().updateUser(uid, { disabled: false });

        const profileRef = DI.db.collection('users').doc(uid);
        const auditRef = DI.db.collection('auditLogs').doc();
        const batch = DI.db.batch();

        batch.update(profileRef, { disabled: false, enabledAt: new Date().toISOString() });
        batch.set(auditRef, {
          action: 'ENABLE', collection: 'users',
          targetId: uid, performedBy: authContext.auth.uid,
          description: `Enabled user: ${uid}`,
          timestamp: new Date(), success: true, correlationId
        });
        await batch.commit();

        return ok({ uid }, 'User enabled.', startTime, correlationId);
      }

      // ── RESET PASSWORD ───────────────────────────────────────────────────
      case 'resetPassword': {
        if (!email) throw new functions.https.HttpsError('invalid-argument', 'Missing email.');

        const resetLink = await admin.auth().generatePasswordResetLink(email);

        await DI.db.collection('auditLogs').add({
          action: 'RESET_PASSWORD', collection: 'users',
          targetId: email, performedBy: authContext.auth.uid,
          description: `Password reset triggered for: ${email}`,
          timestamp: new Date(), success: true, correlationId
        });

        return ok({ email, resetLink }, 'Password reset link generated.', startTime, correlationId);
      }

      // ── RESEND VERIFICATION ──────────────────────────────────────────────
      case 'resendVerification': {
        if (!email) throw new functions.https.HttpsError('invalid-argument', 'Missing email.');

        const verificationLink = await admin.auth().generateEmailVerificationLink(email);

        await DI.db.collection('auditLogs').add({
          action: 'RESEND_VERIFICATION', collection: 'users',
          targetId: email, performedBy: authContext.auth.uid,
          description: `Verification email triggered for: ${email}`,
          timestamp: new Date(), success: true, correlationId
        });

        return ok({ email, verificationLink }, 'Verification link generated.', startTime, correlationId);
      }

      // ── DELETE ───────────────────────────────────────────────────────────
      case 'delete': {
        if (!isSuperAdmin) {
          throw new functions.https.HttpsError('permission-denied', 'Only super admins can delete users.');
        }
        if (!uid) throw new functions.https.HttpsError('invalid-argument', 'Missing uid.');

        await admin.auth().deleteUser(uid);

        const profileRef = DI.db.collection('users').doc(uid);
        const auditRef = DI.db.collection('auditLogs').doc();
        const batch = DI.db.batch();

        batch.delete(profileRef);
        batch.set(auditRef, {
          action: 'DELETE', collection: 'users',
          targetId: uid, performedBy: authContext.auth.uid,
          description: `Deleted user: ${uid}`,
          timestamp: new Date(), success: true, correlationId
        });
        await batch.commit();

        return ok({ uid }, 'User deleted.', startTime, correlationId);
      }

      default:
        throw new functions.https.HttpsError('invalid-argument', `Unknown action: ${action}`);
    }
  } catch (error: any) {
    DI.logger.error(`Users action failed: ${action}`, { error, correlationId });

    await DI.db.collection('auditLogs').add({
      action: 'ERROR', collection: 'users',
      targetId: uid || email || 'unknown',
      performedBy: authContext.auth.uid,
      description: `Failed users action ${action}: ${error.message}`,
      timestamp: new Date(), success: false, correlationId
    });

    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', `Failed to process users action: ${action}`);
  }
});
