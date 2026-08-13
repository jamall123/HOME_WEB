import { InstructorRepository } from '../../repositories/InstructorRepository.js';

export class InstructorServiceClass {
    constructor() {
    }

    async updateProfile(uid, profileData) {
        await InstructorRepository.updateProfile(uid, profileData);
    }

    async updateCourseProfile(courseId, profileData) {
        await InstructorRepository.updateCourseProfile(courseId, profileData);
    }

    uploadMedia(file, path, progressCallback = null) {
        return InstructorRepository.uploadMedia(file, path, progressCallback);
    }

    async updateTeachingMode(courseId, modePayload) {
        await InstructorRepository.updateTeachingMode(courseId, modePayload);
    }

    async addChannelMessage(courseId, lessonId, message) {
        if (lessonId) {
            message.lessonId = lessonId;
        }
        await InstructorRepository.addChannelMessage(courseId, message);
    }

    async updateClassroomState(courseId, statePayload) {
        await InstructorRepository.updateClassroomState(courseId, statePayload);
    }

    async getResources(courseId) {
        return await InstructorRepository.getResources(courseId);
    }

    async postAnnouncement(courseId, data) {
        await InstructorRepository.postAnnouncement(courseId, data);
    }
}

export const InstructorService = new InstructorServiceClass();

