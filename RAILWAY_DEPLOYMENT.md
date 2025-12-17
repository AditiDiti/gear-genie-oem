# Railway Deployment Guide

## Prerequisites

- Railway account and project created
- Backend and frontend repositories connected

## Backend Deployment Steps

### Step 1: Set Up PostgreSQL Database on Railway

1. Go to Railway Dashboard
2. Click "Create New" → Select "PostgreSQL"
3. Wait for PostgreSQL instance to initialize
4. Go to PostgreSQL service "Connect" tab → copy the Database URL

### Step 2: Configure Environment Variables

In Railway Backend Project Settings → Variables:

```
DATABASE_URL=<paste PostgreSQL URL from step 1>
SECRET_KEY=<run: python -c "import secrets; print(secrets.token_urlsafe(32))" and paste result>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### Step 3: Connect Backend to PostgreSQL

1. Add environment variable:
   ```
   DATABASE_URL=postgresql://user:password@host:port/dbname
   ```
2. Railway automatically detects and uses this for the connection

### Step 4: Configure CORS

If your frontend URL is different from the defaults, add:

```
CORS_ORIGINS=http://localhost:3000,https://your-frontend-url.vercel.app
```

### Step 5: Deploy

- Push to main branch (or your connected branch)
- Railway automatically deploys
- Monitor logs in Railway Dashboard

## Frontend Deployment Steps

### Step 1: Set Environment Variable

In Railway Frontend Project Settings → Variables:

```
NEXT_PUBLIC_API_BASE_URL=https://your-backend-railway-url.up.railway.app
```

Get the backend URL from: Backend Service → Settings → Generate Domain

### Step 2: Deploy

- Push to main branch
- Railway automatically builds and deploys Next.js

## Verification

1. **Check Backend Logs:**

   ```
   ✅ Database tables created successfully
   ✅ Database already initialized with X users
   ```

2. **Test Login:**

   - Go to frontend URL
   - Login with: `ford_admin@oem.com` / `admin123`
   - Should see dashboard with data

3. **Check API Health:**
   ```bash
   curl https://your-backend-url.up.railway.app/docs
   ```

## Troubleshooting

### "Invalid or expired token" errors

- Check `NEXT_PUBLIC_API_BASE_URL` is set correctly on frontend
- Verify `SECRET_KEY` is the same on backend
- Check browser console for actual API URL being called

### Database connection errors

- Verify `DATABASE_URL` is correct PostgreSQL URL
- Check Railway PostgreSQL service is running
- Ensure firewall allows Railway connections

### CORS errors

- Check `CORS_ORIGINS` includes your frontend URL
- Remember to include `https://` prefix for production

### Data not loading

- Verify CSV files are committed to git in `data/processed/`
- Check backend logs for file path errors
- Ensure brand directories match database user brands

## Local Development

To test locally before deploying:

```bash
cd backend
python -m uvicorn app.main:app --reload
```

Then in another terminal:

```bash
cd frontend
npm run dev
```

Visit: http://localhost:3000
