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

    //Verify User (ADMIN ONLY)
    app.patch("/verify/:userId", {
        schema: { params: z.object({ userId: z.string() }) },
        preHandler: [authMiddleware, hasPermissions([PERMISSIONS.MANAGE_USERS])]
    }, AuthController.verifyUserHandler)

    //Update User Role
    app.patch("/role/:userId", {
        schema: { params: z.object({ userId: z.string() }), body: z.object({ role: z.enum(Object.values(ROLES)) }) },
        preHandler: [authMiddleware, hasPermissions([PERMISSIONS.MANAGE_USERS])]
    }, AuthController.updateUserRoleHandler)

    //Delete User
    app.delete("/:userId", {
        schema: { params: z.object({ userId: z.string() }) },
        preHandler: [authMiddleware, hasPermissions([PERMISSIONS.MANAGE_USERS])]
    }, AuthController.deleteUserHandler)

    //Get All Users

    app.get("/", {
        preHandler: [authMiddleware, hasPermissions([PERMISSIONS.MANAGE_USERS])]
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
 * @route PATCH /role/:userId
 * @description Update a user role, only role with permission manage:user can access
 * @access Private (Admin only)
 * @param {string} userId - The ID of the user to update
 * @body {string} role - The new role of the user
 * @returns {object} - Success message
*/