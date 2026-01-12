# Installation Guide

## Quick Start

### Step 1: Install Backend Dependencies
```bash
cd server
npm install
```

### Step 2: Install Frontend Dependencies
```bash
cd client
npm install
```

### Step 3: Start the Backend Server
Open a terminal and run:
```bash
cd server
npm start
```

The server will start on http://localhost:3000

### Step 4: Start the Frontend
Open a new terminal and run:
```bash
cd client
npm run dev
```

The frontend will start on http://localhost:5173

### Step 5: Access the Application
Open your browser and go to: http://localhost:5173

**Login with default credentials:**
- Admin: `admin` / `admin123`
- Booker: `booker` / `booker123`

## Troubleshooting

### Port Already in Use
If port 3000 or 5173 is already in use:

**Backend:** Edit `server/index.js` and change the PORT variable
**Frontend:** Edit `client/vite.config.js` and change the port in server config

### Database Issues
If you encounter database errors, delete `server/tickets.db` and restart the server. It will create a new database with default users.

### Module Not Found
Make sure you've run `npm install` in both the `server` and `client` directories.

## Production Deployment

See README.md for detailed deployment instructions for free hosting platforms like Render.com and Netlify.
