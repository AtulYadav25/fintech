import dotenv from "dotenv";
import z from "zod";

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('5000'),
    NODE_ENV: z.string().default("development"),
    MONGODB_URI: z.string(),
    JWT_SECRET: z.string(),
    JWT_EXPIRES_IN: z.string().default("1h"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error("Invalid environment variables:", _env.error.format());
    process.exit(1);
}

export const config = _env.data;
