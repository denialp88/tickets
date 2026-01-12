# Deployment Guide - Free Hosting

This guide will help you deploy your Ticket Management System on free hosting platforms.

## Option 1: Render.com (Backend) + Netlify (Frontend)

### Backend Deployment on Render.com

1. **Prepare Your Code**
   - Push your code to GitHub
   - Make sure `.gitignore` excludes `node_modules`, `.env`, and `*.db`

2. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

3. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

4. **Configure Service**
   - **Name**: ticket-management-backend
   - **Environment**: Node
   - **Region**: Choose closest to your users
   - **Branch**: main
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

5. **Add Environment Variables**
   - Click "Environment" tab
   - Add: `JWT_SECRET` = `your-secure-random-string-here`
   - Add: `PORT` = `3000` (optional, Render sets this automatically)

6. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Copy your backend URL (e.g., https://ticket-management-backend.onrender.com)

### Frontend Deployment on Netlify

1. **Update API URL**
   - Edit `client/src/utils/api.js`
   - Change `API_URL` to your Render backend URL:
   ```javascript
   const API_URL = 'https://your-backend-url.onrender.com/api';
   ```

2. **Build Frontend**
   ```bash
   cd client
   npm run build
   ```
   This creates a `dist` folder

3. **Deploy to Netlify**
   - Go to https://netlify.com
   - Sign up/Login
   - Click "Add new site" → "Deploy manually"
   - Drag and drop the `client/dist` folder
   - Wait for deployment

4. **Get Your URL**
   - Netlify will give you a URL like: https://random-name.netlify.app
   - You can customize this in Site settings

## Option 2: Railway.app (Full Stack)

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Deploy Backend**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect Node.js

3. **Configure Backend**
   - Add environment variables:
     - `JWT_SECRET`: your-secure-key
   - Set root directory to `server`
   - Deploy

4. **Deploy Frontend**
   - Create another service for frontend
   - Set root directory to `client`
   - Add build command: `npm run build`
   - Deploy

## Option 3: Vercel (Frontend) + Render (Backend)

Similar to Netlify option, but use Vercel for frontend:

1. **Deploy Backend on Render** (same as Option 1)

2. **Deploy Frontend on Vercel**
   - Go to https://vercel.com
   - Import your GitHub repository
   - Set root directory to `client`
   - Add environment variable: `VITE_API_URL` = your backend URL
   - Deploy

## Important Notes

### Database Persistence
- Render free tier may reset the database on sleep
- For production, consider upgrading or using a separate database service
- Backup your database regularly

### CORS Configuration
The backend is already configured to accept requests from any origin. For production, you should restrict this in `server/index.js`:

```javascript
app.use(cors({
  origin: 'https://your-frontend-url.netlify.app'
}));
```

### File Uploads
- Uploaded images are stored locally on the server
- On free tiers, these may be lost when the server restarts
- Consider using cloud storage (Cloudinary, AWS S3) for production

### Cold Starts
- Free tier services may "sleep" after inactivity
- First request after sleep may take 30-60 seconds
- Keep-alive services can help (but use resources)

## Testing Your Deployment

1. Open your frontend URL
2. Login with default credentials:
   - Admin: `admin` / `admin123`
   - Booker: `booker` / `booker123`
3. Test creating an event (Admin)
4. Test adding a transaction (Both)
5. Test image upload
6. Verify all features work

## Troubleshooting

### Backend Not Responding
- Check Render logs for errors
- Verify environment variables are set
- Check if service is running

### Frontend Can't Connect to Backend
- Verify API_URL is correct
- Check CORS settings
- Verify backend is running

### Database Errors
- Check if SQLite is supported on your hosting platform
- Verify file permissions
- Check logs for specific errors

## Security Checklist

- [ ] Change default passwords immediately
- [ ] Set strong JWT_SECRET
- [ ] Configure CORS for production
- [ ] Use HTTPS (automatic on Render/Netlify)
- [ ] Regular backups of database
- [ ] Monitor for suspicious activity

## Cost Considerations

All recommended platforms offer free tiers:
- **Render**: 750 hours/month free
- **Netlify**: 100GB bandwidth/month free
- **Vercel**: Unlimited bandwidth for personal projects
- **Railway**: $5 free credit/month

For production with heavy usage, consider upgrading to paid tiers.
