# Fintech Backend

A secure and scalable backend system for a finance dashboard with Role-Based Access Control (RBAC), financial transaction management, dashboard analytics, and an optional AI-powered chat assistant for deeper insights.

## Features

- **Fastify Framework**: High-performance Node.js backend with low overhead and built-in schema validation.
- **Secure Authentication**: JWT-based authentication stored in HttpOnly cookies with bcrypt password hashing.
- **Role-Based Access Control (RBAC)**: Three-tier access — Viewer (restricted), Analyst (department-level), and Admin (full access).
- **Financial Records Management**: Complete CRUD operations for transactions with department-based filtering.
- **Dashboard Analytics**: Aggregated summary endpoints with totals, category-wise breakdown, recent activity, and monthly trends.
- **Redis Caching**: Smart caching for dashboard summaries with automatic invalidation on data changes.
- **Data Safety**: Soft delete implementation for both users and transactions.
- **AI Chat Assistant** (Optional Enhancement): Google Gemini integration allowing Admins and Analysts to ask natural language questions about financial data.
- **Strict Validation**: Zod + Fastify schema validation for all incoming requests.

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Fastify
- **Database**: MongoDB with Mongoose
- **Caching**: Redis
- **Security**: JWT, bcrypt
- **Validation**: Zod + fastify-type-provider-zod
- **AI**: Google Gemini (`@google/genai`)
- **DevOps**: Docker, Docker Compose

## Project Structure

```text
Fintech-backend/
├── docker-compose.yml
├── Dockerfile
├── package.json
├── .env.example
└── src/
    ├── app.ts
    ├── server.ts
    ├── config/
    ├── constants/
    ├── controllers/
    ├── middlewares/
    ├── models/
    ├── routes/
    ├── seeders/           # Initial admin seeder
    ├── services/
    ├── types/
    ├── utils/
    └── validators/
```

## Prerequisites

- Node.js (v18 or higher)
- Docker & Docker Compose (strongly recommended)
- pnpm (used as package manager)

## Environment Variables

Copy `.env.example` to `.env` and configure the values:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://mongo:27017/fintech //Optional If using Docker
REDIS_URL=redis://redis:6379 //Optional If using Docker
JWT_SECRET=your_strong_jwt_secret_key
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key_here   # Required only for AI chat feature
```

## Setup & Installation

### Option 1: Using Docker (Recommended)

```bash
# 1. Clone the repo
git clone https://github.com/AtulYadav25/fintech.git
cd fintech

# 2. Add Your .env file

# 3. Start all services
docker-compose up --build
```

The application will be available at `http://localhost:3000`.

### Option 2: Manual Installation

```bash
# 1. Clone and install
git clone https://github.com/AtulYadav25/fintech.git
cd fintech
pnpm install

# 2. Start MongoDB and Redis locally
# 3. Update .env file with correct connection strings
# 4. Run in development
pnpm dev
```

**Initial Admin** (auto-seeded on first run):
- Email: `admin@company.com`
- Password: `Admin@9870245`

## Role-Based Access Control

| Feature                    | Viewer              | Analyst                    | Admin                  |
|---------------------------|---------------------|----------------------------|------------------------|
| View Transactions         | Own records only    | Own department             | All records            |
| Dashboard Summary         | No                  | Own department             | Full access            |
| Manage Transactions       | No                  | No                         | Full CRUD              |
| Manage Users              | No                  | No                         | Yes                    |
| AI Chat Assistant         | No                  | Yes (Own dept)             | Yes                    |

## API Routes Documentation

All authenticated routes require a valid JWT token in HttpOnly cookie.

### Auth Routes (`/api/v1/auth`)

- `POST /signup` — Register new user (Public)
- `POST /login` — User login (Public)
- `POST /logout` — Logout user
- `PATCH /verify/:userId` — Verify user (Admin only)
- `PATCH /:userId` — Update user role/department (Admin only)
- `DELETE /:userId` — Soft delete user (Admin only)
- `GET /users` — List users (Admin + Analyst - department restricted)

### Transaction Routes (`/api/v1/transaction`)

- `POST /` — Create transaction (Admin only)
- `GET /` — Get paginated transactions (role-based)
- `PATCH /:id` — Update transaction (Admin only)
- `DELETE /:id` — Soft delete transaction (Admin only)
- `GET /summary` — Dashboard analytics with caching (Analyst + Admin)

### AI Chat Routes (`/api/v1/chat`) — Optional Enhancement

- `POST /` — Ask natural language questions about financial data (SSE response)
- `GET /` — List chat sessions
- `GET /:id` — Get messages of a session
- `DELETE /:id` — Delete chat session

**Note**: AI Chat uses Server-Sent Events (SSE). Test using Postman or appropriate SSE client.


## Assumptions & Design Decisions

- Analyst has access only to their own department's data.
- Viewer is restricted to their own records only.
- Soft delete used for data safety.
- Redis caching with automatic invalidation on every write operation.
- Initial admin auto-seeded for easy setup.
- Strict Zod validation on all endpoints.