import mongoose, { Schema, Document, Types } from "mongoose";
import redisClient from "../config/redis";

export interface ITransaction extends Document {
    userId: Types.ObjectId;
    amount: number;
    type: "income" | "expense";
    category: string;
    department: string;
    date: Date;
    description?: string;
    tags?: string[];
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


const clearCache = async function (doc: any) {
    const department = doc?.department || this.getQuery()?.department;
    const rawKeysAll = await redisClient.sMembers(`tx_summary_keys:all`);

    //For "All" department filtered data stored in cache
    const keysAll = Array.isArray(rawKeysAll)
        ? rawKeysAll
        : Array.from(rawKeysAll);

    if (keysAll.length > 0) {
        await redisClient.del(keysAll);
    }

    if (!department) return;

    //Get all the keys for the specific department
    const rawKeys = await redisClient.sMembers(`tx_summary_keys:${department}`);
    // Also Delete the department with "all" key (That was added by the Analyst or Admin Filtered Data)

    //Because redisClient.sMembers() returns values as string[] or Set<string>
    //For specific department filtered data stored in cache
    const keys = Array.isArray(rawKeys)
        ? rawKeys
        : Array.from(rawKeys);

    if (keys.length > 0) {
        await redisClient.del(keys);
    }


    await redisClient.del(`tx_summary_keys:${department}`);
};

//Delete Redis Cache of the updated transaction's department if any transaction is updated or any created
TransactionSchema.post("save", clearCache);
TransactionSchema.post("findOneAndUpdate", clearCache);
TransactionSchema.post("updateOne", clearCache);
TransactionSchema.post("deleteOne", clearCache);
//Also when any transaction is created



export default mongoose.model<ITransaction>("Transaction", TransactionSchema);


//TODO: Add Search Support for transaction
//TODO: API documentation