const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
            unique: true
        },

        accountNumber: {
            type: String,
            required: true,
            unique: true
        },

        accountName: {
            type: String,
            required: true
        },

        balance: {
            type: Number,
            default: 15000
        },

        accountStatus: {
            type: String,
            enum: ["active", "blocked"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Account", accountSchema);