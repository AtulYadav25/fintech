import { FastifyReply, FastifyRequest } from "fastify";
import User from "../models/user.model"
import { ROLES, UserRole } from "../constants/roles"
import { errorResponse, successResponse } from "../utils/responseHandler";
import { loginInput, SignUpInput, userResponseSchema } from "../validators/auth.schema";
import { config } from "../config/env";
import { durationToSeconds, generateToken } from "../utils/jwt";

/**
 * @description Sign up user
 * @body name - Name of the user
 * @body email - Email of the user
 * @body password - Password of the user
 * @body [role] - Role of the user
 * @body department - Department of the user
 * @returns {Promise<{
            name: string,
            email: string,
            role: string,
            department: string,
            isVerified: boolean,
            createdAt: Date,
            updatedAt: Date
        }>}
 */
export const signUpUserHandler = async (req: FastifyRequest<{ Body: SignUpInput }>, reply: FastifyReply) => {
    try {
        // Request Body Already Validated in routes
        const { name, email, password, role, department } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return errorResponse(reply, "User already exists", 400);
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            department,
            password,
            role: role || ROLES.VIEWER
        })

        return successResponse(reply, userResponseSchema.parse(user), "User created successfully", 201);

    } catch (error) {
        return errorResponse(reply, "Failed to create user", 500, error);
    }
}

/**
 * @description Login user
 * @param email - Email of the user
 * @param password - Password of the user
 * @returns {Promise<{
            name: string,
            email: string,
            department: string,
            role: string,
            isVerified: boolean,
            createdAt: Date,
            updatedAt: Date
        }>}
 */
export const loginUserHandler = async (req: FastifyRequest<{ Body: loginInput }>, reply: FastifyReply) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return errorResponse(reply, "Invalid credentials", 401);
        }

        // Check if password is correct
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return errorResponse(reply, "Invalid credentials", 401);
        }

        // Check if user is verified
        if (!user.isVerified || user.isDeleted) {
            return errorResponse(reply, "Account not verified or deleted.", 403);
        }

        // Generate JWT Token
        const token = generateToken({ _id: user._id.toString(), email: user.email, role: user.role, department: user.department });

        //Make User Status active
        user.isActive = true;
        await user.save();

        // Set Cookie
        reply.setCookie("token", token, {
            httpOnly: true,
            secure: config.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: durationToSeconds(config.JWT_EXPIRES_IN), //Takes "7d" and converts to seconds
            path: "/",
        });

        return successResponse(reply, userResponseSchema.parse(user), "User logged in successfully", 200);

    } catch (error) {
        return errorResponse(reply, "Failed to login user", 500, error);
    }
}

//Logout User
export const logoutUserHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        reply.clearCookie("token");
        return successResponse(reply, {}, "User logged out successfully", 200);
    } catch (error) {
        return errorResponse(reply, "Failed to logout user", 500, error);
    }
}

//Verify User (ADMIN ONLY)
/**
 * @description Verify user
 * @param userId - ID of the user to verify
 * @returns {Promise<void>}
 */
export const verifyUserHandler = async (req: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) => {
    try {
        const { userId } = req.params;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return errorResponse(reply, "User not found", 404);
        }

        if (user.isVerified) {
            return errorResponse(reply, "User already verified", 400);
        }

        // Verify user
        user.isVerified = true;
        await user.save();

        return successResponse(reply, {}, "User verified successfully", 200);

    } catch (error) {
        console.log(error)
        return errorResponse(reply, "Failed to verify user", 500, error);
    }
}

//Update User (ADMIN ONLY)
/**
 * @description Update user role or department
 * @param userId - ID of the user to update
 * @body role - New role of the user
 * @body department - New department of the user
 * @returns {Promise<void>}
 */
export const updateUserHandler = async (req: FastifyRequest<{ Params: { userId: string }, Body: { role: UserRole, department: string } }>, reply: FastifyReply) => {
    try {
        const { userId } = req.params;
        const { role, department } = req.body;

        if (userId === req.user._id.toString()) {
            return errorResponse(reply, "You cannot update your own role", 400);
        }

        if (!role && !department) {
            return errorResponse(reply, "Please provide either role or department", 400);
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return errorResponse(reply, "User not found", 404);
        }

        // Update user role
        if (role) user.role = role;
        if (department) user.department = department;
        await user.save();

        return successResponse(reply, {}, "User updated successfully", 200);

    } catch (error) {
        return errorResponse(reply, "Failed to update user role", 500, error);
    }
}

//Delete User (ADMIN ONLY)
/**
 * @description Delete user
 * @param userId - ID of the user to delete
 * @returns {Promise<void>}
 */
export const deleteUserHandler = async (req: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) => {
    try {
        const { userId } = req.params;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return errorResponse(reply, "User not found", 404);
        }

        // Delete user
        user.isDeleted = true;
        user.email = `${user.email}_deleted_${Date.now()}`;
        user.deletedAt = new Date();
        await user.save();

        return successResponse(reply, {}, "User deleted successfully", 200);

    } catch (error) {
        return errorResponse(reply, "Failed to delete user", 500, error);
    }
}

//Get All Users (ADMIN Can Access All Department Users and Analyst can access only their own department users)
export const getAllUsersHandler = async (req: FastifyRequest<{ Querystring: { role: UserRole, department: string } }>, reply: FastifyReply) => {
    try {
        const { role, department } = req.user;
        const { role: queryRole, department: queryDepartment } = req.query;

        let filter: any = {
            isDeleted: false
        }

        //Admin can access all department users and Analyst can access only their own department users
        if (role === ROLES.ADMIN) {
            if (queryRole) filter.role = queryRole;
            if (queryDepartment) filter.department = queryDepartment;
        } else {
            filter.department = department
            if (queryRole) filter.role = queryRole;
        }

        const users = await User.find(filter);
        return successResponse(reply, userResponseSchema.array().parse(users), "Users fetched successfully", 200);
    } catch (error) {
        return errorResponse(reply, "Failed to fetch users", 500, error);
    }
}