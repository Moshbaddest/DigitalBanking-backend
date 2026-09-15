const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true
        },

        reference: {
            type: String,
            required: true,
            unique: true
        },

        type: {
            type: String,
            enum: [
                "intra-bank-transfer",
                "inter-bank-transfer"
            ],
            required: true
        },

        amount: {
            type: Number,
            required: true
        },

        senderAccount: {
            type: String,
            required: true
        },

        recipientAccount: {
            type: String,
            required: true
        },

        recipientName: {
            type: String
        },

        recipientBankCode: {
            type: String
        },

        narration: {
            type: String
        },

        status: {
            type: String,
            enum: [
                "pending",
                "successful",
                "failed"
            ],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Transaction",
    transactionSchema
);