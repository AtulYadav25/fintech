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
            error: { message: formattedErrors }
        });
    }

    //Handle Mongoose Object ID Cast Error
    if (error && error.kind === "ObjectId") {
        return reply.code(400).send({
            success: false,
            message: "Invalid ID",
            error: {
                message: "Invalid Mongoose ID"
            }
        })
    }

    if (error && error.message === "NOT_FOUND") {
        return reply.code(404).send({
            success: false,
            message,
            data: null,
            error: {
                message: "Resource not found"
            }
        });
    }

    // Mongo duplicate key error
    if (error && error.code === 11000) {
        return reply.code(400).send({
            success: false,
            message: "Already exists",
            data: null,
            error: {
                message: "Already exists"
            }
        });
    }

    //Handles All Other Errors
    return reply.code(statusCode).send({
        success: false,
        message,
        data: null,
        error: {
            message: error?.message || message
        } //TODO: Remove error field in production (Never Send Full Unfiltered Error to client)
    });
};



/**
 * Standard pagination response formatter
 * @param {Object} reply - Fastify reply object
 * @param {Array} data - Array of results
 * @param {Number} page - Current page number
 * @param {Number} limit - Records per page
 * @param {String} message - Success message
 * @param {Number} statusCode - HTTP status code (default 200)
 */

export const paginationResponse = (
    reply: FastifyReply,
    data: any[],
    page: number,
    limit: number,
    message: string,
    statusCode = 200
) => {

    return reply
        .code(statusCode)
        .send({
            success: true,
            data,
            message,
            meta: {
                page,
                limit,
                hasNextPage: data.length === limit,
                hasPrevPage: page > 1,
            },
        });
};
