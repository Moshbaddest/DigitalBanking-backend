# Digital Banking Backend API

A functional digital banking backend built with **Node.js, Express.js, MongoDB, JWT authentication, and NIBSS By Phoenix API integration**.

This project was developed as a backend engineering assignment to demonstrate customer onboarding, KYC/BVN verification, account creation, balance management, name enquiry, intra-bank transfers, inter-bank transfers, transaction status checking, and customer-specific transaction history.

---

## 📌 Project Overview

The Digital Banking Backend provides RESTful APIs for managing customers, bank accounts, authentication, and banking transactions.

The application integrates with **NIBSS By Phoenix APIs** to support:

* BVN onboarding and verification
* Bank account creation
* Account name enquiry
* Fund transfers
* Transaction status enquiries

Customer and transaction data are stored in **MongoDB Atlas**.

Authentication is implemented using **JSON Web Tokens (JWT)**.

---

## 🚀 Technologies Used

* **Node.js** – JavaScript runtime
* **Express.js** – Backend web framework
* **MongoDB Atlas** – Cloud database
* **Mongoose** – MongoDB object modelling
* **Axios** – HTTP client for NIBSS API communication
* **JWT (jsonwebtoken)** – Authentication
* **bcryptjs** – Password hashing
* **dotenv** – Environment variable management
* **Postman** – API testing
* **NIBSS By Phoenix API** – Banking/KYC integration

---

## 📁 Project Structure

```text
assignment-api/
│
├── config/
│   └── db.js
│
├── controllers/
│   ├── accountController.js
│   ├── authController.js
│   ├── customerController.js
│   ├── nibssController.js
│   └── transactionController.js
│
├── middleware/
│   └── authMiddleware.js
│
├── models/
│   ├── Account.js
│   ├── Customer.js
│   ├── Transaction.js
│   └── User.js
│
├── routes/
│   ├── accountRoutes.js
│   ├── authRoutes.js
│   ├── customerRoutes.js
│   ├── nibssRoutes.js
│   └── transactionRoutes.js
│
├── services/
│   └── nibssService.js
│
├── postman/
│   └── globals/
│
├── .postman/
│
├── .gitignore
├── app.js
├── server.js
├── package.json
└── package-lock.json
```

---

# 🔐 Authentication

The API uses **JWT Bearer authentication**.

Users must register and log in before accessing protected banking endpoints.

After successful login, the API returns a JWT token.

Protected requests should include:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

---

# ⚙️ Installation

## 1. Clone the repository

```bash
git clone https://github.com/Moshbaddest/DigitalBanking-backend.git
```

Enter the project directory:

```bash
cd DigitalBanking-backend
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Configure environment variables

Create a `.env` file in the root directory.

Example:

```env
PORT=5000

MONGO_URI=YOUR_MONGODB_ATLAS_CONNECTION_STRING

JWT_SECRET=YOUR_JWT_SECRET

NIBSS_BASE_URL=https://nibssbyphoenix.onrender.com

NIBSS_API_KEY=YOUR_NIBSS_API_KEY

NIBSS_API_SECRET=YOUR_NIBSS_API_SECRET
```

### Important

The `.env` file contains sensitive credentials and should **never be committed to GitHub**.

The repository includes a `.gitignore` file that excludes:

```text
.env
node_modules/
```

---

# ▶️ Running the Application

Start the server with:

```bash
node server.js
```

The API runs by default on:

```text
http://localhost:5000
```

The root endpoint can be tested with:

```http
GET /
```

Expected response:

```json
{
  "success": true,
  "message": "Digital Banking API is running"
}
```

---

# 🔑 Authentication Endpoints

## Register User

```http
POST /api/auth/register
```

### Request

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Response

```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": "USER_ID"
}
```

---

## Login

```http
POST /api/auth/login
```

### Request

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Response

```json
{
  "success": true,
  "message": "Login successful",
  "token": "JWT_TOKEN"
}
```

The returned token should be used to access protected endpoints.

---

# 👤 Customer Management

All customer endpoints require JWT authentication.

---

## Customer Onboarding

```http
POST /api/customers/onboard
```

The customer can be onboarded using **BVN or NIN**, with the current account creation flow using BVN verification.

### BVN Request Example

```json
{
  "firstName": "Temidayo",
  "lastName": "Danjuma",
  "dateOfBirth": "1995-01-01",
  "phone": "08000000000",
  "bvn": "TEST_BVN"
}
```

The backend:

1. Receives the customer information.
2. Sends the BVN information to NIBSS.
3. Validates the BVN.
4. Creates the customer record in MongoDB.
5. Marks the customer's verification status as verified after successful verification.

### Important

Use only **test BVN/NIN data provided for development or testing**. Do not use real customer identity information in testing or public repositories.

---

## Get Customer Profile

```http
GET /api/customers/profile
```

Returns the authenticated customer's profile.

The customer is identified using the `userId` contained in the JWT.

---

# 🏦 Account Management

## Create Account

```http
POST /api/accounts/create
```

The account can only be created after successful customer onboarding and verification.

The backend checks:

* Customer exists
* Customer has been onboarded
* BVN verification is successful
* Customer has a BVN
* Customer does not already have an account

The NIBSS account creation API is then called.

The account is created with an initial balance of:

```text
₦15,000
```

Each customer is restricted to **one account**.

---

## Get Account Balance

```http
GET /api/accounts/balance
```

Returns the authenticated customer's account number and current balance.

Example:

```json
{
  "success": true,
  "accountNumber": "2109133980",
  "balance": 14980
}
```

---

# 🔎 Name Enquiry

```http
GET /api/nibss/name-enquiry/:accountNumber
```

Performs a NIBSS account name enquiry.

Example:

```http
GET /api/nibss/name-enquiry/2109133980
```

The endpoint is used to verify the recipient's account information before a transfer.

---

# 💸 Transfers

## Intra-Bank Transfer

```http
POST /api/transactions/transfer
```

### Request

```json
{
  "to": "9023301562",
  "amount": 10,
  "narration": "Testing transfer"
}
```

The backend:

1. Authenticates the user.
2. Finds the sender's account.
3. Checks that the account is active.
4. Checks the available balance.
5. Prevents transfers to the same account.
6. Performs recipient name enquiry.
7. Sends the transfer request to NIBSS.
8. Updates the sender's balance after a successful transfer.
9. Records the transaction in MongoDB.

---

# 🌍 Inter-Bank Transfer

```http
POST /api/transactions/inter-bank-transfer
```

### Request

```json
{
  "to": "9023301562",
  "bankCode": "902",
  "amount": 10,
  "narration": "Testing inter-bank transfer"
}
```

The endpoint performs the necessary recipient verification and sends the transfer request through the NIBSS integration.

Successful transactions are recorded in the transaction database.

---

# 📊 Transaction Status

```http
GET /api/transactions/status/:transactionId
```

Example:

```http
GET /api/transactions/status/TX_TRANSACTION_ID
```

This queries the NIBSS transaction status endpoint and returns the current transaction information.

---

# 📜 Transaction History

```http
GET /api/transactions/history
```

Returns the transaction history belonging to the currently authenticated customer.

The transaction query is filtered by the authenticated customer's customer ID.

This provides **customer data isolation**, ensuring that one customer cannot retrieve another customer's transaction history.

---

# 🛡️ Security & Validation

The backend implements several security and validation measures.

### Password Security

Passwords are hashed using:

```text
bcryptjs
```

Passwords are never stored as plain text.

### JWT Authentication

Protected endpoints require a valid JWT.

Requests without authentication receive:

```json
{
  "success": false,
  "message": "Authorization token required"
}
```

### Account Protection

The backend prevents:

* Duplicate accounts for the same customer
* Transfers to the sender's own account
* Transfers from inactive accounts
* Transfers when the balance is insufficient

### Transaction Privacy

Transaction history is associated with the authenticated customer's ID.

A customer can only retrieve their own transaction records.

---

# 🗄️ Database Models

The application uses MongoDB with Mongoose.

## User

Stores:

* Email
* Hashed password

## Customer

Stores:

* User ID
* First name
* Last name
* Date of birth
* Phone
* BVN
* NIN
* Verification type
* Verification status

## Account

Stores:

* Customer ID
* Account number
* Account name
* Balance
* Account status

## Transaction

Stores:

* Customer ID
* Transaction reference
* Transaction type
* Amount
* Sender account
* Recipient account
* Recipient name
* Recipient bank code
* Narration
* Transaction status

---

# 🔗 NIBSS By Phoenix Integration

The application integrates with the NIBSS By Phoenix API.

Base URL:

```text
https://nibssbyphoenix.onrender.com
```

The backend service handles authentication and communication with NIBSS.

Implemented integrations include:

* NIBSS JWT token generation
* BVN insertion
* BVN validation
* NIN insertion
* NIN validation
* Account creation
* Name enquiry
* Transfers
* Transaction status

NIBSS credentials are loaded from environment variables rather than being hard-coded into the application.

---

# 🧪 Testing

The API was tested using **Postman**.

Tested functionality includes:

* User registration
* User login
* JWT-protected endpoints
* Customer onboarding
* BVN verification
* Account creation
* Duplicate account prevention
* Balance enquiry
* Name enquiry
* Intra-bank transfer
* Inter-bank transfer
* Transaction status
* Transaction history
* Insufficient funds validation
* Unauthorized access handling
* Customer transaction isolation

---

# 📋 Example API Flow

A typical customer journey is:

```text
1. Register
      ↓
2. Login
      ↓
3. Receive JWT
      ↓
4. Customer onboarding
      ↓
5. BVN verification
      ↓
6. Create bank account
      ↓
7. Account funded with ₦15,000
      ↓
8. Check balance
      ↓
9. Name enquiry
      ↓
10. Transfer funds
      ↓
11. Check transaction status
      ↓
12. View transaction history
```

---

# 🧱 Application Architecture

The project follows a basic separation-of-concerns structure:

```text
Routes
   ↓
Controllers
   ↓
Services / Models
   ↓
MongoDB / NIBSS API
```

### Routes

Define the API endpoints.

### Controllers

Handle incoming requests, validation, business logic, and responses.

### Services

Handle external NIBSS API communication.

### Models

Define MongoDB database schemas.

### Middleware

Handles JWT authentication and protects private routes.

---

# 📌 API Endpoint Summary

| Method | Endpoint                                  | Authentication | Purpose                      |
| ------ | ----------------------------------------- | -------------- | ---------------------------- |
| GET    | `/`                                       | No             | API health check             |
| POST   | `/api/auth/register`                      | No             | Register user                |
| POST   | `/api/auth/login`                         | No             | Login user                   |
| POST   | `/api/customers/onboard`                  | Yes            | Onboard customer             |
| GET    | `/api/customers/profile`                  | Yes            | Get customer profile         |
| POST   | `/api/accounts/create`                    | Yes            | Create account               |
| GET    | `/api/accounts/balance`                   | Yes            | Check balance                |
| GET    | `/api/nibss/name-enquiry/:accountNumber`  | Yes            | Account name enquiry         |
| POST   | `/api/transactions/transfer`              | Yes            | Intra-bank transfer          |
| POST   | `/api/transactions/inter-bank-transfer`   | Yes            | Inter-bank transfer          |
| GET    | `/api/transactions/status/:transactionId` | Yes            | Transaction status           |
| GET    | `/api/transactions/history`               | Yes            | Customer transaction history |

---

# ⚠️ Environment & Credentials

Never commit the following to GitHub:

```text
.env
API keys
API secrets
MongoDB passwords
JWT secrets
Real BVNs
Real NINs
Real customer banking information
```

Use environment variables for sensitive configuration.

---

# 👨‍💻 Author

**Temidayo Moshood**

GitHub:

https://github.com/Moshbaddest

Project repository:

https://github.com/Moshbaddest/DigitalBanking-backend

---

# 📄 Assignment

This project was developed as a **Digital Banking Backend Engineering Assignment**, demonstrating REST API development, authentication, database management, banking operations, transaction processing, data isolation, and third-party API integration.

---

## ⭐ Project Status

**Status: Completed and Functional**

Core banking functionality has been implemented and tested successfully.
