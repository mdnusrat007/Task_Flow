[# ⬡ TaskFlow — Team Task Manager

A full-stack team task management app. Admins create projects and assign tasks; members track and update their work.

**Stack:** React 18 · Node.js · Express · MongoDB · JWT Auth · Railway Deployment

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Prerequisites](#2-prerequisites)
3. [MongoDB Setup](#3-mongodb-setup)
4. [Run Locally — Server](#4-run-locally--server)
5. [Run Locally — Client](#5-run-locally--client)
6. [Environment Variables Reference](#6-environment-variables-reference)
7. [API Reference](#7-api-reference)
8. [railway-deployement](#Deploy-to-Railway)
9. [Roles & Permissions](#9-roles--permissions)

---

## 1. Project Structure

```
taskflow/
├── client/                        # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProtectedRoute.js  # Redirects unauthenticated users
│   │   │   ├── Shared.js          # Modal, Badge, Spinner, Icons
│   │   │   └── Sidebar.js         # Navigation sidebar
│   │   ├── context/
│   │   │   └── AuthContext.js     # Global auth state + JWT storage
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   ├── Dashboard.js       # Stats overview + recent tasks
│   │   │   ├── Projects.js        # Project CRUD
│   │   │   └── Tasks.js           # Task CRUD with filters
│   │   ├── utils/
│   │   │   └── api.js             # Axios instance + all API calls
│   │   ├── App.js                 # Router setup
│   │   ├── index.css              # Global styles
│   │   └── index.js
│   ├── .env.example
│   └── package.json
│
└── server/                        # Express backend
    ├── config/
    │   └── db.js                  # MongoDB connection
    ├── controllers/
    │   ├── authController.js      # signup, login, profile, list users
    │   ├── projectController.js   # CRUD for projects
    │   └── taskController.js      # CRUD for tasks
    ├── middleware/
    │   └── authMiddleware.js      # JWT protect + adminOnly
    ├── models/
    │   ├── User.js                # name, email, password (hashed), role
    │   ├── Project.js             # name, desc, deadline, members[]
    │   └── Task.js                # title, status, assignedTo, project
    ├── routes/
    │   ├── auth.js
    │   ├── projects.js
    │   └── tasks.js
    ├── utils/
    │   └── generateToken.js       # JWT sign helper
    ├── .env.example
    ├── index.js                   # App entry point
    └── package.json
```

---

## 2. Prerequisites

Install these before anything else:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v18 or higher | https://nodejs.org |
| npm | v9 or higher | Comes with Node.js |
| Git | Any | https://git-scm.com |

Verify installation:
```bash
node --version    # Should print v18.x.x or higher
npm --version     # Should print 9.x.x or higher
```

---

## 3. MongoDB Setup

You need a MongoDB database.

---

### MongoDB Atlas (Recommended, Free, Cloud)

**Use this for both local development and production deployment.**

**Step 1:** Go to https://cloud.mongodb.com and create a free account.

**Step 2:** Click **"Build a Database"** → Choose **"M0 Free"** tier → Select any region → Click **"Create"**.

**Step 3:** Create a database user:
- Username: `taskflow_user` (or anything you like)
- Password: generate a strong password and **copy it somewhere safe**
- Click **"Create User"**

**Step 4:** Set network access:
- Click **"Add IP Address"**
- For local dev: click **"Add My Current IP Address"**
- For production (Railway): click **"Allow Access from Anywhere"** → enters `0.0.0.0/0`
- Click **"Confirm"**

**Step 5:** Get your connection string:
- Click **"Connect"** → **"Connect your application"**
- Copy the string. It looks like:
  ```
  mongodb+srv://taskflow_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
  ```
- Replace `<password>` with your actual password
- Add the database name before `?`:
  ```
  mongodb+srv://taskflow_user:yourpassword@cluster0.xxxxx.mongodb.net/taskflow?retryWrites=true&w=majority
  ```
- This is your `MONGODB_URI`

---


## 4. Run Locally — Server

```bash
# Step 1: Navigate to the server folder
cd taskflow/server

# Step 2: Install dependencies
npm install

# Step 3: Create your environment file
.env
```

Now open `server/.env` in any text editor and fill in your values:

```env
MONGODB_URI=mongodb+srv://taskflow_user:yourpassword@cluster0.xxxxx.mongodb.net/taskflow?retryWrites=true&w=majority
JWT_SECRET=you_secret_token
PORT=5000
CLIENT_URL=http://localhost:3000
```

```bash
# Step 4: Start the server
npm run dev
```

You should see:
```
MongoDB connected: cluster0.xxxxx.mongodb.net
Server running on http://localhost:5000
```

**Test the server is alive:**
```bash
curl http://localhost:5000/api/health
# Returns: {"status":"ok","timestamp":"..."}
```

---

## 5. Run Locally — Client

Open a **new terminal window** (keep the server running in the first one).

```bash
# Step 1: Navigate to the client folder
cd taskflow/client

# Step 2: Install dependencies
npm install

# Step 3: Create your environment file
.env
```

Open `client/.env` and set:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

```bash
# Step 4: Start the React development server
npm start
```

The app opens automatically at **http://localhost:3000**

**First time setup:**
1. Go to http://localhost:3000/signup
2. Create an **Admin** account (select role: Admin)
3. Create a second **Member** account to test member permissions
4. Log in as Admin and start creating projects and tasks

---

## 6. Environment Variables Reference

### `server/.env`

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `MONGODB_URI` | ✅ | MongoDB connection string | `mongodb+srv://user:pass@cluster/db` |
| `JWT_SECRET` | ✅ | Secret for signing JWT tokens | `mysupersecretkey123456789` |
| `PORT` | ❌ | Port server listens on (default: 5000) | `5000` |
| `CLIENT_URL` | ✅ | Frontend URL for CORS | `http://localhost:3000` |

### `client/.env`

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:5000/api` |

> All React environment variables **must** start with `REACT_APP_` or React will ignore them.

---

## 7. API Reference

### Base URL
- Local: `http://localhost:5000/api`
- Production: `https://your-server.railway.app/api`

### Authentication Header (all protected routes)
```
Authorization: Bearer <your_jwt_token>
```

---

### Auth Endpoints

#### `POST /api/auth/signup` — Public
**Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "role": "admin"
}
```
**Response `201`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "_id": "...", "name": "Jane Doe", "email": "jane@example.com", "role": "admin" }
}
```

---

#### `POST /api/auth/login` — Public
**Body:**
```json
{ "email": "jane@example.com", "password": "password123" }
```
**Response `200`:** Same as signup response.

---

#### `GET /api/auth/profile` —  Protected
Returns the currently logged-in user object.

---

#### `GET /api/auth/users` —  Protected
Returns all users (used to populate assignment dropdowns in the UI).

---

### Project Endpoints

#### `GET /api/projects` —  Protected
- Admin: returns all projects
- Member: returns only projects they are a member of

---

#### `POST /api/projects` —  Admin only
**Body:**
```json
{
  "name": "Website Redesign",
  "description": "Redesign the company website",
  "deadline": "2025-12-31",
  "members": ["userId1", "userId2"]
}
```

---

#### `PUT /api/projects/:id` —  Admin only
Same fields as POST, all optional (partial update supported).

---

#### `DELETE /api/projects/:id` —  Admin only
Also deletes all tasks belonging to the project.

---

### Task Endpoints

#### `GET /api/tasks` —  Protected
- Admin: all tasks
- Member: only tasks assigned to them

Optional query params: `?status=Todo` · `?project=projectId`

---

#### `POST /api/tasks` —  Admin only
**Body:**
```json
{
  "title": "Design homepage mockup",
  "description": "Create Figma mockup for the homepage",
  "assignedTo": "userId",
  "project": "projectId",
  "status": "Todo",
  "deadline": "2025-11-15"
}
```
Status values: `Todo` · `In Progress` · `Completed`

---

#### `PUT /api/tasks/:id` —  Protected
- Admin: can update any field
- Member: can only update `status` on tasks assigned to them

---

#### `DELETE /api/tasks/:id` —  Admin only

---

### Error Response Format
All errors follow this shape:
```json
{ "message": "Description of what went wrong" }
```

Common status codes: `400` Bad Request · `401` Unauthorized · `403` Forbidden · `404` Not Found · `500` Server Error

---

## 8. Deploy to Railway

Railway hosts both the Node.js server and React client as separate services.

### Before You Start
- Push your code to GitHub: `git push origin main`
- Have your MongoDB Atlas URI ready (see Section 3, Option A)
- Create a free Railway account at https://railway.app (sign in with GitHub)

---

### Step 1 — Deploy the Server

1. On the Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"** → choose your repository
3. Railway detects Node.js automatically
4. Click the service → go to **"Settings"** tab
5. Set **Root Directory** to `server`
6. Under **"Deploy"**, set:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
7. Go to the **"Variables"** tab and add these one by one:

   | Key | Value |
   |-----|-------|
   | `MONGODB_URI` | Your Atlas connection string |
   | `JWT_SECRET` | A long random string (30+ chars) |
   | `PORT` | `5000` |
   | `CLIENT_URL` | Leave blank for now — fill in after client is deployed |

8. Go to **"Settings" → "Networking"** → click **"Generate Domain"**
9. Copy the generated domain — it looks like `https://server-production-xxxx.up.railway.app`

---

### Step 2 — Deploy the Client

1. In the same Railway project, click **"+ New"** → **"GitHub Repo"** (same repo)
2. Click the new service → **"Settings"**
3. Set **Root Directory** to `client`
4. Under **"Deploy"**, set:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npx serve -s build -l 3000`
5. Go to **"Variables"** and add:

   | Key | Value |
   |-----|-------|
   | `REACT_APP_API_URL` | `https://your-server-domain.up.railway.app/api` |

   Replace `your-server-domain` with the actual server domain from Step 1.

6. Go to **"Settings" → "Networking"** → click **"Generate Domain"**
7. Copy this client domain

---

### Step 3 — Update Server CORS

1. Go back to the **server service** → **"Variables"**
2. Update `CLIENT_URL` to your client's Railway domain:
   ```
   CLIENT_URL=https://your-client-domain.up.railway.app
   ```
3. Railway will automatically redeploy the server

---

### Step 4 — Verify Everything Works

1. Open your client Railway URL in a browser
2. Sign up with an Admin account
3. Create a project, add a member, create and assign tasks
4. Log in with the member account to verify member permissions

**Check server logs:** In Railway, click the server service → **"Deployments"** → click the latest deploy → view logs. You should see:
```
MongoDB connected: cluster0.xxxxx.mongodb.net
Server running on http://0.0.0.0:5000
```

---

### Railway Deployment Checklist

```
✅ MongoDB Atlas created with correct IP whitelist (0.0.0.0/0)
✅ Server deployed with MONGODB_URI, JWT_SECRET, PORT, CLIENT_URL
✅ Client deployed with REACT_APP_API_URL pointing to server
✅ Both services have generated domains
✅ SERVER's CLIENT_URL updated to client's Railway domain
✅ Both services show "Active" status in Railway dashboard
```

---

## 9. Roles & Permissions

| Action | Admin | Member |
|--------|:-----:|:------:|
| Sign up / Log in | ✅ | ✅ |
| View dashboard stats | ✅ | ✅ |
| View own assigned projects | ✅ | ✅ |
| View all projects | ✅ | ❌ |
| Create / Edit / Delete project | ✅ | ❌ |
| Add members to project | ✅ | ❌ |
| Create task & assign to user | ✅ | ❌ |
| View own assigned tasks | ✅ | ✅ |
| View all tasks | ✅ | ❌ |
| Update task status (own tasks) | ✅ | ✅ |
| Edit all task fields | ✅ | ❌ |
| Delete task | ✅ | ❌ |
](https://github.com/mdnusrat007/Task_Flow.git)