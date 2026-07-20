import * as functions from 'firebase-functions';
import { DI } from '../shared/di.js';
import { mediaWorkflow } from '../workflows/mediaWorkflow.js';
export const onMediaLibraryDeleted = functions.firestore
    .document('media_library/{mediaId}')
    .onDelete(async (snap, context) => {
    const deletedMedia = snap.data();
    // In Phase 3, soft delete moves documents to recycle_bin, but if they are permanently deleted
    // from media_library or if a cleanup cron job runs, this trigger catches the permanent deletion.
    if (deletedMedia && deletedMedia.path) {
        try {
            DI.logger.info(`Media document ${context.params.mediaId} permanently deleted. Triggering cleanup.`);
            await mediaWorkflow.handleMediaDeletion(context.params.mediaId, deletedMedia.path);
        }
        catch (error) {
            DI.logger.error(`Error in onMediaLibraryDeleted for ${context.params.mediaId}`, { error });
        }
    }
    else {
        DI.logger.warning(`Deleted media document ${context.params.mediaId} had no 'path' property.`);
    }
});
//# sourceMappingURL=mediaController.js.map