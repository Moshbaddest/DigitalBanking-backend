const express = require("express");

const {
    makeTransfer,
    makeInterBankTransfer,
    checkTransactionStatus,
    getTransactionHistory
} = require("../controllers/transactionController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/transfer",
    protect,
    makeTransfer
);

router.post(
    "/inter-bank-transfer",
    protect,
    makeInterBankTransfer
);

router.get(
    "/status/:transactionId",
    protect,
    checkTransactionStatus
);

router.get(
    "/history",
    protect,
    getTransactionHistory
);

module.exports = router;