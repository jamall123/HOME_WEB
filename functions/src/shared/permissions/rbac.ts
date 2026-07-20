export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  AUTHOR = 'AUTHOR',
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT',
  GUEST = 'GUEST'
}

export enum Permission {
  // User Management
  MANAGE_USERS = 'MANAGE_USERS',
  VIEW_USERS = 'VIEW_USERS',
  
  // Content Management
  MANAGE_POSTS = 'MANAGE_POSTS',
  PUBLISH_POSTS = 'PUBLISH_POSTS',
  
  // Media Management
  UPLOAD_MEDIA = 'UPLOAD_MEDIA',
  DELETE_MEDIA = 'DELETE_MEDIA',
  
  // System
  MANAGE_SETTINGS = 'MANAGE_SETTINGS',
  VIEW_LOGS = 'VIEW_LOGS'
}

const RolePermissions: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: Object.values(Permission), // Has everything
  [Role.ADMIN]: [
    Permission.VIEW_USERS, Permission.MANAGE_POSTS, 
    Permission.PUBLISH_POSTS, Permission.UPLOAD_MEDIA, Permission.DELETE_MEDIA
  ],
  [Role.EDITOR]: [
    Permission.MANAGE_POSTS, Permission.PUBLISH_POSTS, Permission.UPLOAD_MEDIA
  ],
  [Role.AUTHOR]: [
    Permission.MANAGE_POSTS, Permission.UPLOAD_MEDIA
  ],
  [Role.INSTRUCTOR]: [
    Permission.MANAGE_POSTS, Permission.UPLOAD_MEDIA, Permission.VIEW_USERS
  ],
  [Role.STUDENT]: [],
  [Role.GUEST]: []
};

export class RBAC {
  static hasPermission(role: Role, permission: Permission): boolean {
    const permissions = RolePermissions[role];
    return permissions ? permissions.includes(permission) : false;
  }

  static getPermissions(role: Role): Permission[] {
    return RolePermissions[role] || [];
  }
}
