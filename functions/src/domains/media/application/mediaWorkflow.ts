import { DI } from '../../../shared/di.js';
import { EventType } from '../../../shared/events/eventBus.js';

export class MediaWorkflow {
  async handleMediaDeletion(mediaId: string, path: string): Promise<void> {
    DI.logger.info(`Starting Media Workflow (Deletion) for ${mediaId}`, { path });

    try {
      const bucket = DI.storage.bucket();
      const file = bucket.file(path);
      
      const [exists] = await file.exists();
      if (exists) {
        await file.delete();
        DI.logger.info(`Successfully deleted physical file from storage: ${path}`);
      } else {
        DI.logger.warning(`Physical file not found in storage: ${path}`);
      }

      await DI.eventBus.publish({
        type: EventType.MEDIA_DELETED,
        payload: { mediaId, path },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      DI.logger.error(`Media Workflow (Deletion) failed for ${mediaId}`, { error, path });
      throw error;
    }
  }
}

export const mediaWorkflow = new MediaWorkflow();
