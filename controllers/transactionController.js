const Customer = require("../models/customer");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");

const {
    nameEnquiry,
    transfer,
    getTransactionStatus
} = require("../services/nibssService");
const makeTransfer = async (req, res) => {
    try {
        const { to, amount, narration } = req.body;

        // 1. Check required fields
        if (!to || !amount) {
            return res.status(400).json({
                success: false,
                message: "Recipient account number and amount are required"
            });
        }

        // 2. Make sure amount is a valid number
        const transferAmount = Number(amount);

        if (!Number.isFinite(transferAmount) || transferAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be a valid number greater than zero"
            });
        }

        // 3. Find the logged-in customer's profile
        const customer = await Customer.findOne({
            userId: req.user.userId
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        // 4. Find the sender's account
        const senderAccount = await Account.findOne({
            customerId: customer._id
        });

        if (!senderAccount) {
            return res.status(404).json({
                success: false,
                message: "Sender account not found"
            });
        }

        // 5. Check sender account status
        if (senderAccount.accountStatus !== "active") {
            return res.status(400).json({
                success: false,
                message: "Sender account is not active"
            });
        }

        // 6. Prevent transferring to the same account
        if (senderAccount.accountNumber === to) {
            return res.status(400).json({
                success: false,
                message: "You cannot transfer to your own account"
            });
        }

        // 7. Check local balance before calling NIBSS
        if (senderAccount.balance < transferAmount) {
            return res.status(400).json({
                success: false,
                message: "Insufficient funds"
            });
        }

        // 8. Perform Name Enquiry first
        const enquiry = await nameEnquiry(to);

        const recipientName =
            enquiry.accountName ||
            enquiry.data?.accountName;

        const recipientBankCode =
            enquiry.bankCode ||
            enquiry.data?.bankCode;

        if (!recipientName) {
            return res.status(400).json({
                success: false,
                message: "Recipient account could not be verified"
            });
        }

        // 9. Call NIBSS transfer
        const nibssResponse = await transfer(
            senderAccount.accountNumber,
            to,
            transferAmount
        );

        // 10. Check NIBSS transfer status
        const successful =
            nibssResponse.status === "SUCCESS" ||
            nibssResponse.status === "successful" ||
            nibssResponse.message === "Transfer successful";

        if (!successful) {
            return res.status(400).json({
                success: false,
                message: "Transfer was not successful",
                nibssResponse
            });
        }

        // 11. Update sender's local balance
        senderAccount.balance -= transferAmount;
        await senderAccount.save();

        // 12. Save transaction history
        const transaction = await Transaction.create({
            customerId: customer._id,
            reference:
                nibssResponse.transactionId ||
                `TX-${Date.now()}`,
            type: "intra-bank-transfer",
            amount: transferAmount,
            senderAccount: senderAccount.accountNumber,
            recipientAccount: to,
            recipientName,
            recipientBankCode,
            narration,
            status: "successful"
        });

        // 13. Return successful response
        return res.status(200).json({
            success: true,
            message: "Transfer successful",
            transaction,
            nibssResponse
        });

    } catch (error) {
        console.error(
            "Transfer error:",
            error.response?.data || error.message
        );

        return res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data || error.message
        });
    }
};

const checkTransactionStatus = async (req, res) => {
    try {
        const { transactionId } = req.params;

        if (!transactionId) {
            return res.status(400).json({
                success: false,
                message: "Transaction ID is required"
            });
        }

        const statusResponse = await getTransactionStatus(transactionId);

        return res.status(200).json({
            success: true,
            message: "Transaction status retrieved successfully",
            transaction: statusResponse
        });

    } catch (error) {
        console.error(
            "Transaction status error:",
            error.response?.data || error.message
        );

        return res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data || error.message
        });
    }
};

const getTransactionHistory = async (req, res) => {
    try {
        const customer = await Customer.findOne({
            userId: req.user.userId
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        const transactions = await Transaction.find({
            customerId: customer._id
        }).sort({
            createdAt: -1
        });

        return res.status(200).json({
            success: true,
            message: "Transaction history retrieved successfully",
            count: transactions.length,
            transactions
        });

    } catch (error) {
        console.error(
            "Transaction history error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const makeInterBankTransfer = async (req, res) => {
    try {
        const {
            to,
            bankCode,
            amount,
            narration
        } = req.body;

        if (!to || !bankCode || !amount) {
            return res.status(400).json({
                success: false,
                message:
                    "Recipient account number, bank code and amount are required"
            });
        }

        const transferAmount = Number(amount);

        if (
            !Number.isFinite(transferAmount) ||
            transferAmount <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Amount must be a valid number greater than zero"
            });
        }

        const customer = await Customer.findOne({
            userId: req.user.userId
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        const senderAccount = await Account.findOne({
            customerId: customer._id
        });

        if (!senderAccount) {
            return res.status(404).json({
                success: false,
                message: "Sender account not found"
            });
        }

        if (senderAccount.accountStatus !== "active") {
            return res.status(400).json({
                success: false,
                message: "Sender account is not active"
            });
        }

        if (senderAccount.balance < transferAmount) {
            return res.status(400).json({
                success: false,
                message: "Insufficient funds"
            });
        }

        if (senderAccount.accountNumber === to) {
            return res.status(400).json({
                success: false,
                message: "You cannot transfer to your own account"
            });
        }

        // Verify recipient before transfer
        const enquiry = await nameEnquiry(to);

        const recipientName =
            enquiry.accountName ||
            enquiry.data?.accountName;

        const recipientBankCode =
            enquiry.bankCode ||
            enquiry.data?.bankCode;

        if (!recipientName) {
            return res.status(400).json({
                success: false,
                message:
                    "Recipient account could not be verified"
            });
        }

        // Make the transfer
        const nibssResponse = await transfer(
            senderAccount.accountNumber,
            to,
            transferAmount,
            bankCode
        );

        const successful =
            nibssResponse.status === "SUCCESS" ||
            nibssResponse.status === "successful" ||
            nibssResponse.message === "Transfer successful";

        if (!successful) {
            return res.status(400).json({
                success: false,
                message: "Transfer was not successful",
                nibssResponse
            });
        }

        // Deduct money only after successful NIBSS transfer
        senderAccount.balance -= transferAmount;

        await senderAccount.save();

        const transaction = await Transaction.create({
            customerId: customer._id,

            reference:
                nibssResponse.transactionId ||
                nibssResponse.reference ||
                `TX-${Date.now()}`,

            type: "inter-bank-transfer",

            amount: transferAmount,

            senderAccount:
                senderAccount.accountNumber,

            recipientAccount: to,

            recipientName,

            recipientBankCode:
                recipientBankCode || bankCode,

            narration,

            status: "successful"
        });

        return res.status(200).json({
            success: true,
            message: "Inter-bank transfer successful",
            transaction,
            nibssResponse
        });

    } catch (error) {
        console.error(
            "Inter-bank transfer error:",
            error.response?.data ||
            error.message
        );

        return res.status(
            error.response?.status || 500
        ).json({
            success: false,
            message:
                error.response?.data ||
                error.message
        });
    }
};

module.exports = {
    makeTransfer,
    makeInterBankTransfer,
    checkTransactionStatus,
    getTransactionHistory 
};