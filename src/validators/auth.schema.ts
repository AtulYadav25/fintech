import z from "zod";
import { ROLES } from "../constants/roles";

export const signUpSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(Object.values(ROLES)).optional(),
    department: z.string().optional()
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 chars"),
});
export type loginInput = z.infer<typeof loginSchema>;


export const userResponseSchema = z.object({
    _id: z.string(),
    name: z.string(),
    email: z.string().email(),
    role: z.enum(Object.values(ROLES)),
    department: z.string(),
    isVerified: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date()
});
export type userResponse = z.infer<typeof userResponseSchema>;