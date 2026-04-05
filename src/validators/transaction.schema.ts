import z from "zod";
import { TRANSACTION_TYPES } from "../constants/transactions";

export const createTransactionSchema = z.object({
    userId: z.string().optional(), //Optional (Not to be accepted in request body but used as response schema) 
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
    userId: z.string().optional().describe("Only Admin Allowed for this filter"),
    department: z.string().optional().describe("Only Admin Allowed for this filter"),
    role: z.string().optional().describe("Only Admin Allowed for this filter"),
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



// Response Schemas

export const TransactionResponseSchema = z.object({
    _id: z.string(),
    userId: z.string(),
    amount: z.number(),
    type: z.enum(Object.values(TRANSACTION_TYPES)),
    category: z.string(),
    department: z.string(),
    date: z.string().transform((val) => new Date(val)),
    description: z.string().optional(),
    reference: z.string().optional(),
    createdAt: z.string().transform((val) => new Date(val)),
    updatedAt: z.string().transform((val) => new Date(val)),
})

export type TransactionResponseSchema = z.infer<typeof TransactionResponseSchema>;


// Reusable schemas
const categoryWiseSchema = z.object({
    category: z.string().nullable(),
    income: z.number(),
    expense: z.number(),
});

const departmentWiseSchema = z.object({
    department: z.string().nullable(),
    income: z.number(),
    expense: z.number(),
});

const recentActivitySchema = z.object({
    _id: z.string(),
    amount: z.number(),
    type: z.enum(["income", "expense"]),
    category: z.string().nullable(),
    date: z.coerce.date(),
    description: z.string().nullable().optional(),
});

const monthlyTrendSchema = z.object({
    month: z.string(),
    income: z.number(),
    expense: z.number(),
    balance: z.number(),
});

// Final summary schema
export const transactionSummarySchema = z.object({
    totalIncome: z.number(),
    totalExpense: z.number(),
    netBalance: z.number(),
    categoryWise: z.array(categoryWiseSchema),
    departmentWise: z.array(departmentWiseSchema),
    recentActivity: z.array(recentActivitySchema),
    monthlyTrends: z.array(monthlyTrendSchema),
});
