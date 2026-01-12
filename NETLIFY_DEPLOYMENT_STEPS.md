# 🌐 CHABUK XI - Netlify Frontend Deployment Guide

## ✅ Prerequisites
- Backend deployed at: **https://chabuk-xi-backend.onrender.com**
- Code updated and pushed to GitHub

---

## 🚀 Deploy Frontend to Netlify

### **Step 1: Create Netlify Account**

1. Go to: https://netlify.com
2. Click **"Sign up"**
3. Choose **"Sign up with GitHub"**
4. Authorize Netlify to access your repositories

---

### **Step 2: Create New Site**

1. Click **"Add new site"** → **"Import an existing project"**
2. Choose **"Deploy with GitHub"**
3. Find and select: **`denialp88/tickets`**
4. Click on the repository

---

### **Step 3: Configure Build Settings**

Fill in these settings:

| Setting | Value |
|---------|-------|
| **Branch to deploy** | `main` |
| **Base directory** | `client` |
| **Build command** | `npm run build` |
| **Publish directory** | `client/dist` |

---

### **Step 4: Add Environment Variable**

**IMPORTANT**: Before deploying, add the backend URL!

1. Click **"Show advanced"** or **"Add environment variables"**
2. Click **"New variable"**
3. Add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://chabuk-xi-backend.onrender.com/api`

---

### **Step 5: Deploy Site**

1. Click **"Deploy site"**
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://random-name-12345.netlify.app`

---

### **Step 6: Customize Domain (Optional)**

1. Go to **"Site settings"** → **"Domain management"**
2. Click **"Options"** → **"Edit site name"**
3. Change to: `chabuk-xi` (or any available name)
4. Your URL becomes: `https://chabuk-xi.netlify.app`

---

## 🔧 Configure Backend CORS

Your backend needs to allow requests from your Netlify domain.

### **Update Render Environment Variable:**

1. Go to your Render service: https://dashboard.render.com
2. Select `chabuk-xi-backend`
3. Go to **"Environment"** tab
4. Add new variable:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://chabuk-xi.netlify.app` (your actual Netlify URL)
5. Click **"Save Changes"**
6. Service will automatically redeploy

---

## ✅ Test Your Deployment

### **1. Open Your Frontend**
Visit: `https://chabuk-xi.netlify.app` (your actual URL)

### **2. Test Login**
- Username: `admin`
- Password: `admin123`

### **3. Verify Features**
- [ ] Login works
- [ ] Dashboard loads
- [ ] Can create events
- [ ] Can add transactions
- [ ] Commission tracking works
- [ ] Expense management works

---

## 🆘 Troubleshooting

### **Build Failed?**

**Check Build Logs:**
1. Go to **"Deploys"** tab on Netlify
2. Click on the failed deploy
3. Read the error message

**Common Issues:**

1. **"Command failed with exit code 1"**
   - Check Base directory is `client`
   - Check Build command is `npm run build`
   - Check Publish directory is `client/dist`

2. **"Module not found"**
   - Make sure all dependencies are in `client/package.json`
   - Try: Clear cache and redeploy

3. **"Environment variable not set"**
   - Verify `VITE_API_URL` is added
   - Must start with `VITE_` for Vite to recognize it

---

### **Frontend Loads But API Fails?**

**Check Browser Console (F12):**

1. **CORS Error?**
   - Add `FRONTEND_URL` to Render environment variables
   - Update backend CORS configuration

2. **404 on API calls?**
   - Verify `VITE_API_URL` is correct
   - Should end with `/api`
   - Example: `https://chabuk-xi-backend.onrender.com/api`

3. **Network Error?**
   - Check if backend is awake (free tier sleeps)
   - Visit backend URL to wake it up
   - Wait 30 seconds and try again

---

### **Backend Sleeping Issue (Free Tier)**

Render free tier sleeps after 15 minutes of inactivity:

**Solutions:**
1. **Upgrade to paid plan** ($7/month) - Recommended for production
2. **Use a ping service** - Keep backend awake (UptimeRobot, Cron-job.org)
3. **Accept the delay** - First request after sleep takes 30-60 seconds

---

## 📱 Mobile Testing

Test on mobile devices:
- Open your Netlify URL on phone
- Test all features
- Verify responsive design works

---

## 🔒 Security Checklist

After deployment:

- [ ] Change default admin password
- [ ] Change default booker password
- [ ] Update JWT_SECRET on Render
- [ ] Enable HTTPS (automatic on Netlify)
- [ ] Test all user roles
- [ ] Verify data persistence

---

## 🎉 Success Checklist

- [ ] Frontend deployed to Netlify
- [ ] Backend URL configured
- [ ] CORS configured on backend
- [ ] Login works
- [ ] All features functional
- [ ] Mobile responsive
- [ ] Passwords changed
- [ ] Application live and accessible

---

## 📊 Your Live Application

**Frontend**: `https://chabuk-xi.netlify.app` (your actual URL)  
**Backend**: `https://chabuk-xi-backend.onrender.com`

**Default Credentials** (Change immediately!):
- Admin: `admin` / `admin123`
- Booker: `booker` / `booker123`

---

## 🚀 Next Steps

1. **Test thoroughly** - Try all features
2. **Change passwords** - Security first!
3. **Share with users** - Send them the Netlify URL
4. **Monitor usage** - Check Render and Netlify dashboards
5. **Consider upgrade** - For production use, upgrade to paid plans

---

## 💰 Cost Summary

**Current Setup (Free):**
- Netlify: Free (100GB bandwidth)
- Render: Free (750 hours/month)
- **Total**: $0/month

**Production Setup (Recommended):**
- Netlify: Free or $19/month (Pro)
- Render: $7/month (persistent storage)
- **Total**: $7-26/month

---

## 📞 Need Help?

If something doesn't work:
1. Check browser console (F12)
2. Check Netlify deploy logs
3. Check Render service logs
4. Verify environment variables
5. Test backend URL directly

**Your application is ready to go live!** 🎉
