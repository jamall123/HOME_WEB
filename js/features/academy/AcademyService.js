import { CourseRepository } from '../../repositories/CourseRepository.js';

export class AcademyService {
    async fetchAllCourses() {
        // We'll use CourseRepository to get all courses
        try {
            return await CourseRepository.getAllCourses();
        } catch (error) {
            console.error('[AcademyService] Failed to fetch courses:', error);
            throw error;
        }
    }
}

export const academyService = new AcademyService();
