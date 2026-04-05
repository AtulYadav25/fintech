# Fintech Backend

A high-performance, backend service for the Fintech platform, featuring Role-Based Access Control, analytics caching, and AI-powered chat assistance.

## Features

- **Fastify API**: Built with Node.js and Fastify for modern, low-overhead request handling.
- **Secure Authentication**: Cookie-based JWT authentication with password hashing (Bcrypt).
- **Advanced Role-Based Access Control (RBAC)**: Fine-grained permissions allowing localized `Viewer`, `Analyst` (Department level), and global `Admin` (Root level) access control.
- **AI-Powered Chat Assistant**: Integrated Google Gemini AI functionality for admins to interact seamlessly with their data sessions. Ask AI to answer your friendly questions like "Which department has the highest expenses in last 3 months?" or "What is the total income and expense in last 6 months?".
- **High-Performance Caching**: Redis integration for dashboard/summary endpoints, with automatic cache invalidation hooks upon database writes. After caching the responses ms declined from `114ms` to `24ms`.
- **Data Safety First**: Implements Soft Delete feature to transactions.
- **Strict Payload Validation**: Request parsing enforced consistently via Zod and Fastify Type Providers.

## Tech Stack

- **Core**: Node.js, Fastify, TypeScript
- **Database**: MongoDB (Mongoose ORM) - (Optional If using Docker)
- **Caching**: Redis - (Optional If using Docker)
- **Security**: JSON Web Tokens (JWT), Bcrypt
- **Validation**: Zod, fastify-type-provider-zod
- **AI Integration**: `@google/genai` (Gemini API)
- **DevOps**: Docker, Docker Compose, pnpm

## Project Structure

```text
Fintech-backend/
├── docker-compose.yml     # Docker instructions for defining App, Mongo, and Redis containers
├── Dockerfile             # Node.js production image configuration
├── package.json
├── .env.example           # Environment variables mapping for vital env keys
└── src/
    ├── app.ts             
    ├── server.ts          # Application entry point & MongoDB/Redis connection
    ├── config/            # Environment parsing (env.ts), DB, and Redis configurations
    ├── constants/         # Enums, Roles definitions, and Roles Permissions mapping
    ├── controllers/       # Execution logic for handlers
    ├── middlewares/       # Authentication guards and RBAC Permission execution hooks
    ├── models/            # Mongoose schemas (User, Transaction, AI Chat)
    ├── routes/            
    ├── seeders/           # Initial data seeders (first root admin)
    ├── services/          # Heavy Database Query logic
    ├── types/             # TypeScript declaration for fastify request types (req.user)
    ├── utils/             # Helper components (e.g. JWT signing/verifying routines)
    └── validators/        # Zod based Request parameter structures
```

## Prerequisites

Before running this application, ensure you have the following installed:
- **Node.js** (v18+)
- **pnpm** (Package manager)
- **Docker & Docker Compose** (Recommended for easiest local deployment)

## Environment Variables

Create a local `.env` file referencing the given `.env.example`:

```env
PORT=3000                                          # API Port (default 3000)
NODE_ENV=development                               # Operating Environment
MONGODB_URI=mongodb://mongo:27017/fintech          # Docker or Local or Remote MongoDB connection string
REDIS_URL=redis://redis:6379                       # Docker or Local Redis URL connection
JWT_SECRET=something_secret                        # Cryptographic secret for signing tokens
JWT_EXPIRES_IN=7d                                  # Token expiry limit
GEMINI_API_KEY=your_gemini_api_key_here            # API Config Key for the AI chat features
```

## Setup & Installation

### Option 1: Using Docker (Recommended)
This approach automatically manages the Node.js application, MongoDB, and Redis instances.

1. Clone the repository and navigate to the folder.
2. Initialize your `.env` configuration file.
3. Start the application:
   ```bash
   docker-compose up --build
   ```
4. *The server should now be live on `http://localhost:3000` (or your defined `PORT`).*

### Option 2: Manual Installation (Local Node Environment)

1. Clone the repository.
2. Install packages via `pnpm`:
   ```bash
   pnpm install
   ```
3. Make sure to have a **MongoDB** instance and a local **Redis** instance running on your machine and update the `.env` file accordingly.

## Running the Application

### Development Loop

To run the server in development mode (hot-reloading enabled via `ts-node-dev`):
```bash
pnpm dev
```

### Production Build

To compile TypeScript properly and initialize a production-ready Node runtime:
```bash
pnpm build
pnpm start
```

## Initial Admin Seed

When the server is started for the first time, it automatically checks if an admin user exists. If no admin is found in the database, it automatically seeds an initial root admin account so you can log in and manage the system right away.

**Default Admin Credentials:**
- **Email**: `admin@company.com`
- **Password**: `Admin@9870245`

> [!WARNING]
> It is highly recommended to change the default admin password or remove this seeded user once you have set up your own administrator accounts in a production environment.

----
# API Routes Documentation

The backend exposes the following RESTful API endpoints. All authenticated routes require the JWT token to be present in an `HttpOnly` cookie.


## Role-Based Access Control (RBAC)

The API uses strict security checks to control exactly what each user is allowed to do. It does this by mapping user roles to specific permissions (`read:limited`, `read:all`, `create`, `update`, `delete`, `manage:users`, `ai:chat`).

| Feature | Viewer | Analyst | Admin |
|---|---|---|---|
| **View Generic Data** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Query AI Chat Support** | ❌ No | ✅ Yes (Own Dept Only) | ✅ Yes |
| **Access Dashboard Summary** | ❌ No | ✅ Yes (Own Dept Only) | ✅ Yes (Global) |
| **Manage Transactions** | ❌ No | ❌ No | ✅ Yes (Create/Edit/Delete) |
| **Promote/Manage Users** | ❌ No | ❌ No | ✅ Yes |
| **Global Data Visibility** | ❌ No | ❌ No | ✅ Yes |


## Auth Routes (`/api/v1/auth`)

### `POST /signup`
Register a new user in the system.
- **Access**: Public

**Body Parameters**
| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Full name |
| `email` | string | Yes | Valid email address |
| `password` | string | Yes | Min 6 characters |
| `role` | enum | No | e.g., `Viewer`, `Analyst`, `Admin` |
| `department` | string | Yes | User department |

**Output Example**
```json
{
  "success":true,
  "message": "User registered successfully",
  "data": {
    "_id": "60d0fe4f5311236168a109ca",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "Viewer",
    "department": "Marketing",
    "isVerified": false,
    "createdAt": "2022-01-01T00:00:00.000Z",
    "updatedAt": "2022-01-01T00:00:00.000Z"
  }
}
```
----
### `POST /login`
Authenticate a user and yield an `HttpOnly` Session Cookie containing the JWT.
- **Access**: Public

**Body Parameters**
| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | Yes | Account email address |
| `password` | string | Yes | Account password |

**Output Example**
```json
{
  "success":true,
  "message": "Logged in successfully",
  "data": {
    "_id": "60d0fe4f5311236168a109ca",
    "email": "jane@example.com",
    "role": "Viewer",
    "department": "Marketing",
    "isVerified": false,
    "createdAt": "2022-01-01T00:00:00.000Z",
    "updatedAt": "2022-01-01T00:00:00.000Z"
  }
}
```
----
### `POST /logout`
Clear the user's session cookie and log them out.
- **Access**: Private (Authenticated Users)

**Output Example**
```json
{
  "success":true,
  "message": "Logged out successfully"
}
```
----
### `PATCH /verify/:userId`
Verify a newly registered user account.
- **Access**: Private (Admin Only, `manage:users` permission)

**Path Parameters**
| Field | Type | Required | Description |
|---|---|---|---|
| `userId` | string | Yes | The ID of the user to verify |

**Output Example**
```json
{
  "success":true,
  "message": "User successfully verified"
}
```
----
### `PATCH /:userId`
Update an existing user's role or department context.
- **Access**: Private (Admin Only, `manage:users` permission)

**Path Parameters**
| Field | Type | Required | Description |
|---|---|---|---|
| `userId` | string | Yes | The ID of the user to update |

**Body Parameters**
| Field | Type | Required | Description |
|---|---|---|---|
| `role` | enum | No | The new role of the user |
| `department` | string | No | The new department of the user |

**Output Example**
```json
{
  "success":true,
  "message": "User updated successfully", 
}
```
----
### `DELETE /:userId`
Soft delete an existing user account.
- **Access**: Private (Admin Only, `manage:users` permission)

**Path Parameters**
| Field | Type | Required | Description |
|---|---|---|---|
| `userId` | string | Yes | The ID of the user to delete |

**Output Example**
```json
{
  "success":true,
  "message": "User deleted successfully"
}
```
----
### `GET /users`
View available users. Analysts can only view users in their own department.
Only Admin can access all users.
- **Access**: Private (Admin / Analyst, `read:all` permission)

**Query Parameters**
| Field | Type | Required | Description |
|---|---|---|---|
| `role` | enum | No | Filter users by a specific role |
| `department` | string | No | Filter users by department |

**Output Example**
```json
{
  "success":true,
  "message": "Users fetched successfully",
  "data": [
    {
      "_id": "60d0fe4f5311236168a109ca",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "Viewer",
      "department": "Finance",
      "isVerified": true,
      "createdAt": "2022-01-01T00:00:00.000Z",
      "updatedAt": "2022-01-01T00:00:00.000Z"
    }
  ]
}
```

----

### 💳 Transactions Routes (`/api/v1/transaction`)

### `POST /`
Create a new financial transaction.
- **Access**: Private (ADMIN Only)

**Body Parameters**
| Field | Type | Required | Description |
|---|---|---|---|
| `amount` | number | Yes | Must be positive |
| `type` | enum | Yes | `income` or `expense` |
| `category` | string | Yes | Transaction category |
| `department` | string | Yes | Department making the transaction |
| `date` | string/Date | Yes | Transaction date |
| `description` | string | No | Optional notes |
| `reference` | string | No | External reference or receipt ID |

**Output Example**
```json
{
  "success":true,
  "message": "Transaction created successfully",
  "data": {
   "_id": "60d0fe4f5311236168a109ca",
    "amount": 15184,
    "type": "income", // or "expense"
    "category": "ads",
    "department": "marketing",
    "date": "2026-04-05T00:00:00.000Z",
    "description": "Spent on Facebook Ads",
    "reference": "FB-001",
    "userId": "60d0fe4f5311236168a109ca",
    "createdAt": "2026-04-05T00:00:00.000Z",
    "updatedAt": "2026-04-05T00:00:00.000Z"
  }
}
```
----
### `PATCH /:id`
Alter an existing transaction entity.
- **Access**: Private (ADMIN Only)

**Path Parameters**
| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Transaction ID |

**Body Parameters**
| Field | Type | Required | Description |
|---|---|---|---|
| `amount` | number | No | Must be positive |
| `type` | enum | No | `income` or `expense` |
| `category` | string | No | Transaction category |
| `department` | string | No | Department making the transaction |
| `date` | string/Date | No | Transaction date |
| `description` | string | No | Optional notes |
| `reference` | string | No | External reference or receipt ID |

**Output Example**
```json
{
  "success":true,
  "message": "Transaction updated successfully",
  "data":  {
   "_id": "60d0fe4f5311236168a109ca",
    "amount": 15184,
    "type": "income", // or "expense"
    "category": "ads",
    "department": "marketing",
    "date": "2026-04-05T00:00:00.000Z",
    "description": "Spent on Facebook Ads",
    "reference": "FB-001",
    "userId": "60d0fe4f5311236168a109ca",
    "createdAt": "2026-04-05T00:00:00.000Z",
    "updatedAt": "2026-04-05T00:00:00.000Z"
  }
}
```
----
### `DELETE /:id`
Execute a Soft-Delete on a transaction entity.
- **Access**: Private (Authenticated with `delete` permission)

**Path Parameters**
| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Transaction ID |

**Output Example**
```json
{
  "success":true,
  "message": "Transaction deleted successfully"
}
```
----
### `GET /`
Fetch a paginated, filterable list of transaction history.
- **Access**: Private (Authenticated with `read:limited` permission)

**Query Parameters**
| Field | Type | Required | Description |
|---|---|---|---|
| `page` | number | No | Default `1` |
| `limit` | number | No | Default `10` |
| `type` | string | No | Filter by `income` or `expense` |
| `department` | string | No | Filter by department |
| `category` | string/array | No | Filter by one or multiple categories |
| `startDate` | string/Date | No | Filter from date |
| `endDate` | string/Date | No | Filter to date |
| `userId` | string | No | Filter by user ID |

**Output Example**
```json
{
  "success":true,
  "message": "Transactions fetched successfully",
  "data": [
     {
   "_id": "60d0fe4f5311236168a109ca",
    "amount": 15184,
    "type": "income", // or "expense"
    "category": "ads",
    "department": "marketing",
    "date": "2026-04-05T00:00:00.000Z",
    "description": "Spent on Facebook Ads",
    "reference": "FB-001",
    "userId": "60d0fe4f5311236168a109ca",
    "createdAt": "2026-04-05T00:00:00.000Z",
    "updatedAt": "2026-04-05T00:00:00.000Z"
  }
  ],
  "meta": {
    "page": 1,
    "limit": 1,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```
----
### `GET /summary`
Fetch high-level analytics aggregation. Results are cached via Redis for performance. After caching the responses ms declined from `114ms` to `24ms`.
The cache is auto invalidated when updates are performed in transaction model.
- **Access**: Private (Admin / Analyst, `read:all` permission)

**Query Parameters**
| Field | Type | Required | Description |
|---|---|---|---|
| `userId` | string | No | Filter by user ID |
| `department` | string | No | Filter by department (Filter Only allowed for Admin) |
| `role` | string | No | Filter by user role (Filter Only allowed for Admin) |
| `startDate` | string/Date | No | Filter from date |
| `endDate` | string/Date | No | Filter to date |

**Output Example**
```json
{
  "success":true,
  "message": "Summary fetched successfully",
  "data": {
    "totalIncome": 245000,
    "totalExpense": 98000,
    "netBalance": 147000,
    "categoryWise": [
      { "category": "Salary", "income": 200000, "expense": 0 },
      { "category": "Food", "income": 0, "expense": 25000 },
      { "category": "Rent", "income": 0, "expense": 45000 },
      ...
    ],
    "recentActivity": [
      { "id": "...", "amount": 5000, "type": "expense", "category": "Food", "date": "2026-04-01", "description": "Lunch" },
      ...
    ],
    "monthlyTrends": [
      { "month": "2026-03", "income": 120000, "expense": 45000, "balance": 75000 },
      { "month": "2026-02", "income": 110000, "expense": 52000, "balance": 58000 },
      ...
    ]
  }
}
```

----

### AI Chat Routes (`/api/v1/chat`)

### `POST /`
Query the Google Gemini AI to get personalized and customized insights about transaction data.
- **Access**: Private (Admin / Analyst)

**Body Parameters**
| Field | Type | Required | Description |
|---|---|---|---|
| `message` | string | Yes | The prompt query (Ex: Which department has the highest expenses in last 3 months?) |
| `sessionId` | string | No | To continue an existing conversation |

**IMPORTANT: This is SSE Type Response not HTTP. Refer Doing Postman for this request to get clear example**

**Output Example**
```json
{
   "type":"token",
    "message": "Hello! The Marketing department has the highest expenses in the last 3 months with over $45,554 spent in 3 months."
}
```
----
### `GET /`
Pull a chronological list of historical AI chat sessions of the user.
- **Access**: Private (Admin / Analyst)

**Output Example**
```json
{
  "success":true,
  "message": "AI Chat sessions fetched successfully",
  "data": [
    {
      "_id": "chat_8f7b2c9d",
      "title": "Engineering Q1 Review",
      "createdAt": "2026-04-05T12:00:00.000Z"
    }
  ]
}
```
----
### `GET /:id`
Retrieve explicit messages for a specific session to render the conversation UI.
- **Access**: Private (Admin / Analyst)

**Path Parameters**
| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Session ID |

**Output Example**
```json
{
  "success":true,
  "message": "AI Chat session fetched successfully",
  "data": {
   "session":{
      "_id": "chat_8f7b2c9d",
      "title": "Engineering Q1 Review",
      "userId": "60d0fe4fa316236168a109ca",
      "createdAt": "2026-04-05T12:00:00.000Z"
   },
    "messages": [
    {
      "_id":"60d0fe4f5311236168a109ca",
      "role": "user",
      "sessionId":"chat_8f7b2c9d",
      "content": "What is the net income for engineering?"
    },
    {
      "_id":"60d0fe4f5311236168a109cb",
      "role": "assistant",
      "sessionId":"chat_8f7b2c9d",
      "content": "Hello! The current net income for the engineering department is $38,000."
    }
  ]
}
}
```
----
### `DELETE /:id`
Hard removes a given AI chat session.
- **Access**: Private (Admin / Analyst)

**Path Parameters**
| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Session ID |

**Output Example**
```json
{
  "success":true,
  "message": "Chat session deleted successfully"
}
```

## Assumptions & Backend Design Decisions

- **Department-Based Access**: Analysts can only access data belonging to their own department. This prevents them from seeing financial data from other departments.
- **Soft Delete**: Instead of permanently deleting records from the database, we use an `isDeleted` flag. This hides the data but keeps it safe in case we need to recover it later.
- **Redis Caching with Auto-Invalidation**: Dashboard summaries are cached in Redis to make the API faster. Whenever a transaction is added, updated, or deleted, Mongoose hooks automatically clear the old cache so users always see the latest data.
- **First Admin Auto-Seeding**: When you start the server for the very first time, it automatically creates a default Admin user so you can log in right away.
- **Built-in Validation**: Using Fastify along with Zod ensures that all incoming request data is strictly validated. If a user sends bad data, the API automatically rejects it with a 400 error before it even reaches the main logic.
