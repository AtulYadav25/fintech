import { FastifyReply } from "fastify";
import { ZodError } from "zod";

/** 
 * successResponse
 * @param {FastifyReply} reply - Fastify reply object
 * @param {Object} responseData - Response data
 * @param {String} message - Success message
 * @param {Number} statusCode - HTTP status code (default 200)
*/

export const successResponse = (reply: FastifyReply, responseData = {}, message = "Success", statusCode = 200) => {
    return reply.code(statusCode).send({
        success: true,
        message,
        data: responseData,
    });
};

/** 
 * errorResponse
 * @param {FastifyReply} reply - Fastify reply object
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code (default 500)
 * @param {Object} error - Error object
*/

export const errorResponse = (reply: FastifyReply, message = "Something went wrong", statusCode = 500, error = null) => {

    //Handles Zod Validation Errors
    if (error instanceof ZodError) {
        const formattedErrors = error.issues.map(err => ({
            field: err.path[0],
            message: err.message
        }));

        return reply.code(400).send({
            success: false,
            message,
            data: null,
            error: formattedErrors
        });
    }

    //Handles All Other Errors
    return reply.code(statusCode).send({
        success: false,
        message,
        data: null,
        error
    });
};



/**
 * Standard pagination response formatter
 * @param {Object} reply - Fastify reply object
 * @param {Array} data - Array of results
 * @param {Number} total - Total number of records in DB
 * @param {Number} page - Current page number
 * @param {Number} limit - Records per page
 * @param {Number} statusCode - HTTP status code (default 200)
 */

export const paginationResponse = (
    reply: FastifyReply,
    data: any[],
    total: number,
    page: number,
    limit: number,
    statusCode = 200
) => {
    const totalPages = total ? Math.ceil(total / limit) : null;

    return reply
        .code(statusCode)
        .send({
            success: true,
            data,
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        });
};
