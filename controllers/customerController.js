const Customer = require("../models/Customer");

const {
    insertBVN,
    validateBVN,
    insertNIN,
    validateNIN
} = require("../services/nibssService");


const onboardCustomer = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            dateOfBirth,
            phone,
            bvn,
            nin
        } = req.body;


        // Check basic customer information
        if (!firstName || !lastName || !dateOfBirth || !phone) {
            return res.status(400).json({
                success: false,
                message:
                    "firstName, lastName, dateOfBirth and phone are required"
            });
        }


        // Customer must provide either BVN or NIN
        if (!bvn && !nin) {
            return res.status(400).json({
                success: false,
                message: "Either BVN or NIN is required"
            });
        }


        // Customer cannot provide both
        if (bvn && nin) {
            return res.status(400).json({
                success: false,
                message: "Provide either BVN or NIN, not both"
            });
        }


        // Check if customer already exists
        const existingCustomer = await Customer.findOne({
            userId: req.user.userId
        });

        if (existingCustomer) {
            return res.status(409).json({
                success: false,
                message: "Customer already onboarded"
            });
        }


        let verificationResponse;


        // ===============================
        // BVN FLOW
        // ===============================
        if (bvn) {

            // Create BVN record
            const bvnResponse = await insertBVN({
                bvn,
                firstName,
                lastName,
                dob: dateOfBirth,
                phone
            });


            // Validate BVN
            const validationResponse = await validateBVN({
                bvn
            });


            verificationResponse = {
                bvnResponse,
                validationResponse
            };


            // Save verified BVN customer
            const customer = await Customer.create({
                userId: req.user.userId,
                firstName,
                lastName,
                dateOfBirth,
                phone,
                bvn,
                verificationType: "BVN",
                verificationStatus: "verified"
            });


            return res.status(201).json({
                success: true,
                message: "Customer onboarded and BVN verified successfully",
                customer,
                verification: verificationResponse
            });
        }


        // ===============================
        // NIN FLOW
        // ===============================
        if (nin) {

            // Create NIN record
            const ninResponse = await insertNIN({
                nin,
                firstName,
                lastName,
                dob: dateOfBirth,
                phone
            });


            // Validate NIN
            const validationResponse = await validateNIN({
                nin
            });


            verificationResponse = {
                ninResponse,
                validationResponse
            };


            // Save verified NIN customer
            const customer = await Customer.create({
                userId: req.user.userId,
                firstName,
                lastName,
                dateOfBirth,
                phone,
                nin,
                verificationType: "NIN",
                verificationStatus: "verified"
            });


            return res.status(201).json({
                success: true,
                message: "Customer onboarded and NIN verified successfully",
                customer,
                verification: verificationResponse
            });
        }

    } catch (error) {

        console.error(
            "Customer onboarding error:",
            error.response?.data || error.message
        );

        return res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data || error.message
        });
    }
};


const getProfile = async (req, res) => {
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


        res.json({
            success: true,
            customer
        });


    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    onboardCustomer,
    getProfile
};