import * as functions from 'firebase-functions';
import './bootstrap.js';
import { DI } from './shared/di.js';

DI.logger.info('Jhome Enterprise Functions Initialized — v1 API Gateway ready.');

// Register Domain Workflows (Event Listeners — do NOT remove)
import './domains/notifications/application/NotificationWorkflow.js';

// ── Legacy Controllers (keep until fully migrated) ───────────────────────────
export * from './domains/academy/presentation/enrollmentController.js';
export * from './domains/media/presentation/mediaController.js';
export * from './shared/monitoring/analytics.js';

// ── V1 API Gateway: Academy ───────────────────────────────────────────────────
import { courses } from './api/v1/academy/courses.js';
import { enrollments } from './api/v1/academy/enrollments.js';

export const api_v1_academy_courses = courses;
export const api_v1_academy_enrollments = enrollments;

// ── V1 API Gateway: CMS ───────────────────────────────────────────────────────
import { content } from './api/v1/cms/content.js';
import { settings } from './api/v1/cms/settings.js';

export const api_v1_cms_content = content;
export const api_v1_cms_settings = settings;

// ── V1 API Gateway: Users ────────────────────────────────────────────────────
import { users } from './api/v1/users/users.js';

export const api_v1_users = users;

// ── V1 API Gateway: Contact ──────────────────────────────────────────────────
import { contact } from './api/v1/contact/contact.js';

export const api_v1_contact = contact;

// ── Health Check ─────────────────────────────────────────────────────────────
export const healthCheck = functions.https.onRequest((request, response) => {
  DI.logger.info('Health check pinged', { ip: request.ip });
  response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    functions: [
      'api_v1_academy_courses',
      'api_v1_academy_enrollments',
      'api_v1_cms_content',
      'api_v1_cms_settings',
      'api_v1_users',
      'api_v1_contact'
    ]
  });
});
