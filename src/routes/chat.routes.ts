import { FastifyInstance } from "fastify";
import { sendMessage, getChatSessions, getSessionMessages, removeChatSession } from "../controllers/chat.controller";
import { authMiddleware, hasPermissions } from "../middlewares/auth";
import { PERMISSIONS } from "../constants/roles";
import { sendMessageSchema } from "../validators/chat.schema";

export const chatRoutes = async (app: FastifyInstance) => {

    app.addHook("preHandler", authMiddleware);
    app.addHook("preHandler", hasPermissions([PERMISSIONS.AI_CHAT]));

    // Chat functionality endpoints
    app.post("/",
        { schema: { body: sendMessageSchema } },
        sendMessage);

    app.get("/", getChatSessions);
    app.get("/:id", getSessionMessages);
    app.delete("/:id", removeChatSession);
}
