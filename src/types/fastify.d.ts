import "fastify";

declare module "fastify" {
    interface FastifyRequest {
        user: {
            _id: string;
            email: string;
            role: string;
            department: string;
        };

        query: {
            page?: string;
            limit?: string;
        };
    }

    interface FastifyReply {
        setCookie: any; // or more specific types if needed
    }
}
