import { FastifyReply, FastifyRequest } from "fastify";
import { verifyToken } from "../utils/jwt";
import { Permission, ROLE_PERMISSIONS } from "../constants/roles";

export const authMiddleware = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return reply.code(401).send({
                message: "Unauthorized: No token",
            });
        }

        const { _id, email, role }: any = verifyToken(token);

        if (!_id || !email || !role) {
            return reply.code(401).send({
                message: "Unauthorized: Invalid or expired token",
            });
        }

        req.user = { _id, email, role };

    } catch (err) {
        return reply.code(401).send({
            message: "Unauthorized: Invalid or expired token",
        });
    }
};


export const hasPermissions = (permission: Permission[]) => {
    return async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const user = req.user;

            if (!user) {
                return reply.code(401).send({
                    message: "Unauthorized: Invalid or expired token",
                });
            }

            if (!permission.every((perm) => ROLE_PERMISSIONS[user.role].includes(perm))) {
                return reply.code(403).send({
                    message: "Unauthorized: Insufficient permissions",
                });
            }
        } catch (err) {
            return reply.code(401).send({
                message: "Unauthorized: Invalid or expired token",
            });
        }
    };
};