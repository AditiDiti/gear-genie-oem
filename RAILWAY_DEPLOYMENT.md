# Railway Deployment Guide (SQLite MVP)

## Prerequisites

- Railway account created
- Backend repository connected to Railway
- Frontend already deployed on Vercel

## Backend Deployment Steps (SQLite)

### Step 1: Configure Environment Variables on Railway

In Railway Backend Project Settings → **Variables**, add:

```
SECRET_KEY=<Generate with: python -c "import secrets; print(secrets.token_urlsafe(32))">
CORS_ORIGINS=http://localhost:3000,https://your-vercel-frontend-url.vercel.app
```

**⚠️ Important:** Do NOT set `DATABASE_URL` — SQLite will be used automatically. Your `db.py` defaults to SQLite when `DATABASE_URL` is not set.

### Step 2: Deploy to Railway

1. Go to **Railway Dashboard** → Create new project
2. Select **GitHub** → Connect your repository
3. Railway auto-detects `Procfile` and deploys automatically
4. Wait for deployment to complete
5. Monitor logs in Railway dashboard

### Step 3: Get Your Backend URL

1. Go to Backend Service → **Settings**
2. Click **Generate Domain** to get your public backend URL
3. Copy the domain (e.g., `https://your-backend.up.railway.app`)

### Step 4: Update Frontend Environment Variable

Your frontend on Vercel needs the backend URL:

In Vercel Project → Settings → Environment Variables:

```
NEXT_PUBLIC_API_BASE_URL=https://your-backend.up.railway.app
```

Redeploy frontend to apply the change.

## Verification Steps

1. **Check Backend Logs:**

   ```
   ✅ Database tables created successfully
   ✅ Users created or already initialized
   ```

2. **Test Login:**

   - Go to your Vercel frontend URL
   - Login with default credentials (created in `create_user.py`):
     - Email: `ford_admin@oem.com`
     - Password: `admin123`
     - Brand: `ford`
   - Dashboard should load with data

3. **Check API Docs:**
   ```
   https://your-backend.up.railway.app/docs
   ```
   Should show FastAPI Swagger documentation

## Important Notes on SQLite + Railway

- **Ephemeral Storage:** Railway uses ephemeral filesystems. If the Railway dyno restarts, your SQLite data (user database) may be lost.
- **For Production:** Consider migrating to PostgreSQL when moving beyond MVP.
- **Current Setup:** Perfect for MVP/testing since user data is recreated on startup via `init_db()`.

## Troubleshooting

### "Invalid or expired token" error

- Verify `NEXT_PUBLIC_API_BASE_URL` is correct on frontend (without trailing slash)
- Check `SECRET_KEY` matches between backend and token generation
- Check browser console for actual API calls being made

### "Brand mismatch – access denied" error

- Ensure login brand matches your data folder (e.g., `ford`, `bmw`, `audi`)
- Check `data/processed/` has the brand folder

### Data not appearing

- Verify CSV files exist in `data/processed/{brand}/` folder
- Check Railway logs for CSV loading errors
- Ensure `BASE_DATA_DIR` path is correctly resolved

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
