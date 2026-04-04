import app from "./app";
import { config } from "./config/env";
import connectDB from "./config/db";
import { initRedis } from "./config/redis";
import { seedInitialAdmin } from "./seeders/initializeAdminSeeder";

const startServer = async () => {

    //Connect MongoDB
    await connectDB();
    //Connect Redis
    await initRedis();
    //Seed Initial Admin
    await seedInitialAdmin();

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