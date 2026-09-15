const express = require("express");

const {
    createAccount,
    getBalance
} = require("../controllers/accountController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/create",
    protect,
    createAccount
);

router.get(
    "/balance",
    protect,
    getBalance
);

module.exports = router;