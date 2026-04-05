# Zorvyn Fintech Backend

A high-performance, robust backend service for the Zorvyn Fintech platform, featuring Role-Based Access Control, real-time analytics caching, and AI-powered chat assistance.

## Features

- **Blazing Fast API**: Built with Node.js and Fastify for modern, low-overhead request handling.
- **Secure Authentication**: Cookie-based JWT authentication with password hashing (Bcrypt).
- **Advanced Role-Based Access Control (RBAC)**: Fine-grained permissions allowing localized `Viewer`, `Analyst` (Department level), and global `Admin` (Root level) access control.
- **AI-Powered Chat Assistant**: Integrated Google Gemini AI functionality for admins to interact seamlessly with their data sessions.
- **High-Performance Caching**: Redis integration for dashboard/summary endpoints, with automatic cache invalidation hooks upon database writes.
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
PORT=5000                                          # API Port (default 5000)
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

## API Routes Documentation

| Method | Endpoint | Description | Access | Notes |
|---|---|---|---|---|
| **Auth** | | | | |
| POST | `/signup` | Register a new user | Public | |
| POST | `/login` | Authenticate and get JWT token | Public | Yields HttpOnly Session Cookie |
| POST | `/logout` | Logout user | Authenticated | Clears cookies |
| PATCH | `/verify/:userId` | Verify a newly registered user account | Admin | `manage:users` perm required |
| PATCH | `/:userId` | Update user role and/or department context | Admin | |
| DELETE | `/:userId` | Soft delete an existing user account | Admin | |
| GET | `/all` | View available users | Admin / Analyst | Analysts restricted inherently |
| **Transactions**| | | | |
| POST | `/transactions/` | Create a new transaction | Admin | Triggers Redis invalidation |
| PATCH | `/transactions/:id` | Alter transaction information | Admin | Triggers Redis invalidation |
| DELETE | `/transactions/:id` | Drop a given transaction entity | Admin | Executes a Soft-Delete |
| GET | `/transactions/` | View transaction history lists | All Roles | |
| GET | `/transactions/summary`| Fetch high-level analytics aggregation | Admin / Analyst | Results are cached via Redis |
| **AI Chat** | | | | |
| POST | `/chat/` | Query Gemini and save message context | Admin / Analyst | |
| GET | `/chat/` | Pull a chronological list of chat sessions | Admin / Analyst | |
| GET | `/chat/:id` | Retrieve explicit messages for a session | Admin / Analyst | |
| DELETE | `/chat/:id` | Hard removes a given AI chat session | Admin / Analyst | |

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

## Assumptions & Backend Design Decisions

- **Department-Based Access**: Analysts can only access data belonging to their own department. This prevents them from seeing financial data from other departments.
- **Soft Delete**: Instead of permanently deleting records from the database, we use an `isDeleted` flag. This hides the data but keeps it safe in case we need to recover it later.
- **Redis Caching with Auto-Invalidation**: Dashboard summaries are cached in Redis to make the API faster. Whenever a transaction is added, updated, or deleted, Mongoose hooks automatically clear the old cache so users always see the latest data.
- **First Admin Auto-Seeding**: When you start the server for the very first time, it automatically creates a default Admin user so you can log in right away.
- **Built-in Validation**: Using Fastify along with Zod ensures that all incoming request data is strictly validated. If a user sends bad data, the API automatically rejects it with a 400 error before it even reaches the main logic.
