import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { sendMessage, getChatSessions, getSessionMessages, removeChatSession } from "../controllers/chat.controller";
import { authMiddleware } from "../middlewares/auth";
import { ROLES } from "../constants/roles";
import { sendMessageSchema } from "../validators/chat.schema";

export const chatRoutes = async (app: FastifyInstance) => {
    const restrictToAnalystOrAdmin = async (req: FastifyRequest, reply: FastifyReply) => {
        if (req.user.role !== ROLES.ADMIN && req.user.role !== ROLES.ANALYST) {
            return reply.code(403).send({ message: "Unauthorized: Insufficient permissions for Chat feature" });
        }
    };

    app.addHook("preHandler", authMiddleware);
    app.addHook("preHandler", restrictToAnalystOrAdmin);

    // Chat functionality endpoints
    app.post("/",
        { schema: { body: sendMessageSchema } },
        sendMessage);

    app.get("/", getChatSessions);
    app.get("/:id", getSessionMessages);
    app.delete("/:id", removeChatSession);
}
