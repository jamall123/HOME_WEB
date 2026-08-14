# PROJECT ARCHITECTURE MAP

## 1. Controllers (Business Logic)
- `AuthController.js`
- `AdminController.js`
- `AcademyController.js`
- `CourseRoomController.js`
- `RoomController.js`
- `CurriculumController.js`
- `InstructorController.js`
- `ResourceController.js`
- `ChatController.js`
- `PresenceController.js`
- `ProgressController.js`
- `AttendanceController.js`
- `ArchiveController.js`
- `BlogController.js`
- `UserController.js`
- `EnrollmentController.js`
- `ProjectsController.js`
- `ContactController.js`
- `GlobalController.js`
- `StoriesController.js`

## 2. Services (External Integrations / Providers)
- `AuthService.js`
- `APIService.js`
- `CurriculumService.js`
- `ResourceService.js`
- `ChatService.js`
- `InstructorService.js`
- `PresenceService.js`
- `ArchiveService.js`
- `BlogService.js`
- `UserService.js`
- `CertificateService.js`
- `CMSService.js`
- `ProjectsService.js`
- `AcademyService.js`
- `StoriesService.js`

## 3. Repositories (Data Access Layer)
- `AuthRepository.js`
- `CourseRepository.js`
- `CurriculumRepository.js`
- `ResourceRepository.js` (assumed / mixed)
- `ChatRepository.js`
- `RoomRepository.js`
- `MediaRepository.js`
- `PresenceRepository.js`
- `StudentProgressRepository.js`
- `ArchiveRepository.js`
- `AdminRepository.js`
- `UserRepository.js`
- `EnrollmentRepository.js`
- `ContactRepository.js`
- `ProjectsRepository.js`
- `OfflineSyncRepository.js`
- `CoursesCredentialsRepository.js`
- `NotificationRepository.js`

## 4. State Managers & Engines
- `StateStore.js`
- `RoomState.js`
- `MediaEngine.js`
- `ReplayEngine.js`
- `RoomEngine.js` (via RoomController/RoomState)
- `AnalyticsEngine.js`
- `MetricsEngine.js`
- `OfflineSyncEngine.js`
- `AIProcessingEngine.js`
- `CompressionEngine.js`
- `PreviewEngine.js`

## 5. Listeners & Events (EventBus.js / RoomEvents.js)
### Core Events:
- `PLAY_LECTURE`
- `MEDIA_MODE_CHANGED`
- `ROOM_STATE_UPDATED`
- `LESSON_ENDED`
- `ROOM_PERMISSIONS_CHANGED`
- `FILE_UPLOAD_PROGRESS`
- `CHAT_MESSAGE_RECEIVED`
- `STUDENT_JOINED`
- `STUDENT_LEFT`
- `INTERNAL_START_BROADCAST`

## 6. Firestore Collections
- `users`: User profiles and roles.
- `courses`: Master course metadata.
- `curriculum`: Sections for each course.
- `curriculumLessons`: Lessons grouped by section ID.
- `studentProgress`: Tracking completion percentages and watched states.
- `resources`: Files, links, and documents attached to lessons.
- `channelMessages`: Chat histories per lesson/channel.
- `connected_users`: Live presence tracking per room.
- `analytics`: Usage data and logs.
- `certificates`: Generated PDF certificates.
- `blog_posts`: Articles.
- `contacts`: Form submissions.
- `projects`: Student showcases.
- `notifications`: Alerts for users.
- `stories`: Instagram-like stories for marketing.

## 7. Storage Paths
- `profiles/`: User avatars.
- `courses/`: Course thumbnails and promo videos.
- `resources/`: Uploaded lesson attachments.
- `certificates/`: Exported PDF certificates.
- `blog/`: Article images.
- `media/`: Pre-recorded lesson videos.

## 8. Routes
- Managed via `Router.js` and `HashEngine.js`.
- Paths map `#view=` to UI components (e.g., `#view=admin`, `#view=academy`, `#view=courseRoom`).

## 9. Background Processes
- `UploadQueue.js`: Manages chunked file uploads in the background.
- `OfflineSyncEngine.js`: Syncs data periodically via IndexDB and Service Workers.
- `PresenceService`: Heartbeat ping to keep users marked as online.
