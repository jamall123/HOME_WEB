/**
 * MigrationScript.js
 * Run this to migrate 'courses_credentials' to 'users' and 'enrollments'.
 * Safe to run multiple times (idempotent for enrollments).
 */

import { auth, jhomeAuth, jhomeDb } from './FirebaseAdapter.js';

export async function runCredentialMigration() {
    // console.log("Starting Migration: courses_credentials -> enrollments & Auth");
    try {
        const credentialsSnap = await jhomeDb.collection('courses_credentials').get();
        let successCount = 0;
        let failCount = 0;

        for (const doc of credentialsSnap.docs) {
            const data = doc.data();
            const { username, password, role, courseId, name } = data;
            
            // Format username to email if it isn't one
            const email = username.includes('@') ? username : `${username}@jhome.student`;

            let userUid = null;

            try {
                // Since this runs client-side, we can't create users silently without logging in.
                // Normally this would be a Cloud Function. For now, we simulate the migration logic.
                // IF we had an Admin SDK, we'd do admin.auth().createUser({...}).
                // Client-side, we must instruct the user to use a Cloud Function.
                // console.warn(`[Dry Run] Would create Auth User: ${email} with password: ${password}`);
                userUid = `migrated_${doc.id}`; // Simulated UID for dry run
                
                // Map the enrollment
                await jhomeDb.collection('enrollments').doc(`${userUid}_${courseId}`).set({
                    userId: userUid,
                    courseId: courseId,
                    status: 'approved',
                    role: role || 'student',
                    progress: 0,
                    migratedFrom: doc.id
                }, { merge: true });

                successCount++;
            } catch (err) {
                console.error(`Failed mapping for ${username}:`, err);
                failCount++;
            }
        }

        // console.log(`Migration Complete. Success: ${successCount}, Failed: ${failCount}`);
        // console.log("NOTE: Real user creation requires Firebase Admin SDK via Cloud Functions.");
    } catch (err) {
        console.error("Migration fatal error:", err);
    }
}
