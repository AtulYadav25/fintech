import { FastifyReply, FastifyRequest } from "fastify";
import { CreateTransactionInput, type GetAllTransactionsParams, GetSummarizeTransactionParams, UpdateTransactionInput } from "../validators/transaction.schema";
import Transaction from "../models/transaction.model";
import { errorResponse, paginationResponse, successResponse } from "../utils/responseHandler";
import { deleteTransaction, getAllTransactions, getTransactionsSummary, updateTransaction } from "../services/transaction.service";
import { ROLES } from "../constants/roles";

/**
 * Create Transaction
 * @description: Create a new transaction
 * @access Private (Authenticated users with CREATE permission)
 * @param {CreateTransactionInput} req.body - Parameters for creating a transaction
 * @returns {Promise<ITransaction>} - Created transaction
 */
export const createTransactionHandler = async (req: FastifyRequest<{ Body: CreateTransactionInput }>, reply: FastifyReply) => {
    try {
        const { amount, type, category, date, description, reference, department } = req.body;

        const transaction = await Transaction.create({
            userId: req.user._id,
            amount,
            type,
            category,
            department,
            date,
            description,
            reference
        });

        return successResponse(reply, transaction, "Transaction created successfully", 201);
    } catch (error) {
        return errorResponse(reply, "Failed to create transaction", 500, error);
    }
}



//Update Transaction
/**
 * @route PATCH /transactions/:id
 * @description Update a transaction
 * @access Private (Authenticated users with UPDATE permission)
 *
 * @param {string} req.params.id - Transaction ID
 * @body {UpdateTransactionInput} req.body - Fields to update
 *
 * @returns {200} Transaction updated successfully
 * @returns {404} Transaction not found
 * @returns {500} Failed to update transaction
 */
export const updateTransactionHandler = async (req: FastifyRequest<{ Body: UpdateTransactionInput, Params: { id: string } }>, reply: FastifyReply) => {
    try {
        const { amount, type, category, date, description, reference, department } = req.body;

        const transaction = await updateTransaction(req.params.id, {
            amount,
            type,
            category,
            department,
            date,
            description,
            reference
        }
        );

        return successResponse(reply, transaction, "Transaction updated successfully", 200);
    } catch (error) {
        return errorResponse(reply, "Failed to update transaction", 500, error);
    }
}


//Delete Transaction
/**
 * @route DELETE /transactions/:id
 * @description Delete a transaction
 * @access Private (Authenticated users with DELETE permission)
 *
 * @param {string} req.params.id - Transaction ID
 *
 * @returns {200} Transaction deleted successfully
 * @returns {404} Transaction not found
 * @returns {500} Failed to delete transaction
 */
export const deleteTransactionHandler = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
        const transaction = await deleteTransaction(req.params.id);
        return successResponse(reply, transaction, "Transaction deleted successfully", 200);
    } catch (error) {
        return errorResponse(reply, "Failed to delete transaction", 500, error);
    }
}



/**
 * Get All Transactions
 * @description: Get all transactions for a user with optional filtering and pagination
 * @access Private (Authenticated users with READ_LIMITED permission)
 * @param {GetAllTransactionsParams} req.query - Parameters for filtering transactions
 * @returns {Promise<ITransaction[]>} - Array of transactions
 */
export const getAllTransactionsHandler = async (req: FastifyRequest<{ Querystring: GetAllTransactionsParams }>, reply: FastifyReply) => {
    try {
        const { page = 1, limit = 10, category, type, startDate, endDate, userId, department } = req.query;
        const { role, department: userDepartment } = req.user;

        //Get Filtered Transactions
        const transactions = await getAllTransactions({
            page,
            limit,
            category,
            type,
            startDate,
            endDate,
            userId: role === ROLES.ADMIN || role === ROLES.ANALYST ? userId : req.user._id, //Admin can view all transactions, analyst and viewer can only view their own transactions
            department: role === ROLES.ADMIN ? department : userDepartment //Admin can view all departments, analyst and viewer can only view their own department
        });

        //Returns Paginated Response
        return paginationResponse(
            reply,
            transactions,
            Number(page),
            Number(limit),
            "Transactions fetched successfully",
            200
        );

    } catch (error) {
        return errorResponse(reply, "Failed to fetch transactions", 500, error);
    }
}


//Get All Transaction Summarized Response
/**
 * @route GET /transactions/summary
 * @description Get all transactions for a user with optional filtering and summarized response within given date range
 * @access Private (Authenticated users with READ_ALL permission)
 * @param {GetSummarizeTransactionParams} req.query - Parameters for filtering transactions
 * @returns {Promise<{
 *   success: boolean;
 *   message: string;
 *   data: {
 *     totals: {
 *       totalIncome: number;
 *       totalExpense: number;
 *     };
 *     categoryWise: {
 *       category: string;
 *       income: number;
 *       expense: number;
 *     }[];
 *     recentActivity: {
 *       id: string;
 *       amount: number;
 *       type: string;
 *       category: string;
 *       date: string;
 *       description: string;
 *     }[];
 *     monthlyTrends: {
 *       month: string;
 *       income: number;
 *       expense: number;
 *       balance: number;
 *     }[];
 *   };
 *   statusCode: number;
 * }>} - Summarized transaction data
 */

export const getAllTransactionsSummaryHandler = async (req: FastifyRequest<{ Querystring: GetSummarizeTransactionParams }>, reply: FastifyReply) => {
    try {
        const { startDate, endDate, userId, department } = req.query;
        const { role, department: userDepartment } = req.user;

        //Get Filtered Transactions
        const data = await getTransactionsSummary({
            startDate,
            endDate,
            userId: role === ROLES.ADMIN || role === ROLES.ANALYST ? userId : req.user._id,
            department: role === ROLES.ADMIN ? department : userDepartment
        });

        //Returns Paginated Response
        return successResponse(
            reply,
            data,
            "Transactions summary fetched successfully",
            200
        );

    } catch (error) {
        return errorResponse(reply, "Failed to fetch transactions summary", 500, error);
    }
}