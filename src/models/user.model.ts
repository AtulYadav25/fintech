import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";
import { ROLES } from "../constants/roles";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: "viewer" | "analyst" | "admin";
    isVerified: boolean;
    isActive: boolean;
    isDeleted: boolean;
    deletedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    department: string;
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
        index: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        select: false, //Exclude Password from queries by default
    },
    isActive: {
        type: Boolean,
        default: false, //TODO: Add logic to activate user after verification
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    isDeleted: {
        type: Boolean,
        default: false,
        select: false,
    },
    deletedAt: {
        type: Date,
        default: null,
        select: false,
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
    return bcrypt.compare(password, this.password as string);
}

export default mongoose.model<IUser>("User", UserSchema);