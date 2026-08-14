import { CurriculumRepository } from '../../repositories/CurriculumRepository.js';

export const CurriculumService = {
    async getSections(courseId) {
        return await CurriculumRepository.getSections(courseId);
    },

    async getLessons(sectionId) {
        return await CurriculumRepository.getLessons(sectionId);
    },

    subscribeToSections(courseId, callback) {
        return CurriculumRepository.subscribeToSections(courseId, callback);
    },

    subscribeToLessons(sectionId, callback) {
        return CurriculumRepository.subscribeToLessons(sectionId, callback);
    },

    async reorderSections(items) {
        await CurriculumRepository.reorderItems(items, 'curriculum');
    },
    
    async reorderLessons(items) {
        await CurriculumRepository.reorderItems(items, 'curriculumLessons');
    },

    async addSection(courseId, title, order) {
        return await CurriculumRepository.addSection(courseId, title, order);
    },

    async addLesson(sectionId, lessonData) {
        return await CurriculumRepository.addLesson(sectionId, lessonData);
    },

    async updateLesson(lessonId, updates) {
        await CurriculumRepository.updateLesson(lessonId, updates);
    },

    async softDeleteSection(sectionId, userId) {
        await CurriculumRepository.softDelete('curriculum', sectionId, userId);
    },
    
    async softDeleteLesson(lessonId, userId) {
        await CurriculumRepository.softDelete('curriculumLessons', lessonId, userId);
    },

    logAnalytics(eventName, data) {
        CurriculumRepository.logAnalyticsEvent(eventName, data);
    },

    async logAudit(action, entityId, entityType, oldData, newData, userId) {
        await CurriculumRepository.logAuditAction(action, entityId, entityType, oldData, newData, userId);
    }
};
