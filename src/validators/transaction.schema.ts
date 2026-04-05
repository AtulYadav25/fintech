import z from "zod";
import { TRANSACTION_TYPES } from "../constants/transactions";

export const createTransactionSchema = z.object({
    amount: z.number().positive("Amount must be positive"),
    type: z.enum(Object.values(TRANSACTION_TYPES), { message: "Type must be income or expense" }),
    category: z.string().min(1, "Category is required"),
    department: z.string().min(1, "Department is required"),
    date: z.string().transform((val) => new Date(val)).refine((val) => !isNaN(val.getTime()), { message: "Invalid Date" }),
    description: z.string().optional(),
    reference: z.string().optional(),
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

export const GetAllTransactionsParams = z.object({
    page: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : 1)),

    limit: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : 10)),

    type: z.string().optional(),
    department: z.string().optional(),
    category: z
        .union([z.string(), z.array(z.string())])
        .optional()
        .transform((val) => {
            if (!val) return undefined;
            return typeof val === "string" ? [val] : val;
        }),

    startDate: z
        .string()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined)),

    endDate: z
        .string()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined)),

    userId: z.string().optional(),
});

export type GetAllTransactionsParams = z.infer<typeof GetAllTransactionsParams>;

export const UpdateTransactionSchema = z.object({
    amount: z.number().positive("Amount must be positive").optional(),
    type: z.enum(Object.values(TRANSACTION_TYPES), { message: "Type must be income or expense" }).optional(),
    category: z.string().min(1, "Category is required").optional(),
    department: z.string().min(1, "Department is required").optional(),
    date: z.string().transform((val) => new Date(val)).optional(),
    description: z.string().optional(),
    reference: z.string().optional(),
})

export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>;

//Get Summarize Transaction
export const GetSummarizeTransactionQuery = z.object({
    userId: z.string().optional(),
    department: z.string().optional(),
    role: z.string().optional(),
    startDate: z
        .string()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined)),

    endDate: z
        .string()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined)),
})

export type GetSummarizeTransactionQuery = z.infer<typeof GetSummarizeTransactionQuery>;


export const TransactionResponseSchema = z.object({
    _id: z.string(),
    amount: z.number(),
    type: z.enum(Object.values(TRANSACTION_TYPES)),
    category: z.string(),
    department: z.string(),
    date: z.date(),
    description: z.string().optional(),
    reference: z.string().optional(),
    userId: z.string(),
    createdAt: z.date(),
    updatedAt: z.date()
})

export type TransactionResponse = z.infer<typeof TransactionResponseSchema>;