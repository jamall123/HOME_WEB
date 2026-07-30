import * as functions from 'firebase-functions';
import { DI } from '../../../shared/di.js';
import { AuthMiddleware } from '../../../shared/middleware/auth.js';
import { SecurityMiddleware } from '../../../shared/middleware/security.js';
export const createCourseChat = functions.https.onCall(async (data, context) => {
    SecurityMiddleware.requireAppCheck(context);
    const authContext = AuthMiddleware.requireAuth(context);
    const { lessonId, text, channel } = data;
    if (!lessonId || !text)
        throw new functions.https.HttpsError('invalid-argument', 'Missing fields.');
    try {
        await DI.db.collection('course_chats').add({
            lessonId,
            userId: authContext.auth.uid,
            userName: authContext.auth.token.name || 'Unknown',
            text,
            channel: channel || 'general',
            timestamp: new Date().toISOString()
        });
        return { success: true };
    }
    catch (error) {
        throw new functions.https.HttpsError('internal', 'Failed to create chat.');
    }
});
//# sourceMappingURL=chat.js.map