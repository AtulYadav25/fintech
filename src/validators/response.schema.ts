import { z, ZodTypeAny } from "zod";


export const createSuccessResponseSchema = <T extends ZodTypeAny>(dataSchema?: T) =>
    z.object({
        success: z.literal(true),
        message: z.string(),
        data: dataSchema ? dataSchema : z.null(),
        error: z.null().optional()
    });


export const createErrorResponseSchema = () =>
    z.object({
        success: z.literal(false),
        message: z.string(),
        data: z.null(),
        error: z.object({
            message: z.union([z.string(), z.array(z.string())]),
            code: z.string().optional(),
            details: z.any().optional()
        })
    });


export const createPaginatedResponseSchema = <T extends ZodTypeAny>(dataSchema: T) =>
    z.object({
        success: z.literal(true),
        message: z.string(),
        data: z.array(dataSchema),
        meta: z.object({
            page: z.number(),
            limit: z.number(),
            hasNextPage: z.boolean(),
            hasPrevPage: z.boolean()
        })
    });