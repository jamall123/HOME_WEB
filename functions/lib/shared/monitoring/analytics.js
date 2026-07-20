import * as functions from 'firebase-functions';
import { DI } from '../di.js';
import { AuthMiddleware } from '../middleware/auth.js';
import { Permission } from '../permissions/rbac.js';
export const getSystemHealth = functions.https.onCall(AuthMiddleware.requirePermission(Permission.VIEW_LOGS)(async (data, context) => {
    DI.logger.info(`System health requested by ${context.auth.uid}`);
    // In a real system, you might check storage usage, function invocation counts, or unread errors.
    return {
        status: 'healthy',
        activeProviders: ['gemini'],
        timestamp: new Date().toISOString()
    };
}));
//# sourceMappingURL=analytics.js.map