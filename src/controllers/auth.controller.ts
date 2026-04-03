import { FastifyReply, FastifyRequest } from "fastify";
import User from "../models/user.model"
import { ROLES, UserRole } from "../constants/roles"
import { errorResponse, successResponse } from "../utils/responseHandler";
import { loginInput, SignUpInput } from "../validators/auth.schema";
import { config } from "../config/env";
import { durationToSeconds, generateToken } from "../utils/jwt";


export const signUpUserHandler = async (req: FastifyRequest<{ Body: SignUpInput }>, reply: FastifyReply) => {
    try {
        // Request Body Already Validated in routes
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return errorResponse(reply, "User already exists", 400);
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password,
            role: role || ROLES.VIEWER
        })

        return successResponse(reply, {
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }, "User created successfully", 201);

    } catch (error) {
        return errorResponse(reply, "Failed to create user", 500, error);
    }
}

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
        const token = generateToken({ _id: user._id.toString(), email: user.email, role: user.role });

        // Set Cookie
        reply.setCookie("token", token, {
            httpOnly: true,
            secure: config.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: durationToSeconds(config.JWT_EXPIRES_IN), //Takes "7d" and converts to seconds
            path: "/",
        });

        return successResponse(reply, {
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }, "User logged in successfully", 200);

    } catch (error) {
        return errorResponse(reply, "Failed to login user", 500, error);
    }
}

//Verify User (ADMIN ONLY)
export const verifyUserHandler = async (req: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) => {
    try {
        const { userId } = req.params;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return errorResponse(reply, "User not found", 404);
        }

        // Verify user
        user.isVerified = true;
        await user.save();

        return successResponse(reply, {}, "User verified successfully", 200);

    } catch (error) {
        return errorResponse(reply, "Failed to verify user", 500, error);
    }
}

//Update User Role (ADMIN ONLY)
export const updateUserRoleHandler = async (req: FastifyRequest<{ Params: { userId: string }, Body: { role: UserRole } }>, reply: FastifyReply) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return errorResponse(reply, "User not found", 404);
        }

        // Update user role
        user.role = role;
        await user.save();

        return successResponse(reply, {}, "User role updated successfully", 200);

    } catch (error) {
        return errorResponse(reply, "Failed to update user role", 500, error);
    }
}

//Delete User (ADMIN ONLY)
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

//Get All Users (ADMIN ONLY)
export const getAllUsersHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const users = await User.find({ isDeleted: false });
        return successResponse(reply, users, "Users fetched successfully", 200);
    } catch (error) {
        return errorResponse(reply, "Failed to fetch users", 500, error);
    }
}