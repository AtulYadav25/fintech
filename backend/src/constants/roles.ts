export const ROLES = {
    VIEWER: "viewer",
    ANALYST: "analyst",
    ADMIN: "admin"
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];