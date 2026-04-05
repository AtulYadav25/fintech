import { FastifyInstance } from "fastify";
import { authMiddleware, hasPermissions } from "../middlewares/auth";
import { createTransactionSchema, UpdateTransactionSchema, GetAllTransactionsParams, GetSummarizeTransactionQuery, TransactionResponseSchema, transactionSummarySchema } from "../validators/transaction.schema";
import * as TransactionController from "../controllers/transaction.controller";
import { PERMISSIONS } from "../constants/roles";
import z from "zod"
import { createSuccessResponseSchema, createErrorResponseSchema, createPaginatedResponseSchema } from "../validators/response.schema";

export const transactionRoutes = async (app: FastifyInstance) => {

    app.addHook("preHandler", authMiddleware)

    //Create Transaction
    app.post("/", {
        schema: {
            description: "Create transaction: ADMIN only access",
            body: createTransactionSchema,
            response: {
                201: createSuccessResponseSchema(TransactionResponseSchema), //Transaction Created
                400: createErrorResponseSchema(), //Invalid Transaction Data
                500: createErrorResponseSchema() //Internal Server Error
            }
        },
        preHandler: hasPermissions([PERMISSIONS.CREATE])
    }, TransactionController.createTransactionHandler)

    //Update Transaction
    app.patch("/:id", {
        schema: {
            description: "Update transaction: ADMIN only access",
            body: UpdateTransactionSchema,
            response: {
                200: createSuccessResponseSchema(TransactionResponseSchema), //Transaction Updated
                400: createErrorResponseSchema(), //Invalid Transaction Data
                404: createErrorResponseSchema(), //Transaction Not Found
                500: createErrorResponseSchema() //Internal Server Error
            }
        },
        preHandler: hasPermissions([PERMISSIONS.UPDATE])
    }, TransactionController.updateTransactionHandler)

    //Delete Transaction
    app.delete("/:id", {
        schema: {
            description: "Delete transaction: ADMIN only access",
            params: z.object({ id: z.string() }),
            response: {
                200: createSuccessResponseSchema(), //Transaction Deleted
                400: createErrorResponseSchema(), //Invalid Transaction Data
                404: createErrorResponseSchema(), //Transaction Not Found
                500: createErrorResponseSchema() //Internal Server Error
            }
        },
        preHandler: hasPermissions([PERMISSIONS.DELETE])
    }, TransactionController.deleteTransactionHandler)

    //Get All Transactions
    app.get("/", {
        schema: {
            description: "Get all transactions. Access: ADMIN & ANALYST only access. Analyst can access transactions of their own department only, ADMIN can access all department transactions.",
            querystring: GetAllTransactionsParams,
            response: {
                200: createPaginatedResponseSchema(z.array(TransactionResponseSchema)), //Array of Transactions
                400: createErrorResponseSchema(), //Invalid Transaction Data
                500: createErrorResponseSchema() //Internal Server Error
            }
        },
        preHandler: hasPermissions([PERMISSIONS.READ_LIMITED])
    }, TransactionController.getAllTransactionsHandler)

    //Get Summarized Transaction
    app.get("/summary", {
        schema: {
            description: "Get summarized transaction. Access: ADMIN & ANALYST only access. Analyst can access transactions of their own department only, ADMIN can access all department transactions.",
            querystring: GetSummarizeTransactionQuery,
            response: {
                200: createSuccessResponseSchema(transactionSummarySchema), //Summarized Transaction
                400: createErrorResponseSchema(), //Invalid Transaction Data
                404: createErrorResponseSchema(), //Transaction Not Found
                500: createErrorResponseSchema() //Internal Server Error
            }
        },
        preHandler: hasPermissions([PERMISSIONS.READ_ALL])
    }, TransactionController.getAllTransactionsSummaryHandler)

}

/**
 * @route POST /transactions
 * @description Create a new transaction
 * @access Private (Authenticated users with CREATE permission)
 * @body {number} amount - The amount of the transaction
 * @body {string} type - The type of the transaction (income or expense)
 * @body {string} category - The category of the transaction
 * @body {string} date - The date of the transaction
 * @body {string} description - The description of the transaction
 * @body {string} reference - The reference of the transaction
 * @returns {TransactionResponseSchema} - The created transaction
 */

/**
 * @route PUT /transactions/:id
 * @description Update a transaction
 * @access Private (Authenticated users with UPDATE permission)
 * @param {string} id - The ID of the transaction to update
 * @body {number} [amount] - The amount of the transaction
 * @body {string} [type] - The type of the transaction (income or expense)
 * @body {string} [category] - The category of the transaction
 * @body {string} [date] - The date of the transaction
 * @body {string} [description] - The description of the transaction
 * @body {string} [reference] - The reference of the transaction
 * @returns {object} - The updated transaction
 */

/**
 * @route GET /transactions
 * @description Get all transactions for a user
 * @access Private (Authenticated users with READ_LIMITED permission)
 * @query {number} [page] - The page number
 * @query {number} [limit] - The number of transactions per page
 * @query {string} [category] - The category of the transaction
 * @query {string} [type] - The type of the transaction (income or expense)
 * @query {string} [startDate] - The start date of the transaction
 * @query {string} [endDate] - The end date of the transaction
 * @query {string} [userId] - The ID of the user
 * @returns {transactionSummarySchema} - The list of transactions
 */