import fp from "fastify-plugin";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";

export default fp(async (app) => {
    await app.register(swagger, {
        openapi: {
            info: {
                title: "Zorvyn FinTech Backend",
                description: "API documentation for Zorvyn FinTech Backend",
                version: "1.0.0",
            },
            servers: [
                {
                    url: "http://localhost:3000",
                },
            ],
        },
    });

    await app.register(swaggerUI, {
        routePrefix: "/docs",
        uiConfig: {
            docExpansion: "list",
            deepLinking: false,
        },
    });
});