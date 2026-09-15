const express = require("express");

const {
    onboardCustomer,
    getProfile
} = require("../controllers/customerController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/onboard",
    protect,
    onboardCustomer
);

router.get(
    "/profile",
    protect,
    getProfile
);

module.exports = router;