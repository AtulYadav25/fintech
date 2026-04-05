import Transaction, { ITransaction } from "../models/transaction.model";
import { GetSummarizeTransactionQuery, type GetAllTransactionsParams } from "../validators/transaction.schema";
import redisClient from "../config/redis";

/**
 * Get all transactions for a user
 * @param {GetAllTransactionsParams} params - Parameters for filtering transactions
 * @returns {Promise<ITransaction[]>} - Array of transactions
 */

export const getAllTransactions = async ({
    page,
    limit,
    type,
    category,
    startDate,
    endDate,
    tags,
    userId,
    department
}: GetAllTransactionsParams) => {

    const filter: any = {
        isDeleted: false
    };

    if (userId) filter.userId = userId;
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (department) filter.department = department;
    if (tags) filter.tags = tags;
    if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = startDate;
        if (endDate) filter.date.$lte = endDate;
    }

    const transactions = await Transaction.find(filter)
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    return transactions;
}


/**
 * Update a transaction
 * @param {string} id - Transaction ID
 * @param {Partial<ITransaction>} updateData - Partial fields to update
 * @returns {Promise<ITransaction>} - Updated transaction
 */
export const updateTransaction = async (id: string, updateData: Partial<ITransaction>) => {

    const setData = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== undefined)
    );
    const transaction = await Transaction.findById(id);
    if (!transaction) {
        throw new Error("NOT_FOUND");
    }
    transaction.set(setData);
    await transaction.save();
    return transaction;
}


/**
 * Delete a transaction
 * @param {string} id - Transaction ID
 * @returns {Promise<ITransaction>} - Deleted transaction
 */
export const deleteTransaction = async (id: string) => {
    const transaction = await Transaction.findById(id);
    if (!transaction) {
        throw new Error("NOT_FOUND");
    }
    transaction.isDeleted = true;
    await transaction.save();
    return transaction;
}


//Get Transaction Summary
/**
 * Get all transactions for a user with optional filtering and summarized response within given date range
 * @param {GetSummarizeTransactionParams} params - Parameters for filtering transactions
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
export const getTransactionsSummary = async ({
    startDate,
    endDate,
    userId,
    department,
    role
}: GetSummarizeTransactionQuery) => {


    //Check cache first
    const cacheKey = `tx_summary:${department || "all"}:${startDate?.toISOString() || "all"}:${endDate?.toISOString() || "all"}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        const parsed =
            typeof cachedData === "string"
                ? JSON.parse(cachedData)
                : JSON.parse(cachedData.toString());

        return parsed;
    }

    const match: any = {
        isDeleted: { $ne: true },
    };

    //Add userId only if provided
    if (userId) {
        match.userId = userId;
    }

    //Add department only if provided
    if (department) {
        match.department = department;
    }

    //Add date filter only if provided
    if (startDate || endDate) {
        match.date = {};

        if (startDate) {
            match.date.$gte = startDate;
        }

        if (endDate) {
            match.date.$lte = endDate;
        }
    }


    const [summary] = await Transaction.aggregate([
        {
            $match: match,
        },

        {
            $facet: {
                totals: [
                    {
                        $group: {
                            _id: null,
                            totalIncome: {
                                $sum: {
                                    $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
                                },
                            },
                            totalExpense: {
                                $sum: {
                                    $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
                                },
                            },
                        },
                    },
                ],

                // Category wise data aggregated
                categoryWise: [
                    {
                        $group: {
                            _id: "$category",
                            income: {
                                $sum: {
                                    $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
                                },
                            },
                            expense: {
                                $sum: {
                                    $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
                                },
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            category: "$_id",
                            income: 1,
                            expense: 1,
                        },
                    },
                ],

                departmentWise: [
                    {
                        $group: {
                            _id: "$department",
                            income: {
                                $sum: {
                                    $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
                                },
                            },
                            expense: {
                                $sum: {
                                    $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
                                },
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            department: "$_id",
                            income: 1,
                            expense: 1,
                        },
                    },
                ],

                // Recent Activity (last 15)
                recentActivity: [
                    { $sort: { date: -1 } },
                    { $limit: 15 },
                    {
                        $project: {
                            _id: 0,
                            id: "$_id",
                            amount: 1,
                            type: 1,
                            category: 1,
                            date: 1,
                            department: 1,
                            reference: 1,
                            description: 1,
                        },
                    },
                ],

                // Monthly Trends
                monthlyTrends: [
                    {
                        $group: {
                            _id: {
                                year: { $year: "$date" },
                                month: { $month: "$date" },
                            },
                            income: {
                                $sum: {
                                    $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
                                },
                            },
                            expense: {
                                $sum: {
                                    $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
                                },
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            month: {
                                $concat: [
                                    { $toString: "$_id.year" },
                                    "-",
                                    {
                                        $cond: [
                                            { $lt: ["$_id.month", 10] },
                                            { $concat: ["0", { $toString: "$_id.month" }] },
                                            { $toString: "$_id.month" },
                                        ],
                                    },
                                ],
                            },
                            income: 1,
                            expense: 1,
                            balance: { $subtract: ["$income", "$expense"] },
                        },
                    },
                    { $sort: { month: -1 } },
                ],
            },
        },

        // Final Response
        {
            $project: {
                totalIncome: { $arrayElemAt: ["$totals.totalIncome", 0] },
                totalExpense: { $arrayElemAt: ["$totals.totalExpense", 0] },
                netBalance: {
                    $subtract: [
                        { $arrayElemAt: ["$totals.totalIncome", 0] },
                        { $arrayElemAt: ["$totals.totalExpense", 0] },
                    ],
                },
                categoryWise: 1,
                departmentWise: 1,
                recentActivity: 1,
                monthlyTrends: 1,
            },
        },
    ]);

    //Store in Redis - Store for 2 hours
    await redisClient.setEx(cacheKey, 7200, JSON.stringify(summary));

    // Track this key
    await redisClient.sAdd(`tx_summary_keys:${department}`, cacheKey);

    if (!department) {
        await redisClient.sAdd(`tx_summary_keys:all`, cacheKey);
    }

    return summary || {
        totalIncome: 0,
        totalExpense: 0,
        netBalance: 0,
        categoryWise: [],
        departmentWise: [],
        recentActivity: [],
        monthlyTrends: [],
    };
};
//Example Response
/*
{
  "success": true,
  "data": {
    "totalIncome": 245000,
    "totalExpense": 98000,
    "netBalance": 147000,
    "categoryWise": [
      { "category": "Salary", "income": 200000, "expense": 0 },
      { "category": "Food", "income": 0, "expense": 25000 },
      { "category": "Rent", "income": 0, "expense": 45000 },
      ...
    ],
    "recentActivity": [
      { "id": "...", "amount": 5000, "type": "expense", "category": "Food", "date": "2026-04-01", "description": "Lunch" },
      ...
    ],
    "monthlyTrends": [
      { "month": "2026-03", "income": 120000, "expense": 45000, "balance": 75000 },
      { "month": "2026-02", "income": 110000, "expense": 52000, "balance": 58000 },
      ...
    ]
  }
}
  */