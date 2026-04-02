import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod"

//Handle Error for exceptional cases
export const errorHandler = (err: FastifyError, req: FastifyRequest, reply: FastifyReply) => {
    if (err instanceof ZodError) {
        return reply.code(400).send({
            success: false,
            message: "Validation error",
            error: err.format()
        })
    }

    console.log("SERVER ERROR: ", err);

    return reply.code(500).send({
        success: false,
        message: "Internal server error",
        error: err.message
    })
}