/**
 * @file Constants.js
 * @purpose Centralized repository for all magic values.
 * @responsibilities
 *  - Prevent typos and duplication of strings/numbers.
 *  - Provide a single source of truth for schema names, roles, and static keys.
 * @dependencies None
 * @publicAPI Constants (Object)
 * @futureMigrationPlan Replace all hardcoded strings (e.g., 'courses', 'admin') with references to this file.
 */

export const Constants = Object.freeze({
    // Firestore Collections
    COLLECTIONS: {
        COURSES: 'courses',
        USERS: 'users',
        COURSE_CREDENTIALS: 'courses_credentials',
        SYSTEM_CONFIG: 'system_config',
        SYSTEM_AUDIT_LOGS: 'system_audit_logs',
        ENROLLMENT_REQUESTS: 'enrollmentRequests',
        CURRICULUM: 'curriculum',
        CURRICULUM_LESSONS: 'curriculumLessons',
        ACTIVE_SESSIONS: 'active_sessions',
        COURSE_CHATS: 'course_chats',
        CHANNEL_MESSAGES: 'channelMessages',
        MEDIA_LIBRARY: 'media_library',
        LESSON_RESOURCES: 'lessonResources',
        CERTIFICATES: 'certificates',
        NOTIFICATIONS: 'notifications',
        POSTS: 'posts',
        SUCCESS_STORIES: 'successStories',
        BANK_ACCOUNTS: 'bank_accounts',
        PROJECTS: 'projects',
        CONTACT_MESSAGES: 'messages',
        ARCHIVED_SESSIONS: 'archived_sessions',
        PAGE_CONTENT: 'pageContent',
        STUDENT_PROGRESS: 'studentProgress',
        RESOURCE_AI_METADATA: 'resource_ai_metadata',
        COURSE_ANALYTICS: 'courseAnalytics',
        LESSON_ANNOUNCEMENTS: 'lessonAnnouncements',
        CURRICULUM_ANALYTICS: 'curriculumAnalytics',
        CURRICULUM_AUDIT_LOGS: 'curriculumAuditLogs',
        CURRICULUM_VERSIONS: 'curriculumVersions',
        AUDIT_LOGS: 'auditLogs',
        SETTINGS: 'settings'
    },

    // Subcollections
    SUBCOLLECTIONS: {
        CONNECTED_USERS: 'connected_users',
        ROOMS: 'rooms',
        RESOURCES: 'resources',
        HAND_RAISES: 'handRaises',
        TYPING_STATUS: 'typing_status'
    },

    // Roles & Permissions
    ROLES: {
        ADMIN: 'admin',
        STUDENT: 'student',
        INSTRUCTOR: 'instructor',
        SUPERVISOR: 'supervisor'
    },

    // Storage Paths
    STORAGE: {
        ANALYTICS_CACHE: 'analytics_cache',
        SEARCH_INDEX: 'search_index',
        UPLOAD_QUEUE: 'upload_queue',
        MEDIA_UPLOADS: 'media'
    },

    // Application Events (For EventBus)
    EVENTS: {
        USER_LOGIN: 'auth:login',
        USER_LOGOUT: 'auth:logout',
        ROOM_JOINED: 'room:joined',
        ROOM_LEFT: 'room:left',
        PRESENCE_UPDATED: 'presence:updated',
        ERROR_OCCURRED: 'system:error',
        CMS_POST_UPDATED: 'cms:post:updated',
        CMS_COURSE_UPDATED: 'cms:course:updated'
    },

    // LocalStorage & Session Keys
    STORAGE_KEYS: {
        AUTH_TOKEN: 'jhome_auth_token',
        USER_PREFERENCES: 'jhome_prefs'
    },

    // Status Values
    STATUS: {
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        PENDING: 'pending',
        DELETED: 'deleted'
    }
});
