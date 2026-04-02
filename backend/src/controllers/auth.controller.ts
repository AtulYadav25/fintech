import { FastifyReply, FastifyRequest } from "fastify";
import User from "../models/user.model"
import { ROLES } from "../constants/roles"
import { errorResponse, successResponse } from "../utils/responseHandler";
import { SignUpInput } from "../validators/auth.schema";


export const signUpUser = async (req: FastifyRequest<{ Body: SignUpInput }>, reply: FastifyReply) => {
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