import { createClient } from "redis";
import { config } from "./env";

const redisClient = createClient({
    url: config.REDIS_URL
});

redisClient.on("connect", () => {
    console.log("Redis connecting...");
});

redisClient.on("ready", () => {
    console.log("Redis connected");
});

redisClient.on("error", (err) => {
    console.error("Redis Client Error", err.code, err.message);
});

redisClient.on("end", () => {
    console.warn("Redis connection closed");
});

export async function initRedis() {
    if (!redisClient.isOpen) {
        console.log("Redis URL:", config.REDIS_URL);

        await redisClient.connect();
    }
}

export default redisClient;
