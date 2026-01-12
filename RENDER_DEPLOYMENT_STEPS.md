# 🚀 CHABUK XI - Render Deployment Guide

## Step 1: Push Code to GitHub

### Commands to run in your terminal:

```bash
# Navigate to your project directory
cd c:/Users/denia/Tickets

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit the code
git commit -m "Initial commit - CHABUK XI Ticket Management System"

# Add your GitHub repository as remote
git remote add origin https://github.com/denialp88/tickets.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Note**: If you get an authentication error, you may need to:
1. Generate a Personal Access Token on GitHub (Settings → Developer settings → Personal access tokens)
2. Use the token as your password when prompted

---

## Step 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to https://render.com
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

### 2.2 Create New Web Service

1. **Click "New +"** → Select **"Web Service"**

2. **Connect Repository**:
   - Find and select: `denialp88/tickets`
   - Click "Connect"

3. **Configure Service**:
   
   **Basic Settings:**
   - **Name**: `chabuk-xi-backend` (or any name you prefer)
   - **Region**: Choose closest to your location
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   
   **Build & Deploy:**
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   
   **Instance Type:**
   - Select **"Free"** (for testing)

4. **Add Environment Variables**:
   
   Click **"Advanced"** → **"Add Environment Variable"**
   
   Add these variables:
   
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `JWT_SECRET` | `your-super-secret-jwt-key-change-this-now-12345` |
   | `PORT` | `3001` |

   **⚠️ IMPORTANT**: Change the JWT_SECRET to a random secure string!
   
   Generate a secure JWT_SECRET:
   ```bash
   # On Windows PowerShell:
   -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
   
   # Or use any random 32+ character string
   ```

5. **Create Web Service**:
   - Click **"Create Web Service"**
   - Wait 3-5 minutes for deployment to complete

6. **Get Your Backend URL**:
   - Once deployed, you'll see: `https://chabuk-xi-backend.onrender.com`
   - **Save this URL** - you'll need it for frontend deployment!

### 2.3 Test Your Backend

Once deployed, test these endpoints:

```bash
# Health check (should return HTML or 404 - that's OK)
https://chabuk-xi-backend.onrender.com

# Login endpoint (should return error about missing credentials)
https://chabuk-xi-backend.onrender.com/api/auth/login
```

If you see responses (even errors), your backend is working! ✅

---

## Step 3: Important Notes

### Database on Render
- SQLite database will be created automatically
- **⚠️ WARNING**: Free tier Render instances sleep after 15 minutes of inactivity
- When instance sleeps, the database is **LOST** (ephemeral storage)
- For production, upgrade to paid plan ($7/month) for persistent storage

### Default Credentials
After deployment, you can login with:
- **Admin**: `admin` / `admin123`
- **Booker**: `booker` / `booker123`

**⚠️ Change these passwords immediately after first login!**

---

## Step 4: Troubleshooting

### Deployment Failed?

**Check Build Logs:**
1. Go to your service on Render
2. Click "Logs" tab
3. Look for error messages

**Common Issues:**

1. **"Cannot find module"**
   - Solution: Make sure `package.json` is in the `server` folder
   - Check Root Directory is set to `server`

2. **"Port already in use"**
   - Solution: Render assigns port automatically, make sure your code uses `process.env.PORT`

3. **"Build failed"**
   - Solution: Check Node version compatibility
   - Add to `server/package.json`:
     ```json
     "engines": {
       "node": ">=18.0.0"
     }
     ```

### Backend Not Responding?

1. **Check Service Status**: Should show "Live" with green dot
2. **View Logs**: Look for "Server running on..." message
3. **Test API**: Try accessing `/api/auth/login` endpoint

---

## Step 5: Next Steps - Frontend Deployment

Once your backend is deployed and you have the URL:

1. **Update Frontend Configuration**:
   - Create `client/.env` file
   - Add: `VITE_API_URL=https://your-backend-url.onrender.com/api`

2. **Deploy Frontend to Netlify** (instructions will be provided next)

---

## 📞 Need Help?

If deployment fails:
1. Check Render logs for errors
2. Verify all environment variables are set
3. Make sure Root Directory is `server`
4. Confirm Build Command is `npm install`
5. Confirm Start Command is `npm start`

---

## ✅ Success Checklist

- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] Web Service created and connected to GitHub
- [ ] Environment variables added (NODE_ENV, JWT_SECRET, PORT)
- [ ] Deployment completed successfully
- [ ] Backend URL obtained
- [ ] Backend tested and responding
- [ ] Ready for frontend deployment

---

**Your Backend URL**: `https://chabuk-xi-backend.onrender.com`
(Replace with your actual URL after deployment)

**Next**: We'll deploy the frontend to Netlify once backend is live! 🎉
