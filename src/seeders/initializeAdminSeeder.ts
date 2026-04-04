import { ROLES } from "../constants/roles";
import User from "../models/user.model";

export const seedInitialAdmin = async () => {
    try {
        // Checks if any Admin already exists
        const adminExists = await User.findOne({ role: "admin" });

        if (adminExists) return;

        console.log("No admin found. Creating initial admin...");

        await User.create({
            name: "Initial Admin",
            email: "admin@company.com",
            password: "Admin@9870245",
            role: ROLES.ADMIN,
            isVerified: true,
            department: "ADMIN",
            isActive: true,
        });

        console.log("Initial Admin created successfully!");

    } catch (error) {
        console.error("Initial admin seeding failed:", error);
    }
};