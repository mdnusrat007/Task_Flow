# Deployment Guide - Railway (Frontend & Backend)

This project is now configured for deployment without Docker:
- **Frontend**: Railway (static site)
- **Backend**: Railway (Node.js API)

## Prerequisites

1. **GitHub Account** with repository access
2. **Railway Account** (free tier available at [railway.app](https://railway.app))
3. **Environment Variables** configured as GitHub Secrets

## Setup Instructions

### 1. Railway Project Setup

#### Step 1: Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Create new project → "Deploy from GitHub repo"
4. Select this repository

#### Step 2: Configure Services
Railway will automatically detect two services:
- **Frontend** (client directory)
- **Backend** (server directory)

If not auto-detected, you can manually add services:
1. Add service for frontend (static site)
2. Add service for backend (Node.js)

#### Step 3: Set Environment Variables on Railway

In Railway project dashboard, set variables for each service:

**Backend Service Variables:**
```
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret-key>
CLIENT_URL=<your-frontend-railway-url>
PORT=5000
NODE_ENV=production
```

**Frontend Service Variables:**
```
VITE_API_URL=<your-backend-railway-url>
```

For MongoDB, use:
- **MongoDB Atlas** (free tier): [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
- **Railway MongoDB Plugin**: Add from Railway dashboard

For MongoDB, use:
- **MongoDB Atlas** (free tier): [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
- **Railway MongoDB Plugin**: Add from Railway dashboard

#### Step 3: Get Railway API Token

1. Go to Railway Account Settings → Tokens
2. Create new token
3. Copy the token

#### Step 4: Add GitHub Secrets

Go to your GitHub repo → Settings → Secrets and variables → Actions

Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `RAILWAY_TOKEN` | Your Railway API token |
| `MONGODB_URI` | Your MongoDB connection string |
| `JWT_SECRET` | Any secure random string (use `openssl rand -base64 32`) |
| `CLIENT_URL` | Your Railway frontend URL (will be auto-generated) |
| `VITE_API_URL` | Your Railway backend URL (will be auto-generated) |

### 3. Update API Configuration

The frontend automatically appends `/api` to the base URL. Set the base URL to your backend domain only:

**For development** (create `.env.local` in client folder):
```
VITE_API_URL=http://localhost:5000
```

**For production on Railway**, the secret will automatically append `/api` to requests (e.g., `https://your-backend.railway.app/api/auth/signup`).

### 4. Deploy!

Simply push to the `main` branch:

```bash
git add .
git commit -m "Remove Docker and setup Railway deployment"
git push origin main
```

**GitHub Actions will automatically:**
1. Build the frontend
2. Deploy both frontend and backend to Railway

Monitor the deployment in:
- GitHub: Actions tab
- Railway: Dashboard

## Troubleshooting

### Frontend not loading
- Check Railway frontend service logs
- Verify `VITE_API_URL` is set correctly in Railway
- Check if build completed successfully

### Backend API calls failing
- Verify `VITE_API_URL` secret is set correctly
- Check CORS is configured on Railway backend
- Verify MongoDB connection string
- Check Railway backend service logs

### Railway deployment stuck
- Check Railway service logs in dashboard
- Verify PORT is set to 5000 for backend
- Ensure package.json has correct scripts
- Check if Railway detected services correctly

## Manual Deployment Commands

### Local Frontend Build
```bash
cd client
npm install
npm run build
# Build output in client/dist/
```

### Local Backend
```bash
cd server
npm install
npm start
# Runs on http://localhost:5000
```

## Next Steps

- Set up custom domain for Railway services
- Configure MongoDB backups
- Add monitoring/logging (Sentry, LogRocket)
- Set up CI/CD for testing before deployment
- Configure Railway environments (staging/production)

