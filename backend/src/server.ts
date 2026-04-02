import app from "./app";
import { config } from "./config/env";
import connectDB from "./config/db";

const startServer = async () => {

    //Connect MongoDB
    await connectDB();

    try {
        await app.listen({
            port: parseInt(config.PORT),
            host: '0.0.0.0'
        })
        console.log(`Fintech Server is running on port ${config.PORT}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

startServer();