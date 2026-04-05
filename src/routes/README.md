# Auth Routes (`/api/v1/auth`)

## `POST /signup`
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
## `POST /login`
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
## `POST /logout`
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
## `PATCH /verify/:userId`
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
## `PATCH /:userId`
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
## `DELETE /:userId`
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
## `GET /users`
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

## Transactions Routes (`/api/v1/transaction`)

## `POST /`
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
## `PATCH /:id`
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
## `DELETE /:id`
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
## `GET /`
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
## `GET /summary`
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

# AI Chat Routes (`/api/v1/chat`)

## `POST /`
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
## `GET /`
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
## `GET /:id`
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
## `DELETE /:id`
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