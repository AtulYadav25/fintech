import { FastifyReply, FastifyRequest } from "fastify";
import { chatWithAI, fetchChatSessions, fetchChatMessages, deleteChatSession } from "../services/chat.service";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { SendMessageInput } from "../validators/chat.schema";

export const sendMessage = async (req: FastifyRequest<{ Body: SendMessageInput }>, reply: FastifyReply) => {
    const { message, sessionId } = req.body;

    return chatWithAI({
        userId: req.user._id,
        role: req.user.role,
        department: req.user.department
    }, message, sessionId, reply);
};

export const getChatSessions = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const userId = req.user._id;
        const sessions = await fetchChatSessions(userId);
        return successResponse(reply, sessions, "Chat sessions fetched successfully", 200);
    } catch (error) {
        return errorResponse(reply, "Failed to fetch chat sessions", 500, error);
    }
};

export const getSessionMessages = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
        const userId = req.user._id;
        const data = await fetchChatMessages(userId, req.params.id);
        if (!data) {
            return errorResponse(reply, "Chat session not found", 404);
        }
        return successResponse(reply, data, "Chat messages fetched successfully", 200);
    } catch (error) {
        return errorResponse(reply, "Failed to fetch chat messages", 500, error);
    }
};

export const removeChatSession = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
        const userId = req.user._id;
        await deleteChatSession(userId, req.params.id);
        return successResponse(reply, null, "Chat session deleted successfully", 200);
    } catch (error) {
        return errorResponse(reply, "Failed to delete chat session", 500, error);
    }
};
