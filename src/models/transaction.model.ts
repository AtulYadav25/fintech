import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITransaction extends Document {
    userId: Types.ObjectId;
    amount: number;
    type: "income" | "expense";
    category: string;
    department: string;
    date: Date;
    description?: string;
    reference?: string; //Invoice Number, Transaction ID etc.
    isDeleted?: boolean; //Soft Delete: (Only Hides the transaction)
    createdAt: Date;
    updatedAt: Date;
}

const TransactionSchema: Schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true,
        min: [0.01, "Amount must be positive"]
    },
    type: {
        type: String,
        enum: ["income", "expense"],
        required: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    tags: [{
        type: String,
        trim: true
    }],
    reference: {
        type: String,
        trim: true
    },
    isDeleted: {
        type: Boolean,
        default: false,
        select: false
    }
}, {
    timestamps: true
});

TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, type: 1, category: 1 });

export default mongoose.model<ITransaction>("Transaction", TransactionSchema);