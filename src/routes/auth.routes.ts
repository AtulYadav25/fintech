import { FastifyInstance } from "fastify";
import * as AuthController from "../controllers/auth.controller"
import { signUpSchema, loginSchema } from "../validators/auth.schema";
import z from "zod";
import { authMiddleware, hasPermissions } from "../middlewares/auth";
import { PERMISSIONS, ROLES } from "../constants/roles";
import { userResponseSchema } from "../validators/auth.schema";
import { createErrorResponseSchema, createSuccessResponseSchema } from "../validators/response.schema";

export const authRoutes = async (app: FastifyInstance) => {

    //SignUp User
    app.post("/signup", {
        schema: {
            body: signUpSchema,
            description: "Sign up user",
            response: {
                201: createSuccessResponseSchema(userResponseSchema), //User Created
                409: createErrorResponseSchema(), //User Already Exists
                500: createErrorResponseSchema() //Internal Server Error
            }
        }
    }, AuthController.signUpUserHandler)

    app.post("/login", {
        schema: {
            body: loginSchema,
            description: "Login user",
            response: {
                200: createSuccessResponseSchema(userResponseSchema), //User Logged In
                401: createErrorResponseSchema(), //Invalid Credentials
                403: createErrorResponseSchema(), //Account Not Verified or Deleted
                500: createErrorResponseSchema() //Internal Server Error
            }
        }
    }, AuthController.loginUserHandler)

    //Authenticated Routes

    //Logout User
    app.post("/logout", {
        schema: {
            description: "Logout user",
            response: {
                200: createSuccessResponseSchema(), //User Logged Out
                500: createErrorResponseSchema() //Internal Server Error
            }
        },
        preHandler: authMiddleware
    }, AuthController.logoutUserHandler)

    //Forgot Password
    // app.post("/forgot-password", AuthController.forgotPasswordHandler)

    //Reset Password
    // app.post("/reset-password", AuthController.resetPasswordHandler)

    //Verify User (ADMIN ONLY)
    app.patch("/verify/:userId", {
        schema: {
            description: "Verify user",
            params: z.object({ userId: z.string() }),
            response: {
                200: createSuccessResponseSchema(), //User Verified
                400: createErrorResponseSchema(), //User Already Verified
                404: createErrorResponseSchema(), //User Not Found
                500: createErrorResponseSchema() //Internal Server Error
            }
        },
        preHandler: [authMiddleware, hasPermissions([PERMISSIONS.MANAGE_USERS])]
    }, AuthController.verifyUserHandler)

    //Update User
    app.patch("/:userId", {
        schema: {
            description: "Update user role or department",
            params: z.object({ userId: z.string() }),
            body: z.object({ role: z.enum(Object.values(ROLES)).optional(), department: z.string().optional() }),
            response: {
                200: createSuccessResponseSchema(userResponseSchema), //User Updated
                400: createErrorResponseSchema(), //Please provide either role or department
                404: createErrorResponseSchema(), //User Not Found
                500: createErrorResponseSchema() //Internal Server Error
            }
        },
        preHandler: [authMiddleware, hasPermissions([PERMISSIONS.MANAGE_USERS])]
    }, AuthController.updateUserHandler)

    //Delete User
    app.delete("/:userId", {
        schema: {
            description: "Delete user",
            params: z.object({ userId: z.string() }),
            response: {
                200: createSuccessResponseSchema(), //User Deleted
                400: createErrorResponseSchema(), //You cannot delete your own account
                404: createErrorResponseSchema(), //User Not Found
                500: createErrorResponseSchema() //Internal Server Error
            }
        },
        preHandler: [authMiddleware, hasPermissions([PERMISSIONS.MANAGE_USERS])]
    }, AuthController.deleteUserHandler)

    //Get All User (ADMIN Can Access All Department Users and Analyst can access only their own department users)
    app.get("/users", {
        schema: {
            description: "Get all users",
            querystring: z.object({ role: z.enum(Object.values(ROLES)).optional(), department: z.string().optional() }),
            response: {
                200: createSuccessResponseSchema(z.array(userResponseSchema)), //Array of Users
                400: createErrorResponseSchema(), //Please provide either role or department
                404: createErrorResponseSchema(), //User Not Found
                500: createErrorResponseSchema() //Internal Server Error
            }
        },
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