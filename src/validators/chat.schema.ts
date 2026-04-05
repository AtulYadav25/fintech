import z from "zod";


export const sendMessageSchema = z.object({
    message: z.string().min(1, "Message is required"),
    sessionId: z.string().optional(),
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>;


export const chatSessionResponseSchema = z.object({
    _id: z.string(),
    title: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
})

export type ChatSessionResponse = z.infer<typeof chatSessionResponseSchema>;


export const chatMessageResponseSchema = z.object({
    _id: z.string(),
    role: z.string(),
    content: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
})

export type ChatMessageResponse = z.infer<typeof chatMessageResponseSchema>;