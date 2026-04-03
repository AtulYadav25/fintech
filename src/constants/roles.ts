export const ROLES = {
    VIEWER: "viewer",
    ANALYST: "analyst",
    ADMIN: "admin"
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const PERMISSIONS = {
    READ_LIMITED: "read:limited",
    READ_ALL: "read:all",
    CREATE: "create",
    UPDATE: "update",
    DELETE: "delete",
    MANAGE_USERS: "manage:users"
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    [ROLES.VIEWER]: [PERMISSIONS.READ_LIMITED],
    [ROLES.ANALYST]: [PERMISSIONS.READ_LIMITED, PERMISSIONS.READ_ALL],
    [ROLES.ADMIN]: [PERMISSIONS.READ_LIMITED, PERMISSIONS.READ_ALL, PERMISSIONS.CREATE, PERMISSIONS.UPDATE, PERMISSIONS.DELETE, PERMISSIONS.MANAGE_USERS]
};