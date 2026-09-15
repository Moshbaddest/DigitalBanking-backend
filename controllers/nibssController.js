const { nameEnquiry } = require("../services/nibssService");

const checkNameEnquiry = async (req, res) => {
    try {
        const { accountNumber } = req.params;

        if (!accountNumber) {
            return res.status(400).json({
                success: false,
                message: "Account number is required"
            });
        }

        const result = await nameEnquiry(accountNumber);

        return res.json({
            success: true,
            message: "Name enquiry successful",
            data: result
        });

    } catch (error) {
        console.error(
            "Name enquiry error:",
            error.response?.data || error.message
        );

        return res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data || error.message
        });
    }
};

module.exports = {
    checkNameEnquiry
};