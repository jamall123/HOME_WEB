export var Role;
(function (Role) {
    Role["SUPER_ADMIN"] = "SUPER_ADMIN";
    Role["ADMIN"] = "ADMIN";
    Role["EDITOR"] = "EDITOR";
    Role["AUTHOR"] = "AUTHOR";
    Role["INSTRUCTOR"] = "INSTRUCTOR";
    Role["STUDENT"] = "STUDENT";
    Role["GUEST"] = "GUEST";
})(Role || (Role = {}));
export var Permission;
(function (Permission) {
    // User Management
    Permission["MANAGE_USERS"] = "MANAGE_USERS";
    Permission["VIEW_USERS"] = "VIEW_USERS";
    // Content Management
    Permission["MANAGE_POSTS"] = "MANAGE_POSTS";
    Permission["PUBLISH_POSTS"] = "PUBLISH_POSTS";
    // Media Management
    Permission["UPLOAD_MEDIA"] = "UPLOAD_MEDIA";
    Permission["DELETE_MEDIA"] = "DELETE_MEDIA";
    // System
    Permission["MANAGE_SETTINGS"] = "MANAGE_SETTINGS";
    Permission["VIEW_LOGS"] = "VIEW_LOGS";
})(Permission || (Permission = {}));
const RolePermissions = {
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
    static hasPermission(role, permission) {
        const permissions = RolePermissions[role];
        return permissions ? permissions.includes(permission) : false;
    }
    static getPermissions(role) {
        return RolePermissions[role] || [];
    }
}
//# sourceMappingURL=rbac.js.map