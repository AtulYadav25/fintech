import { GoogleGenAI } from "@google/genai";
import { ChatSession, ChatMessage, IChatMessage } from "../models/chat.model";
import mongoose from "mongoose";
import { config } from "../config/env";
import { MESSAGE_ROLES } from "../constants/roles";
import { FastifyReply } from "fastify";

const ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });

const SCHEMA_DEFINITIONS = `
You have access to a MongoDB database with the following structure:

1. 'User' Collection:
{
  "name": "String", "email": "String", "isActive": "Boolean", "department": "String", "role": "String", "isVerified": "Boolean", "isDeleted": "Boolean"
}

2. 'Transaction' Collection:
{
  "userId": "ObjectId", "amount": "Number", "type": "String (income | expense)", "category": "String", "department": "String", "date": "Date", "description": "String", "reference": "String", "isDeleted": "Boolean"
}
`;


/**
 * @description Chat with AI
 * @param userId - ID of the user
 * @param message - Message from the user
 * @param sessionId - ID of the session
 * @returns {Promise<{type: "status" | "token" | "done" | "error", message: string}[]>} - SSE Stream
 */
export const chatWithAI = async ({ userId, role, department }: { userId: string, role: string, department: string }, message: string, sessionId: string | undefined, reply: FastifyReply) => {
    reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
    });

    const sendEvent = (type: "status" | "token" | "done" | "error", msg: string) => {
        reply.raw.write(`data: ${JSON.stringify({ type, message: msg })}\n\n`);
        console.log(type, " : ", msg);
    };

    reply.raw.on("close", () => {
        reply.raw.end();
    });

    try {
        let session;
        if (sessionId) {
            session = await ChatSession.findOne({ _id: sessionId, userId });
            if (!session) throw new Error("Chat session not found");
        } else {
            session = await ChatSession.create({ userId, title: message.substring(0, 40) });
        }

        await ChatMessage.create({ sessionId: session._id, role: MESSAGE_ROLES.USER, content: message });

        const recentMessages = await ChatMessage.find({ sessionId: session._id })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        recentMessages.reverse();

        const historyStr = recentMessages.map(m => `[${m.role}]: ${m.content}`).join("\\n");

        const queryPrompt = `
${SCHEMA_DEFINITIONS}

Previous Chat Context:
${historyStr}

Current Request:
[user]: ${message}

User Info:
{ userId: ${userId}, role: "${role}", department: "${department}" }

Instructions:
If the user's request requires fetching data from the MongoDB database, generate a valid JSON object describing the query. Only provide read queries (find or aggregation). Do not provide update queries. Always include { "isDeleted": false } in your filters.
CRITICAL: If the user's 'role' is NOT 'admin', you MUST strictly add a filter to your query/pipeline to only fetch data where the 'department' field exactly matches the user's department ("${department}"). Do not allow querying data from other departments.
If no data is needed, return {"collection": null}.
Return ONLY valid JSON. No markdown formatting or extra text.
For date filtering, assume dates are ISO strings or construct them properly if aggregate pipeline is used.

Your Response should be only in this JSON Format and no extra text or information
JSON RESPONSE STRICTLY EXPECTED:
{
  "collection": "User" | "Transaction" | null,
  "type": "find" | "aggregate",
  "query": {}, // for find
  "pipeline": [] // for aggregate
}
`;

        let dbData = null;
        try {
            const queryResponse = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: queryPrompt,
                config: {
                    responseMimeType: "application/json"
                }
            });

            const aiQueryStr = queryResponse.text?.trim() || "";
            const aiQuery = JSON.parse(aiQueryStr);

            if (aiQuery.collection) {
                sendEvent("status", "Fetching database records...");
                const Model = mongoose.models[aiQuery.collection];
                if (aiQuery.type === "aggregate" && aiQuery.pipeline && Array.isArray(aiQuery.pipeline)) {
                    const pipeline = [{ $match: { isDeleted: false } }, ...aiQuery.pipeline];
                    dbData = await Model.aggregate(pipeline);
                } else if (aiQuery.type === "find" && aiQuery.query) {
                    dbData = await Model.find({ ...aiQuery.query, isDeleted: false }).limit(100).lean();
                }
            }
        } catch (error) {
            console.error("AI JSON Error or DB Error:", error);
        }

        sendEvent("status", "Generating AI response...");
        const finalPrompt = `
${SCHEMA_DEFINITIONS}

Previous Chat Context:
${historyStr}

Current Request:
[user]: ${message}

Database Data Retrieved (if any):
${JSON.stringify(dbData)}

Provide a helpful response to the user's current request. Use the data retrieved if applicable. Keep the response professional.
`;

        const stream = await ai.models.generateContentStream({
            model: "gemini-3-flash-preview",
            contents: finalPrompt
        });

        let fullResponse = "";
        for await (const chunk of stream) {
            if (chunk.text) {
                fullResponse += chunk.text;
                sendEvent("token", chunk.text);
            }
        }

        await ChatMessage.create({ sessionId: session._id, role: MESSAGE_ROLES.MODEL, content: fullResponse });

        sendEvent("done", fullResponse);

    } catch (error: any) {
        sendEvent("error", error.message || "An error occurred");
    } finally {
        reply.raw.end();
    }
};

export const fetchChatSessions = async (userId: string) => {
    return ChatSession.find({ userId }).sort({ updatedAt: -1 });
};

/***
 * Fetch Chat Messages of a session provided
 * @description Fetch chat messages for a specific session
 * @param userId - ID of the user
 * @param sessionId - ID of the session
 * @returns {Promise<{ session: IChatMessage; messages: IChatMessage[] } | null>} - Session and messages
 */
export const fetchChatMessages = async (userId: string, sessionId: string) => {
    const session = await ChatSession.findOne({ _id: sessionId, userId });
    if (!session) return null;

    const messages = await ChatMessage.find({ sessionId }).sort({ createdAt: 1 });
    return { session, messages };
};


/***
 * Delete Chat Session
 * @description Delete chat session and its messages
 * @param userId - ID of the user
 * @param sessionId - ID of the session
 */
export const deleteChatSession = async (userId: string, sessionId: string) => {
    await ChatMessage.deleteMany({ sessionId });
    return ChatSession.findOneAndDelete({ _id: sessionId, userId });
};
