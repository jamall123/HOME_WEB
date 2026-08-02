import { onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { DI } from '../../../shared/di.js';
import { mediaWorkflow } from '../application/mediaWorkflow.js';
export const onMediaLibraryDeleted = onDocumentDeleted({ document: 'media_library/{mediaId}', region: 'europe-west1' }, async (event) => {
    const deletedMedia = event.data?.data();
    const mediaId = event.params.mediaId;
    // In Phase 3, soft delete moves documents to recycle_bin, but if they are permanently deleted
    // from media_library or if a cleanup cron job runs, this trigger catches the permanent deletion.
    if (deletedMedia && deletedMedia.path) {
        try {
            DI.logger.info(`Media document ${mediaId} permanently deleted. Triggering cleanup.`);
            await mediaWorkflow.handleMediaDeletion(mediaId, deletedMedia.path);
        }
        catch (error) {
            DI.logger.error(`Error in onMediaLibraryDeleted for ${mediaId}`, { error });
        }
    }
    else {
        DI.logger.warn(`Deleted media document ${mediaId} had no 'path' property.`);
    }
});
//# sourceMappingURL=mediaController.js.map