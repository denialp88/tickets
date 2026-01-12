# CHABUK XI - Complete Deployment Guide

## 📋 Overview

This guide covers deploying CHABUK XI to production servers. The SQLite database will work on any server, but for production use with multiple users, consider upgrading to PostgreSQL or MySQL.

---

## 🗄️ Database Information

### Current Setup (SQLite)
- **File-based database**: `tickets.db` stored on server
- **Works globally**: Yes, accessible from anywhere via your backend API
- **Limitations**: 
  - Single file, not ideal for high concurrent users
  - Stored on server filesystem
  - Backup = copy the .db file

### For Production (Recommended)
- **PostgreSQL** or **MySQL** for better performance
- **Cloud databases**: AWS RDS, Google Cloud SQL, or Heroku Postgres
- **Better for**: Multiple concurrent users, automatic backups, scalability

---

## 🚀 Deployment Options

### Option 1: Free Hosting (Recommended for Testing)

#### Backend Deployment - Render.com (Free)

1. **Create Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Prepare Backend**
   ```bash
   # Create .env file for production
   PORT=3001
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=production
   ```

3. **Deploy to Render**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: chabuk-xi-backend
     - **Environment**: Node
     - **Build Command**: `cd server && npm install`
     - **Start Command**: `cd server && npm start`
     - **Add Environment Variables**:
       - `JWT_SECRET`: (your secret key)
       - `NODE_ENV`: production

4. **Get Backend URL**
   - After deployment: `https://chabuk-xi-backend.onrender.com`
   - Note this URL for frontend configuration

#### Frontend Deployment - Netlify (Free)

1. **Update Frontend API URL**
   ```bash
   # In client/.env
   VITE_API_URL=https://chabuk-xi-backend.onrender.com/api
   ```

2. **Build Frontend**
   ```bash
   cd client
   npm run build
   ```

3. **Deploy to Netlify**
   - Go to https://netlify.com
   - Drag and drop the `client/dist` folder
   - Or connect GitHub for automatic deployments

4. **Configure Build Settings** (if using GitHub)
   - **Base directory**: client
   - **Build command**: `npm run build`
   - **Publish directory**: client/dist

---

### Option 2: VPS Deployment (Full Control)

#### Requirements
- Ubuntu 20.04+ or similar Linux server
- Node.js 18+
- Nginx (for reverse proxy)
- Domain name (optional but recommended)

#### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2
```

#### Step 2: Upload Application

```bash
# On your local machine, create deployment package
cd c:/Users/denia/Tickets
tar -czf chabuk-xi.tar.gz server client package.json

# Upload to server (replace with your server IP)
scp chabuk-xi.tar.gz user@your-server-ip:/home/user/

# On server, extract
cd /home/user
tar -xzf chabuk-xi.tar.gz
cd Tickets
```

#### Step 3: Install Dependencies

```bash
# Backend
cd server
npm install --production
cd ..

# Frontend
cd client
npm install
npm run build
cd ..
```

#### Step 4: Configure Environment

```bash
# Create backend .env
cd server
cat > .env << EOF
PORT=3001
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
EOF
cd ..
```

#### Step 5: Start Backend with PM2

```bash
cd server
pm2 start index.js --name chabuk-xi-backend
pm2 save
pm2 startup
```

#### Step 6: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/chabuk-xi
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or IP

    # Frontend
    location / {
        root /home/user/Tickets/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # File uploads
    location /uploads {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/chabuk-xi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 7: Setup SSL (Optional but Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

---

## 🔒 Security Checklist

### Before Deployment:

- [ ] Change default admin password
- [ ] Set strong JWT_SECRET
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Regular database backups
- [ ] Update Node.js packages

### Backend Security:

```javascript
// In server/index.js, update CORS for production
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
```

---

## 📦 Database Backup & Migration

### Backup SQLite Database

```bash
# Manual backup
cp server/tickets.db server/tickets.db.backup

# Automated daily backup (cron job)
0 2 * * * cp /home/user/Tickets/server/tickets.db /home/user/backups/tickets-$(date +\%Y\%m\%d).db
```

### Migrate to PostgreSQL (Production)

1. **Install PostgreSQL**
   ```bash
   sudo apt install postgresql postgresql-contrib
   ```

2. **Update Dependencies**
   ```bash
   cd server
   npm install pg
   ```

3. **Update database.js** to use PostgreSQL instead of SQLite

4. **Migrate Data** using export/import scripts

---

## 🔄 Update & Maintenance

### Update Application

```bash
# Pull latest changes
cd /home/user/Tickets
git pull origin main

# Update backend
cd server
npm install
pm2 restart chabuk-xi-backend

# Update frontend
cd ../client
npm install
npm run build
```

### Monitor Application

```bash
# View logs
pm2 logs chabuk-xi-backend

# Check status
pm2 status

# Monitor resources
pm2 monit
```

---

## 🌐 Access Your Application

### Local Development
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

### Production (VPS)
- **Application**: http://your-domain.com or http://your-server-ip
- **API**: http://your-domain.com/api

### Production (Free Hosting)
- **Frontend**: https://your-app.netlify.app
- **Backend**: https://chabuk-xi-backend.onrender.com

---

## 📱 Mobile Access

The application is mobile-first and works on:
- ✅ Mobile browsers (Chrome, Safari, Firefox)
- ✅ Tablets
- ✅ Desktop browsers
- ✅ Progressive Web App (PWA) capable

---

## 🆘 Troubleshooting

### Database Issues
```bash
# If database is corrupted
cd server
rm tickets.db
npm start  # Will recreate with default users
```

### Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001
# Kill process
kill -9 <PID>
```

### PM2 Issues
```bash
# Restart all
pm2 restart all

# Delete and restart
pm2 delete chabuk-xi-backend
pm2 start server/index.js --name chabuk-xi-backend
```

---

## 💰 Cost Estimate

### Free Tier (Perfect for Small Scale)
- **Render.com**: Free (750 hours/month)
- **Netlify**: Free (100GB bandwidth)
- **Total**: $0/month

### VPS (Better Performance)
- **DigitalOcean Droplet**: $6/month (1GB RAM)
- **Linode**: $5/month (1GB RAM)
- **AWS Lightsail**: $5/month (1GB RAM)

### Production (High Traffic)
- **VPS**: $20-50/month (4GB RAM)
- **Managed Database**: $15-25/month
- **CDN**: $5-10/month
- **Total**: $40-85/month

---

## ✅ Post-Deployment Checklist

- [ ] Application accessible via URL
- [ ] Can login with admin credentials
- [ ] Can create events
- [ ] Can add transactions
- [ ] File uploads working
- [ ] Commission tracking working
- [ ] Booker dashboard accessible
- [ ] Password reset working
- [ ] Database persisting data
- [ ] SSL certificate active (if applicable)
- [ ] Backups configured
- [ ] Monitoring setup

---

## 📞 Support

For issues or questions:
1. Check application logs: `pm2 logs`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify environment variables
4. Test API endpoints directly

---

## 🎉 Success!

Your CHABUK XI application is now deployed and accessible globally!

**Default Credentials:**
- Admin: `admin` / `admin123`
- Booker: `booker` / `booker123`

**⚠️ IMPORTANT: Change these passwords immediately after first login!**
