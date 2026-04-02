import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";
import { ROLES } from "../constants/roles";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: "viewer" | "analyst" | "admin";
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;

    //Method to validate password on login
    comparePassword: (password: string) => Promise<boolean>;
}

const UserSchema: Schema = new Schema<IUser>({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        select: false, //Exclude Password from queries by default
    },
    role: {
        type: String,
        enum: Object.values(ROLES),
        default: ROLES.VIEWER,
    },
    isVerified: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

//Hash password before saving, runs automatically before saving the document
UserSchema.pre("save", async function () {
    if (!this.isModified("password")) return; //If password is not modified, return

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password as string, salt);
    } catch (error: any) {
        throw error;
    }
})

/* METHODS */

UserSchema.methods.comparePassword = async function (password: string) {
    return bcrypt.compare(password, this.password);
}

export default mongoose.model<IUser>("User", UserSchema);