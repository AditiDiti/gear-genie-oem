# Railway Deployment Checklist

## Before You Deploy

- [ ] All code committed to git
- [ ] Both backend and frontend are working locally
- [ ] Frontend is already deployed on Vercel
- [ ] You have a Railway account

## Railway Backend Setup (5 minutes)

1. [ ] Go to [Railway.app](https://railway.app)
2. [ ] Create a new project → Select GitHub
3. [ ] Connect to your backend repository
4. [ ] Railway auto-detects Procfile and starts deployment
5. [ ] Wait for build to complete (check logs)

## Configure Environment Variables on Railway

Go to: **Backend Service → Settings → Variables**

```
SECRET_KEY=<paste generated key>
CORS_ORIGINS=http://localhost:3000,https://your-vercel-url.vercel.app
```

Generate `SECRET_KEY` with:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**DO NOT** add `DATABASE_URL` — SQLite will work by default

## Get Your Backend URL

1. Go to Backend Service → **Settings**
2. Click **Generate Domain**
3. Copy the URL (e.g., `https://your-backend.up.railway.app`)

## Update Frontend Environment Variable

1. Go to Vercel → Your Project → **Settings → Environment Variables**
2. Add/Update:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-backend.up.railway.app
   ```
3. Click **Redeploy**

## Verify Everything Works

1. **Test backend health:**

   ```
   https://your-backend.up.railway.app/docs
   ```

   You should see Swagger API docs

2. **Test login on frontend:**

   - Go to your Vercel frontend URL
   - Login with: `ford_admin@oem.com` / `admin123` / brand: `ford`
   - Dashboard should load with data

3. **Check Railway logs for errors:**
   - Go to Backend Service → **Logs**
   - Look for `✅ Database tables created successfully`

## Default Test Accounts

(Created automatically on first run)

```
Email: {brand}_admin@oem.com
Password: admin123
Brand: audi, bmw, chevrolet, ford, honda, hyundai, kia, mercedes-benz, nissan, toyota
```

Example:

- `audi_admin@oem.com` / `admin123` → Audi data
- `bmw_admin@oem.com` / `admin123` → BMW data
- `ford_admin@oem.com` / `admin123` → Ford data

## Troubleshooting

### 502 Bad Gateway or Deployment Fails

- Check **Logs** in Railway
- Ensure `requirements.txt` is in `/backend/` folder
- Verify Python version is compatible (3.8+)

### "Brand mismatch" or "Invalid credentials"

- Check data exists in `data/processed/{brand}/`
- Verify CSV file names match exactly (case-sensitive)

### Frontend can't reach backend

- Verify `NEXT_PUBLIC_API_BASE_URL` is set on Vercel
- Check it matches your Railway backend domain (no trailing slash)
- Redeploy frontend after changing URL

### Database errors

- SQLite file is ephemeral on Railway (data lost on restart)
- Users are recreated automatically via `init_db()`
- For permanent storage, migrate to PostgreSQL later

## Need Help?

- Railway Docs: https://docs.railway.app
- FastAPI Docs: https://fastapi.tiangolo.com/
- Check logs in Railway dashboard for specific errors
