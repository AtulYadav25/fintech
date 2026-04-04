import mongoose, { Schema, Document, Types } from "mongoose";
import { MESSAGE_ROLES, MessageRole } from "../constants/roles";

export interface IChatSession extends Document {
    userId: Types.ObjectId;
    title: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IChatMessage extends Document {
    sessionId: Types.ObjectId;
    role: MessageRole;
    content: string;
    createdAt: Date;
}

const ChatSessionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        default: "New Chat",
        trim: true
    }
}, { timestamps: true });

const ChatMessageSchema = new Schema({
    sessionId: {
        type: Schema.Types.ObjectId,
        ref: "ChatSession",
        required: true,
        index: true
    },
    role: {
        type: String,
        enum: Object.values(MESSAGE_ROLES),
        required: true
    },
    content: {
        type: String,
        required: true
    }
}, { timestamps: true });

export const ChatSession = mongoose.model<IChatSession>("ChatSession", ChatSessionSchema);
export const ChatMessage = mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema);
