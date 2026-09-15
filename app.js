const express = require("express");

const authRoutes =
    require("./routes/authRoutes");

const customerRoutes =
    require("./routes/customerRoutes");

const accountRoutes =
    require("./routes/accountRoutes");

const nibssRoutes = require("./routes/nibssRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const app = express();

app.use(express.json());

app.use(
    "/api/transactions",
    transactionRoutes
);

app.get("/", (req, res) => {

    res.json({
        success: true,
        message:
            "Digital Banking API is running"
    });

});


app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/nibss",
    nibssRoutes
);

app.use(
    "/api/customers",
    customerRoutes
);

app.use(
    "/api/accounts",
    accountRoutes
);


app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "Route not found"
    });

});


module.exports = app;