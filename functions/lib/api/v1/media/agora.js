import * as functions from 'firebase-functions';
import agoraPkg from 'agora-access-token';
const { RtcTokenBuilder, RtcRole } = agoraPkg;
import { DI } from '../../../shared/di.js';
// The App ID and Certificate from the Agora Console
const APP_ID = '4400dcdb72bf4dc1bcdcb2fe37fac0ef';
const APP_CERTIFICATE = 'a888daacd5494b53b94b0a0cc0e7172d';
export const generateAgoraToken = functions.https.onCall((data, context) => {
    // Make sure the user is authenticated (Optional but recommended for security)
    // Removed because the app uses custom auth in some places which causes context.auth to be undefined
    // if (!context.auth) {
    //     throw new functions.https.HttpsError(
    //         'unauthenticated',
    //         'You must be signed in to generate a broadcast token.'
    //     );
    // }
    const channelName = data.channelName;
    if (!channelName) {
        throw new functions.https.HttpsError('invalid-argument', 'channelName is required');
    }
    // Role defaults to Publisher for the instructor and students participating, 
    // or Subscriber if just watching. For simplicity, we use Publisher.
    const role = RtcRole.PUBLISHER;
    // Uid is optional. If passed as 0, Agora generates one for the user.
    const uid = data.uid || 0;
    // Token expiration time (e.g., 24 hours)
    const expirationTimeInSeconds = 3600 * 24;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
    try {
        const token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, uid, role, privilegeExpiredTs);
        DI.logger.info(`Agora token generated successfully for channel: ${channelName}`);
        return {
            token: token,
            appId: APP_ID,
            channel: channelName,
            uid: uid
        };
    }
    catch (error) {
        DI.logger.error(`Failed to generate Agora token: ${error.message}`);
        throw new functions.https.HttpsError('internal', 'Failed to generate Agora token.');
    }
});
//# sourceMappingURL=agora.js.map