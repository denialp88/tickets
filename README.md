# Ticket Management System

A complete web application for managing event ticket purchases and sales with role-based access control, payment tracking, and profit calculation.

## Features

### User Roles
- **Admin**: Full access to create events, manage transactions, view reports and analytics
- **Booker**: Limited access to only add booking details for existing events

### Core Functionality
- Event management with commission settings
- Transaction tracking (purchases and sales)
- Payment details (UPI ID, mobile number, QR screenshots)
- Automatic profit and commission calculation
- Image upload for payment proofs
- Mobile-first responsive design

## Tech Stack

### Backend
- Node.js with Express
- SQLite database
- JWT authentication with bcrypt
- Multer for file uploads

### Frontend
- React with Vite
- TailwindCSS for styling
- Lucide React for icons
- Axios for API calls

## Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Setup

1. **Install Backend Dependencies**
```bash
cd server
npm install
```

2. **Install Frontend Dependencies**
```bash
cd client
npm install
```

## Running the Application

### Development Mode

1. **Start Backend Server** (Terminal 1)
```bash
cd server
npm start
```
Server runs on http://localhost:3000

2. **Start Frontend** (Terminal 2)
```bash
cd client
npm run dev
```
Frontend runs on http://localhost:5173

### Production Build

1. **Build Frontend**
```bash
cd client
npm run build
```

2. **Start Backend**
```bash
cd server
npm start
```

## Default Credentials

- **Admin**
  - Username: `admin`
  - Password: `admin123`

- **Booker**
  - Username: `booker`
  - Password: `booker123`

**⚠️ Important: Change these passwords after first login in production!**

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Events (Admin only for create/update/delete)
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event details with transactions
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Transactions (Admin and Booker)
- `GET /api/transactions` - Get all transactions (Admin only)
- `POST /api/transactions` - Create transaction (with file upload)
- `DELETE /api/transactions/:id` - Delete transaction (Admin only)

### Dashboard (Admin only)
- `GET /api/dashboard/stats` - Get dashboard statistics

## Free Hosting Options

### Backend Deployment
1. **Render.com** (Recommended)
   - Free tier available
   - Supports Node.js and SQLite
   - Auto-deploy from GitHub

2. **Railway.app**
   - Free tier with usage limits
   - Easy deployment

### Frontend Deployment
1. **Netlify** (Recommended)
   - Free tier
   - Auto-deploy from GitHub
   - Custom domains

2. **Vercel**
   - Free tier
   - Optimized for React

### Deployment Steps

#### Backend on Render.com
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Set build command: `cd server && npm install`
5. Set start command: `cd server && npm start`
6. Add environment variable: `JWT_SECRET=your-secret-key`
7. Deploy

#### Frontend on Netlify
1. Build the frontend: `cd client && npm run build`
2. Create new site on Netlify
3. Drag and drop the `client/dist` folder
4. Set environment variable: `VITE_API_URL=your-backend-url`
5. Deploy

## Environment Variables

### Backend (.env)
```
PORT=3000
JWT_SECRET=your-secret-key-change-this
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
```

## Project Structure

```
Tickets/
├── server/
│   ├── middleware/
│   │   └── auth.js
│   ├── uploads/
│   ├── database.js
│   ├── index.js
│   ├── package.json
│   └── tickets.db
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── EventDetails.jsx
│   │   │   ├── EventForm.jsx
│   │   │   └── TransactionForm.jsx
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── BookerDashboard.jsx
│   │   │   └── Login.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── requirements.md
└── README.md
```

## Features in Detail

### Admin Dashboard
- View all events with summary cards
- Dashboard statistics (profit, commission, transactions)
- Create, edit, and delete events
- Add transactions with full details
- View detailed event reports
- Delete transactions

### Booker Dashboard
- Simple interface with event list
- Add booking details only
- No access to financial information
- No access to reports or analytics

### Transaction Management
- Record purchases and sales
- Upload QR code/payment screenshots
- Track UPI ID, mobile numbers
- Payment reference numbers
- Automatic commission calculation
- Notes for additional information

### Event Management
- Set commission percentage per event
- Admin events (zero commission)
- Event details with location and date
- View all transactions per event
- Profit/loss calculation per event

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control
- Protected API routes
- File upload validation
- XSS protection
- SQL injection prevention

## Browser Support

- Mobile browsers (iOS Safari, Chrome Mobile) - Primary
- Desktop browsers (Chrome, Firefox, Safari, Edge) - Secondary

## License

ISC

## Support

For issues and questions, please refer to the requirements.md file for detailed specifications.
