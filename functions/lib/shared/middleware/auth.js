import * as functions from 'firebase-functions';
import { DI } from '../di.js';
import { RBAC, Role } from '../permissions/rbac.js';
export class AuthMiddleware {
    static requireAuth(context) {
        if (!context.auth) {
            DI.logger.warning('Unauthenticated request rejected', { ip: context.rawRequest?.ip });
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
        }
        // Determine role from custom claims or fallback to GUEST
        const role = context.auth.token.role || Role.GUEST;
        return { ...context, auth: context.auth, role };
    }
    static requirePermission(permission) {
        return (handler) => {
            return async (data, context) => {
                const authContext = AuthMiddleware.requireAuth(context);
                if (!RBAC.hasPermission(authContext.role, permission)) {
                    DI.logger.warning('Permission denied', { uid: authContext.auth.uid, role: authContext.role, permission });
                    throw new functions.https.HttpsError('permission-denied', 'You do not have permission to perform this action.');
                }
                return handler(data, authContext);
            };
        };
    }
}
//# sourceMappingURL=auth.js.map