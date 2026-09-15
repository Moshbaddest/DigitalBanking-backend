const axios = require("axios");

let cachedToken = null;
let tokenExpiresAt = 0;


// ==========================================
// THIS WILL GET NIBSS JWT TOKEN
// ==========================================

const getNibssToken = async () => {
    try {
        if (cachedToken && Date.now() < tokenExpiresAt) {
            return cachedToken;
        }

        const response = await axios.post(
            `${process.env.NIBSS_BASE_URL}/api/auth/token`,
            {
                apiKey: process.env.NIBSS_API_KEY,
                apiSecret: process.env.NIBSS_API_SECRET
            },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        cachedToken =
            response.data.token ||
            response.data.accessToken ||
            response.data.data?.token;

        if (!cachedToken) {
            throw new Error("NIBSS token was not found in response");
        }

        // Cache token for approximately 50 minutes
        tokenExpiresAt = Date.now() + 50 * 60 * 1000;

        console.log("NIBSS token generated successfully");

        return cachedToken;

    } catch (error) {
        console.error(
            "NIBSS authentication error:",
            error.response?.data || error.message
        );

        throw error;
    }
};


// ==========================================
// Inserting bvn
// ==========================================

const insertBVN = async (bvnData) => {
    try {
        const token = await getNibssToken();

        const response = await axios.post(
            `${process.env.NIBSS_BASE_URL}/api/insertBvn`,
            bvnData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data;

    } catch (error) {
        console.error(
            "NIBSS BVN insertion error:",
            error.response?.data || error.message
        );

        throw error;
    }
};


// ==========================================
// Validatin bvn
// ==========================================

const validateBVN = async (bvnData) => {
    try {
        const token = await getNibssToken();

        const response = await axios.post(
            `${process.env.NIBSS_BASE_URL}/api/validateBvn`,
            bvnData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data;

    } catch (error) {
        console.error(
            "NIBSS BVN validation error:",
            error.response?.data || error.message
        );

        throw error;
    }
};


// ==========================================
// Insert nin
// ==========================================

const insertNIN = async (ninData) => {
    try {
        const token = await getNibssToken();

        const response = await axios.post(
            `${process.env.NIBSS_BASE_URL}/api/insertNin`,
            {
                nin: ninData.nin,
                firstName: ninData.firstName,
                lastName: ninData.lastName,
                dob: ninData.dob
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data;

    } catch (error) {
        console.error(
            "NIBSS NIN insertion error:",
            error.response?.data || error.message
        );

        throw error;
    }
};


// ==========================================
// validating nin
// ==========================================

const validateNIN = async (ninData) => {
    try {
        const token = await getNibssToken();

        const response = await axios.post(
            `${process.env.NIBSS_BASE_URL}/api/validateNin`,
            ninData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data;

    } catch (error) {
        console.error(
            "NIBSS NIN validation error:",
            error.response?.data || error.message
        );

        throw error;
    }
};


// ==========================================
// creating account with bvn
// ==========================================

const createAccountWithBVN = async (bvn, dob) => {
    try {
        const token = await getNibssToken();

        const requestBody = {
            kycType: "bvn",
            kycID: bvn,
            dob: dob
        };

        console.log("Sending account creation request to NIBSS:");

        console.log({
            kycType: "bvn",
            kycID: bvn ? "present" : "missing",
            dob: dob
        });

        const response = await axios.post(
            `${process.env.NIBSS_BASE_URL}/api/account/create`,
            requestBody,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("NIBSS account creation response:");
        console.log(response.data);

        return response.data;

    } catch (error) {
        console.error("NIBSS ACCOUNT CREATION ERROR");
        console.error("Status:", error.response?.status);
        console.error("Response:", error.response?.data);
        console.error("Message:", error.message);

        throw error;
    }
};


// ==========================================
// NAME ENQUIRY
// ==========================================

const nameEnquiry = async (accountNumber) => {
    try {
        const token = await getNibssToken();

        const response = await axios.get(
            `${process.env.NIBSS_BASE_URL}/api/account/name-enquiry/${accountNumber}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("NIBSS name enquiry response:");
        console.log(response.data);

        return response.data;

    } catch (error) {
        console.error("NIBSS NAME ENQUIRY ERROR");
        console.error("Status:", error.response?.status);
        console.error("Response:", error.response?.data);
        console.error("Message:", error.message);

        throw error;
    }
};


// ==========================================
// TRANSFER function
// ==========================================

const transfer = async (
    from,
    to,
    amount,
    bankCode = null
) => {
    try {
        const token = await getNibssToken();

        const requestBody = {
            from,
            to,
            amount: String(amount)
        };

        // Add bank code when provided
        if (bankCode) {
            requestBody.bankCode = bankCode;
        }

        console.log("Sending transfer request to NIBSS:");

        console.log({
            from,
            to,
            amount: String(amount),
            bankCode: bankCode || "not provided"
        });

        const response = await axios.post(
            `${process.env.NIBSS_BASE_URL}/api/transfer`,
            requestBody,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("NIBSS transfer response:");
        console.log(response.data);

        return response.data;

    } catch (error) {
        console.error("NIBSS TRANSFER ERROR");
        console.error("Status:", error.response?.status);
        console.error("Response:", error.response?.data);
        console.error("Message:", error.message);

        throw error;
    }
};


// ==========================================
// TRANSACTION STATUS
// ==========================================

const getTransactionStatus = async (transactionId) => {
    try {
        const token = await getNibssToken();

        const response = await axios.get(
            `${process.env.NIBSS_BASE_URL}/api/transaction/${transactionId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log(
            "NIBSS transaction status response:"
        );

        console.log(response.data);

        return response.data;

    } catch (error) {
        console.error(
            "NIBSS TRANSACTION STATUS ERROR"
        );

        console.error(
            "Status:",
            error.response?.status
        );

        console.error(
            "Response:",
            error.response?.data
        );

        console.error(
            "Message:",
            error.message
        );

        throw error;
    }
};


// ==========================================
// EXPORTING
// ==========================================

module.exports = {
    getNibssToken,

    insertBVN,
    validateBVN,

    insertNIN,
    validateNIN,

    createAccountWithBVN,

    nameEnquiry,

    transfer,

    getTransactionStatus
};