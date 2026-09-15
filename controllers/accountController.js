const Customer = require("../models/Customer");
const Account = require("../models/Account");

const {
    createAccountWithBVN
} = require("../services/nibssService");


const createAccount = async (req, res) => {
    try {

        // 1. Find the logged-in customer's profile
        const customer = await Customer.findOne({
            userId: req.user.userId
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer has not been onboarded"
            });
        }


        // 2. Account creation only accepts BVN
        if (customer.verificationType !== "BVN") {
            return res.status(400).json({
                success: false,
                message: "Account creation only supports BVN verification"
            });
        }


        // 3. BVN must exist
        if (!customer.bvn) {
            return res.status(400).json({
                success: false,
                message: "Customer does not have a BVN"
            });
        }


        // 4. Customer must be verified
        if (customer.verificationStatus !== "verified") {
            return res.status(400).json({
                success: false,
                message: "BVN must be verified before account creation"
            });
        }


        // 5. Check whether customer already has an account
        const existingAccount = await Account.findOne({
            customerId: customer._id
        });

        if (existingAccount) {
            return res.status(409).json({
                success: false,
                message: "Customer already has an account",
                account: existingAccount
            });
        }


        // 6. Ask NIBSS to create the account using BVN
        const nibssResponse = await createAccountWithBVN(
            customer.bvn,
            customer.dateOfBirth
        );


        // 7. Get account information returned by NIBSS
        const nibssAccount = nibssResponse.account || nibssResponse.data;

        if (!nibssAccount) {
            return res.status(502).json({
                success: false,
                message: "NIBSS did not return account information",
                nibssResponse
            });
        }


        const accountNumber = nibssAccount.accountNumber;
        const accountName = nibssAccount.accountName;
        const balance = nibssAccount.balance ?? 15000;


        // 8. Make sure NIBSS returned an account number
        if (!accountNumber) {
            return res.status(502).json({
                success: false,
                message: "NIBSS did not return an account number",
                nibssResponse
            });
        }


        // 9. Save the account in MongoDB
        const account = await Account.create({
            customerId: customer._id,
            accountNumber,
            accountName:
                accountName ||
                `${customer.firstName} ${customer.lastName}`,
            balance
        });


        // 10. Return successful response
        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            account,
            nibssResponse
        });


    } catch (error) {

        console.error(
            "Account creation error:",
            error.response?.data || error.message
        );

        return res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data || error.message
        });
    }
};


const getBalance = async (req, res) => {
    try {

        // Find customer
        const customer = await Customer.findOne({
            userId: req.user.userId
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }


        // Find account
        const account = await Account.findOne({
            customerId: customer._id
        });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: "Account not found"
            });
        }


        return res.json({
            success: true,
            accountNumber: account.accountNumber,
            balance: account.balance
        });


    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    createAccount,
    getBalance
};