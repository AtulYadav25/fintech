import z from "zod";


export const sendMessageSchema = z.object({
    message: z.string().min(1, "Message is required"),
    sessionId: z.string().optional(),
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
