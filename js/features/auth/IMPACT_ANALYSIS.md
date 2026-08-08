# Authentication Impact Analysis

## Files that import or use legacy Auth
1. **course-room.html**: Imports `AuthService` dynamically, calls `login()` and `logout()`.
2. **js/modules/CurriculumController.js**: Imports `AuthService`, calls `getCurrentUser()`.
3. **js/modules/RoomEngine.js**: Imports `AuthService`, calls `getCurrentUser()`.
4. **js/academy.js**: Calls `window.firebase.auth().signInWithEmailAndPassword()`, `signInWithCustomToken()`, and `onAuthStateChanged()`.
5. **js/modules/ResourceService.js**: Calls `window.firebase.auth().currentUser.uid`.

## Exposed Global Variables
1. **window.currentUser**: Set in `academy.js` on auth state change.
2. **window.firebase.auth**: Used directly by `academy.js` and `ResourceService`.

## Migration Strategy
1. Create `js/features/auth/AuthService.js` (Business Logic).
2. Create `js/features/auth/AuthController.js` (Coordination).
3. Update `academy.js` to use `AuthController.login()` instead of direct Firebase calls.
4. Update `course-room.html` to use `AuthController.login()`.
5. Update `CurriculumController`, `RoomEngine`, and `ResourceService` to get the user via `StateStore.getState('user')` instead of querying Auth.
6. Delete `js/modules/AuthService.js`.
7. Purge `window.currentUser` from auth listeners (redirects to `StateStore`).
