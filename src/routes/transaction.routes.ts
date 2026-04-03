import { FastifyInstance } from "fastify";
import { authMiddleware, hasPermissions } from "../middlewares/auth";
import { createTransactionSchema, UpdateTransactionSchema, GetAllTransactionsParams } from "../validators/transaction.schema";
import * as TransactionController from "../controllers/transaction.controller";
import { PERMISSIONS } from "../constants/roles";
import z from "zod"

export const transactionRoutes = async (app: FastifyInstance) => {

    app.addHook("preHandler", authMiddleware)

    //Create Transaction
    app.post("/", {
        schema: { body: createTransactionSchema },
        preHandler: hasPermissions([PERMISSIONS.CREATE])
    }, TransactionController.createTransactionHandler)

    //Update Transaction
    app.patch("/:id", {
        schema: { body: UpdateTransactionSchema },
        preHandler: hasPermissions([PERMISSIONS.UPDATE])
    }, TransactionController.updateTransactionHandler)

    //Delete Transaction
    app.delete("/:id", {
        schema: { params: z.object({ id: z.string() }) },
        preHandler: hasPermissions([PERMISSIONS.DELETE])
    }, TransactionController.deleteTransactionHandler)

    //Get All Transactions
    app.get("/", {
        schema: { querystring: GetAllTransactionsParams },
        preHandler: hasPermissions([PERMISSIONS.READ_LIMITED])
    }, TransactionController.getAllTransactionsHandler)

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
 * @returns {object} - The created transaction
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
 * @returns {object} - The list of transactions
 */