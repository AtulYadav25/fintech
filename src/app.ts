import fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import { config } from "./config/env";
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import rateLimit from '@fastify/rate-limit'
import swaggerPlugin from "./plugins/swagger";

//Routes
import { authRoutes } from "./routes/auth.routes";
import { errorHandler } from "./middlewares/errorHandler";
import { transactionRoutes } from "./routes/transaction.routes";
import { chatRoutes } from "./routes/chat.routes";

const app = fastify({ logger: false });

const allowedOrigins = []; //Add real domain when in production

if (config.NODE_ENV === 'development') {
    allowedOrigins.push('http://localhost:5173');
}

app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    keyGenerator: (req) => req.ip,
});

app.register(cors, {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
});

app.register(cookie);

app.register(swaggerPlugin);

app.get("/", async (req, reply) => {
    return reply.code(200).send({
        success: true,
        message: "Welcome to Zorvyn Fintech Backend"
    });
})

// Validation
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

//Error Handler
app.setErrorHandler(errorHandler);

//Routes
app.register(authRoutes, { prefix: "/api/v1/auth" });
app.register(transactionRoutes, { prefix: "/api/v1/transaction" });
app.register(chatRoutes, { prefix: "/api/v1/chat" });


export default app;