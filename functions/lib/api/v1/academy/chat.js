import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { DI } from '../../../shared/di.js';
import { AuthMiddleware } from '../../../shared/middleware/auth.js';
import { SecurityMiddleware } from '../../../shared/middleware/security.js';
export const createCourseChat = functions.https.onCall(async (data, context) => {
    SecurityMiddleware.requireAppCheck(context);
    const authContext = AuthMiddleware.requireAuth(context);
    const payload = data.payload || data;
    const { lessonId, text, channel, userName } = payload;
    if (!lessonId || !text)
        throw new functions.https.HttpsError('invalid-argument', 'Missing fields.');
    try {
        await DI.db.collection('course_chats').add({
            lessonId,
            userId: authContext.auth.uid,
            userName: userName || authContext.auth.token.name || 'Unknown',
            text,
            channel: channel || 'general',
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        return { success: true };
    }
    catch (error) {
        throw new functions.https.HttpsError('internal', 'Failed to create chat.');
    }
});
//# sourceMappingURL=chat.js.map