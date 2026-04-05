import { FastifyInstance } from "fastify";
import { sendMessage, getChatSessions, getSessionMessages, removeChatSession } from "../controllers/chat.controller";
import { authMiddleware, hasPermissions } from "../middlewares/auth";
import { PERMISSIONS } from "../constants/roles";
import { chatMessageResponseSchema, chatSessionResponseSchema, sendMessageSchema } from "../validators/chat.schema";
import { createErrorResponseSchema, createSuccessResponseSchema } from "../validators/response.schema";
import z from "zod";

export const chatRoutes = async (app: FastifyInstance) => {

    app.addHook("preHandler", authMiddleware);
    app.addHook("preHandler", hasPermissions([PERMISSIONS.AI_CHAT]));

    // Chat functionality endpoints
    app.post("/",
        {
            schema: {
                body: sendMessageSchema,
                description: "Send a message to the AI. SSE Type Response",

            }
        },
        sendMessage);

    app.get("/",
        {
            schema: {
                description: "Get all chat sessions",
                response: {
                    200: createSuccessResponseSchema(z.array(chatSessionResponseSchema)),
                    500: createErrorResponseSchema()
                }
            }
        },
        getChatSessions);

    app.get("/:id",
        {
            schema: {
                description: "Get messages of a chat session",
                response: {
                    200: createSuccessResponseSchema(z.array(chatMessageResponseSchema)),
                    500: createErrorResponseSchema()
                }
            }
        },
        getSessionMessages);

    app.delete("/:id",
        {
            schema: {
                description: "Delete a chat session",
                response: {
                    200: createSuccessResponseSchema(),
                    500: createErrorResponseSchema()
                }
            }
        },
        removeChatSession);
}
