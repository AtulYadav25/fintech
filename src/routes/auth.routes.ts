import { FastifyInstance } from "fastify";
import * as AuthController from "../controllers/auth.controller"
import { signUpSchema, loginSchema } from "../validators/auth.schema";
import z from "zod";
import { authMiddleware, hasPermissions } from "../middlewares/auth";
import { PERMISSIONS, ROLES } from "../constants/roles";

export const authRoutes = async (app: FastifyInstance) => {

    //SignUp User
    app.post("/signup", { schema: { body: signUpSchema } }, AuthController.signUpUserHandler)
    app.post("/login", { schema: { body: loginSchema } }, AuthController.loginUserHandler)

    //Authenticated Routes

    //Logout User
    app.post("/logout", { preHandler: authMiddleware }, AuthController.logoutUserHandler)

    //Forgot Password
    // app.post("/forgot-password", AuthController.forgotPasswordHandler)

    //Reset Password
    // app.post("/reset-password", AuthController.resetPasswordHandler)

    //Verify User (ADMIN ONLY)
    app.patch("/verify/:userId", {
        schema: { params: z.object({ userId: z.string() }) },
        preHandler: [authMiddleware, hasPermissions([PERMISSIONS.MANAGE_USERS])]
    }, AuthController.verifyUserHandler)

    //Update User
    app.patch("/:userId", {
        schema: { params: z.object({ userId: z.string() }), body: z.object({ role: z.enum(Object.values(ROLES)).optional(), department: z.string().optional() }) },
        preHandler: [authMiddleware, hasPermissions([PERMISSIONS.MANAGE_USERS])]
    }, AuthController.updateUserHandler)

    //Delete User
    app.delete("/:userId", {
        schema: { params: z.object({ userId: z.string() }) },
        preHandler: [authMiddleware, hasPermissions([PERMISSIONS.MANAGE_USERS])]
    }, AuthController.deleteUserHandler)

    //Get All User (ADMIN Can Access All Department Users and Analyst can access only their own department users)
    app.get("/users", {
        schema: { querystring: z.object({ role: z.enum(Object.values(ROLES)).optional(), department: z.string().optional() }) },
        preHandler: [authMiddleware, hasPermissions([PERMISSIONS.READ_ALL])]
    }, AuthController.getAllUsersHandler)
}

/**
    * @route PATCH /verify/:userId
    * @description Verify a user, only role with permission manage:user can access
    * @access Private (Admin only)
    * @param {string} userId - The ID of the user to verify
    * @returns {object} - Success message
*/

/**
 * @route PATCH /:userId
 * @description Update a user role or department, only role with permission manage:user can access
 * @access Private (Admin only)
 * @param {string} userId - The ID of the user to update
 * @body {string} role - The new role of the user
 * @body {string} department - The new department of the user
 * @returns {object} - Success message
*/

/**
 * @route GET /all
 * @description Get all users, only role with permission read:all can access
 * @access Private (Admin and Analyst)
 * @returns {object} - Array of users
*/