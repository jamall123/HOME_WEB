# User Profiles Impact Analysis

## Files that import or use User/Instructor Data
1. **academy.js**: Contains two definitions of `updateInstructorProfile` updating the `courses` collection with instructor details.
2. **StudentManager.js**: Fetches students.
3. **course-room.html**: Likely depends on instructor info to render the UI.

## Exposed Global Variables
1. **window.updateInstructorProfile**: Duplicate functions to be unified.

## Migration Strategy
1. Create `js/features/user/UserService.js` (Business Logic for updating user/instructor profiles). Wait, since it updates `courses` document, it should use `CourseRepository.js`!
2. Create `js/features/user/UserController.js` (Coordination).
3. Update `academy.js` to remove duplicate logic.
4. Purge duplicate `updateInstructorProfile` implementations and map them to `UserController`.
