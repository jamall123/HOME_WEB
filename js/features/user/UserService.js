/**
 * @file UserService.js
 * @purpose Business logic for User Profiles.
 */
import { CourseRepository } from '../../repositories/CourseRepository.js';

export class UserServiceClass {
    /**
     * Updates the instructor's profile in the course document.
     * @param {string} courseId 
     * @param {Object} profileData { name, specialty, bio, image, cvUrl }
     */
    async updateInstructorProfile(courseId, profileData) {
        if (!courseId) throw new Error("Course ID is required");
        if (!profileData.name || !profileData.specialty) {
            throw new Error("الاسم والتخصص مطلوبان!");
        }

        const sanitizedData = {
            name: profileData.name,
            specialty: profileData.specialty,
            bio: profileData.bio || '',
            image: profileData.image || 'assets/images/default-avatar.png',
            cvUrl: profileData.cvUrl || ''
        };

        await CourseRepository.updateCourse(courseId, { instructor: sanitizedData });
    }
}
export const UserService = new UserServiceClass();
