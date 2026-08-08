/**
 * ArchiveService.js
 * Handles saving and retrieving archived sessions.
 */

import { ArchiveRepository } from '../../repositories/ArchiveRepository.js';

export class ArchiveServiceClass {
    async saveArchive(archiveData) {
        return await ArchiveRepository.saveArchive(archiveData);
    }

    async getArchive(sessionId) {
        return await ArchiveRepository.getArchive(sessionId);
    }

    async listArchives(courseId) {
        return await ArchiveRepository.listArchives(courseId);
    }
}
export const ArchiveService = new ArchiveServiceClass();
