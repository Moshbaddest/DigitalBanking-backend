const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        firstName: {
            type: String,
            required: true
        },

        lastName: {
            type: String,
            required: true
        },

        dateOfBirth: {
            type: String,
            required: true
        },

        phone: {
            type: String,
            required: true
        },

        bvn: {
            type: String
        },

        nin: {
            type: String
        },

        verificationType: {
            type: String,
            enum: ["BVN", "NIN"]
        },

        verificationStatus: {
            type: String,
            enum: ["pending", "verified", "failed"],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.models.Customer ||
    mongoose.model("Customer", customerSchema);