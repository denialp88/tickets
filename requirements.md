# Ticket Management System - Requirements Document

## Project Overview
A mobile-responsive web application for managing event ticket purchases and sales, tracking profit margins, and maintaining records of buyers and sellers. Features role-based access control with Admin and Booker accounts.

## User Roles & Authentication

### Admin Account
- Full system access
- Create, edit, and delete events
- Add transactions (purchases and sales)
- View all reports and analytics
- See profit/loss calculations
- View commission breakdowns
- Access to all payment details and QR screenshots
- Manage booker accounts

### Booker Account
- Limited access
- **Can only**: Add booking details (transactions) for existing events
- **Cannot**: 
  - Create or edit events
  - View reports or analytics
  - See profit/loss information
  - View commission details
  - Access financial summaries
- Can only see the transaction form for adding bookings

### Authentication
- Login system with username/password
- Role-based access control
- Session management
- Secure password storage

## Core Features

### 1. Event Management
- Add new events with commission settings
- Set booker commission amount per ticket for each event
- Admin events (zero commission/amount)
- View list of all events
- Edit event details
- Delete events

### 2. Ticket Transaction Management
- **Purchase Tracking**
  - Record number of tickets purchased
  - Track purchase price per ticket
  - Record who purchased from (seller/source)
  - Store purchase date
  - **Payment Details**:
    - UPI ID used for payment
    - Mobile number
    - Upload QR code screenshot
    - Payment reference number
  
- **Sales Tracking**
  - Record number of tickets sold
  - Track selling price per ticket
  - Record buyer name
  - Record buyer mobile number
  - Store sale date
  - **Payment Details**:
    - UPI ID received
    - Mobile number
    - Upload payment proof/QR screenshot
    - Payment reference number

### 3. Financial Analytics
- **Profit Calculation**
  - Automatic calculation: (Sold Price - Purchase Price) × Number of Tickets
  - Commission calculation for bookers (amount per ticket × number of tickets)
  - Net profit after commission
  - Display profit/loss per transaction
  - Total profit per event
  - Overall profit summary
  - Admin transactions (zero amount handling)

### 4. Data Display
- Dashboard showing all events with key metrics
- Transaction history per event
- Buyer and seller information with contact details
- Payment proof images (QR screenshots)
- UPI and mobile number records
- Commission breakdown
- Profit/loss indicators with color coding
- Admin vs regular transaction indicators

## Technical Requirements

### Frontend
- **Framework**: React with Vite
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **State Management**: React hooks
- **Design**: Mobile-first, mobile-only responsive design
- **Authentication**: JWT token-based auth

### Backend
- **Runtime**: Node.js with Express
- **Database**: SQLite (for easy deployment)
- **API**: RESTful API with authentication middleware
- **Authentication**: JWT tokens with bcrypt password hashing
- **File Upload**: Multer for QR code/payment proof images
- **File Storage**: Local storage with image serving
- **Authorization**: Role-based access control (RBAC)

### Deployment
- **Platform**: Free hosting options
  - Frontend: Netlify or Vercel
  - Backend: Render.com or Railway.app
  - Database: SQLite file-based (included in deployment)

## Data Models

### User
- ID (auto-generated)
- Username (unique)
- Password (hashed)
- Role (Admin/Booker)
- Full Name
- Mobile Number
- Created Date

### Event
- ID (auto-generated)
- Event Name
- Event Date
- Venue/Location
- Description
- Booker Commission Per Ticket (amount in ₹)
- Is Admin Event (boolean - zero amount)
- Created Date

### Transaction
- ID (auto-generated)
- Event ID (foreign key)
- Transaction Type (Purchase/Sale)
- Number of Tickets
- Price per Ticket
- Total Amount
- Party Name (Buyer/Seller)
- Party Mobile Number
- UPI ID
- Payment Reference Number
- QR Code/Payment Proof Image Path
- Commission Amount (calculated)
- Net Amount (after commission)
- Transaction Date
- Notes

## User Interface Requirements

### Pages/Views

#### For All Users
0. **Login Page**
   - Username input
   - Password input
   - Login button
   - Mobile-optimized layout

#### For Admin Only
1. **Dashboard**
   - List of all events with summary cards
   - Quick stats (total events, total profit, pending tickets)
   - Commission summary
   - Financial analytics

2. **Event Details** (Admin Only)
   - Event information
   - Purchase records table
   - Sales records table
   - Profit calculation summary
   - Commission breakdown
   - Add new transaction button

3. **Add/Edit Event Form** (Admin Only)
   - Event name input
   - Date picker
   - Location input
   - Description textarea
   - Commission amount per ticket input (₹ per ticket for bookers)
   - Admin event checkbox (sets amount to zero)

#### For Booker
4. **Event Selection** (Booker)
   - Simple dropdown to select event
   - Only shows event name and date
   - No financial information visible

5. **Add Transaction Form** (Both Admin & Booker)
   - Transaction type selector (Purchase/Sale)
   - Number of tickets input
   - Price per ticket input
   - Party name input (buyer/seller)
   - Mobile number input
   - UPI ID input
   - Payment reference number input
   - QR code/payment proof image upload
   - Date picker
   - Notes textarea
   - Auto-calculated commission display
   - Net amount display

## Features Priority

### MVP (Minimum Viable Product)
- ✅ User authentication (Login system)
- ✅ Admin and Booker role management
- ✅ Role-based access control
- ✅ Add events with commission settings (Admin only)
- ✅ Admin event support (zero amount)
- ✅ Record purchases with payment details (UPI, mobile, QR screenshot)
- ✅ Record sales with buyer payment info
- ✅ Upload and display QR code screenshots
- ✅ Calculate profit and commission automatically (Admin view only)
- ✅ View all events and transactions with payment details (Admin only)
- ✅ Display payment proof images
- ✅ Booker can only add transactions, no reports
- ✅ Mobile-first, mobile-only responsive design

### Future Enhancements
- Multiple admin accounts
- User management interface
- Password reset functionality
- Export data to CSV/Excel with payment details
- Advanced filtering and search by UPI/mobile
- Email/SMS notifications
- Analytics charts and graphs
- Ticket inventory management
- Payment status tracking
- Bulk image upload
- Image compression and optimization
- Commission reports for individual bookers
- Activity logs and audit trail

## Success Criteria
- Secure login system with role-based access
- Admin has full access, Booker has limited access
- Booker cannot see any financial reports or profit data
- User can add events in under 30 seconds (Admin)
- Booker can add transactions in under 30 seconds
- All transactions are automatically calculated for profit (Admin view)
- Application loads in under 3 seconds
- Mobile-first design (optimized for mobile devices only)
- Data persists across sessions
- Zero-cost hosting solution

## Security Considerations
- Secure authentication with JWT tokens
- Password hashing with bcrypt
- Role-based authorization middleware
- Protected API routes based on user role
- Session timeout and token expiration
- Input validation on all forms
- SQL injection prevention
- XSS protection
- CORS configuration for API
- Environment variables for sensitive data
- File upload validation (image types only)
- File size limits for uploads
- Secure file storage and serving
- Sanitize payment information display
- Prevent privilege escalation

## Browser Support
- **Primary**: Mobile browsers (iOS Safari, Chrome Mobile)
- **Secondary**: Desktop browsers for admin use
  - Chrome (latest)
  - Firefox (latest)
  - Safari (latest)
  - Edge (latest)

## Default Accounts
- **Admin**: Username: `admin`, Password: `admin123` (change after first login)
- **Booker**: Username: `booker`, Password: `booker123` (change after first login)
