import mongoose from "mongoose";
import { config } from "./env";

const connectDB = async () => {
    try {
        await mongoose.connect(config.MONGODB_URI);
        console.log("Database connected successfully");
    } catch (error) {
        console.log(error);
    }
}

export default connectDB;