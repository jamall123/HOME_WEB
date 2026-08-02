import * as functions from 'firebase-functions';
import { DI } from '../di.js';
import { RBAC, Role, Permission } from '../permissions/rbac.js';

export interface AuthenticatedContext extends functions.https.CallableContext {
  auth: {
    uid: string;
    token: any;
  };
  role: Role;
}

export class AuthMiddleware {
  static requireAuth(context: functions.https.CallableContext): AuthenticatedContext {
    if (!context.auth) {
      DI.logger.warn('Unauthenticated request rejected', { ip: context.rawRequest?.ip });
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }

    // Determine role from custom claims or fallback to GUEST
    const role = (context.auth.token.role as Role) || Role.GUEST;

    return { ...context, auth: context.auth, role } as AuthenticatedContext;
  }

  static requirePermission(permission: Permission) {
    return (handler: (data: any, context: AuthenticatedContext) => Promise<any> | any) => {
      return async (data: any, context: functions.https.CallableContext) => {
        const authContext = AuthMiddleware.requireAuth(context);
        
        if (!RBAC.hasPermission(authContext.role, permission)) {
          DI.logger.warn('Permission denied', { uid: authContext.auth.uid, role: authContext.role, permission });
          throw new functions.https.HttpsError('permission-denied', 'You do not have permission to perform this action.');
        }
        
        return handler(data, authContext);
      };
    };
  }
}
