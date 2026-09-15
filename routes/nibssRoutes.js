const express = require("express");

const {
    checkNameEnquiry
} = require("../Controllers/nibssController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/name-enquiry/:accountNumber",
    protect,
    checkNameEnquiry
);

module.exports = router;