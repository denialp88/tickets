import express from 'express';
import cors from 'cors';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

import {
  getUserByUsername,
  createUser,
  updateUserPassword,
  getAllUsers,
  deleteUser,
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getTransactionsByEvent,
  getAllTransactions,
  createTransaction,
  deleteTransaction,
  updateCommissionStatus,
  markEventCommissionsPaid,
  getAllExpenses,
  getExpensesByEvent,
  createExpense,
  deleteExpense
} from './database.js';

import { authenticateToken, requireAdmin, requireBookerOrAdmin, JWT_SECRET } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = getUserByUsername.get(username);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.full_name,
        first_login: user.first_login === 1
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/reset-password', authenticateToken, (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    updateUserPassword.run(req.user.id, hashedPassword);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

app.get('/api/users', authenticateToken, requireAdmin, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const users = getAllUsers.all();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', authenticateToken, requireAdmin, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { username, password, full_name, mobile, role } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    if (!role || !['admin', 'booker'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin or booker' });
    }

    const existingUser = getUserByUsername.get(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = createUser.run(username, hashedPassword, role, full_name || '', mobile || '', 1);

    res.status(201).json({ 
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully`,
      userId: result.lastInsertRowid 
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.delete('/api/users/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const userId = parseInt(req.params.id);
    
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const userToDelete = getAllUsers.all().find(u => u.id === userId);
    if (!userToDelete) {
      return res.status(404).json({ error: 'User not found' });
    }

    deleteUser.run(userId);
    res.json({ 
      message: `${userToDelete.role.charAt(0).toUpperCase() + userToDelete.role.slice(1)} deleted successfully` 
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.get('/api/events', authenticateToken, (req, res) => {
  try {
    const events = getEvents.all();
    
    if (req.user.role === 'booker') {
      const eventsForBooker = events.map(event => ({
        id: event.id,
        name: event.name,
        date: event.date,
        location: event.location
      }));
      return res.json(eventsForBooker);
    }
    
    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.get('/api/events/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const event = getEventById.get(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const transactions = getTransactionsByEvent.all(req.params.id);
    
    res.json({ event, transactions });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

app.post('/api/events', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, date, location, description, commission_per_ticket, is_admin_event } = req.body;
    
    if (!name || !date) {
      return res.status(400).json({ error: 'Name and date are required' });
    }

    const result = createEvent.run(
      name,
      date,
      location || '',
      description || '',
      commission_per_ticket || 0,
      is_admin_event ? 1 : 0
    );

    const newEvent = getEventById.get(result.lastInsertRowid);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

app.put('/api/events/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, date, location, description, commission_per_ticket, is_admin_event } = req.body;
    
    if (!name || !date) {
      return res.status(400).json({ error: 'Name and date are required' });
    }

    updateEvent.run(
      name,
      date,
      location || '',
      description || '',
      commission_per_ticket || 0,
      is_admin_event ? 1 : 0,
      req.params.id
    );

    const updatedEvent = getEventById.get(req.params.id);
    res.json(updatedEvent);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

app.delete('/api/events/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    deleteEvent.run(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

app.get('/api/transactions', authenticateToken, requireAdmin, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required - Bookers cannot view all transactions' });
    }
    const transactions = getAllTransactions.all();
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

app.post('/api/transactions', authenticateToken, requireBookerOrAdmin, upload.single('qr_image'), (req, res) => {
  try {
    const {
      event_id,
      transaction_type,
      num_tickets,
      price_per_ticket,
      party_name,
      party_mobile,
      upi_id,
      payment_reference,
      transaction_date,
      notes,
      no_commission
    } = req.body;

    if (!event_id || !transaction_type || !num_tickets || !price_per_ticket || !party_name || !transaction_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const event = getEventById.get(event_id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const numTickets = parseInt(num_tickets);
    const pricePerTicket = parseFloat(price_per_ticket);
    const totalAmount = numTickets * pricePerTicket;
    
    let commissionAmount = 0;
    const noCommissionFlag = no_commission === 'true' || no_commission === true;
    if (!noCommissionFlag && !event.is_admin_event && event.commission_per_ticket > 0) {
      commissionAmount = numTickets * event.commission_per_ticket;
    }
    
    const netAmount = totalAmount - commissionAmount;

    const qrImagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const result = createTransaction.run(
      event_id,
      transaction_type,
      numTickets,
      pricePerTicket,
      totalAmount,
      party_name,
      party_mobile || '',
      upi_id || '',
      payment_reference || '',
      qrImagePath,
      commissionAmount,
      netAmount,
      transaction_date,
      notes || ''
    );

    res.status(201).json({
      id: result.lastInsertRowid,
      message: 'Transaction created successfully'
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

app.delete('/api/transactions/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    deleteTransaction.run(req.params.id);
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

app.get('/api/dashboard/stats', authenticateToken, requireAdmin, (req, res) => {
  try {
    const events = getEvents.all();
    const transactions = getAllTransactions.all();
    const expenses = getAllExpenses.all();
    
    const totalEvents = events.length;
    const totalTransactions = transactions.length;
    
    const purchases = transactions.filter(t => t.transaction_type === 'purchase');
    const sales = transactions.filter(t => t.transaction_type === 'sale');
    
    const totalPurchaseAmount = purchases.reduce((sum, t) => sum + t.total_amount, 0);
    const totalSaleAmount = sales.reduce((sum, t) => sum + t.total_amount, 0);
    const totalCommission = transactions.reduce((sum, t) => sum + t.commission_amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    const grossProfit = totalSaleAmount - totalPurchaseAmount;
    const netProfit = grossProfit - totalCommission - totalExpenses;
    
    res.json({
      totalEvents,
      totalTransactions,
      totalPurchaseAmount,
      totalSaleAmount,
      totalCommission,
      totalExpenses,
      grossProfit,
      netProfit,
      purchaseCount: purchases.length,
      saleCount: sales.length,
      expenseCount: expenses.length
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

app.get('/api/booker/earnings', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'booker') {
      return res.status(403).json({ error: 'Booker access only' });
    }

    const transactions = getAllTransactions.all();
    
    const totalCommission = transactions.reduce((sum, t) => sum + t.commission_amount, 0);
    const pendingCommission = transactions.filter(t => t.commission_payment_status === 'pending').reduce((sum, t) => sum + t.commission_amount, 0);
    const paidCommission = transactions.filter(t => t.commission_payment_status === 'paid').reduce((sum, t) => sum + t.commission_amount, 0);
    const totalTransactions = transactions.length;
    
    const eventEarnings = {};
    transactions.forEach(t => {
      if (!eventEarnings[t.event_name]) {
        eventEarnings[t.event_name] = {
          eventName: t.event_name,
          commission: 0,
          pendingCommission: 0,
          paidCommission: 0,
          transactions: 0,
          tickets: 0
        };
      }
      eventEarnings[t.event_name].commission += t.commission_amount;
      if (t.commission_payment_status === 'pending') {
        eventEarnings[t.event_name].pendingCommission += t.commission_amount;
      } else {
        eventEarnings[t.event_name].paidCommission += t.commission_amount;
      }
      eventEarnings[t.event_name].transactions += 1;
      eventEarnings[t.event_name].tickets += t.num_tickets;
    });

    res.json({
      totalCommission,
      pendingCommission,
      paidCommission,
      totalTransactions,
      eventEarnings: Object.values(eventEarnings)
    });
  } catch (error) {
    console.error('Booker earnings error:', error);
    res.status(500).json({ error: 'Failed to fetch earnings' });
  }
});

app.get('/api/admin/commission-report', authenticateToken, requireAdmin, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const transactions = getAllTransactions.all();
    const events = getEvents.all();
    
    const totalCommission = transactions.reduce((sum, t) => sum + t.commission_amount, 0);
    const pendingCommission = transactions.filter(t => t.commission_payment_status === 'pending').reduce((sum, t) => sum + t.commission_amount, 0);
    const paidCommission = transactions.filter(t => t.commission_payment_status === 'paid').reduce((sum, t) => sum + t.commission_amount, 0);

    const eventReport = events.map(event => {
      const eventTransactions = transactions.filter(t => t.event_id === event.id);
      const eventCommission = eventTransactions.reduce((sum, t) => sum + t.commission_amount, 0);
      const eventPending = eventTransactions.filter(t => t.commission_payment_status === 'pending').reduce((sum, t) => sum + t.commission_amount, 0);
      const eventPaid = eventTransactions.filter(t => t.commission_payment_status === 'paid').reduce((sum, t) => sum + t.commission_amount, 0);
      
      return {
        eventId: event.id,
        eventName: event.name,
        eventDate: event.date,
        totalCommission: eventCommission,
        pendingCommission: eventPending,
        paidCommission: eventPaid,
        transactionCount: eventTransactions.length
      };
    }).filter(e => e.totalCommission > 0);

    res.json({
      summary: {
        totalCommission,
        pendingCommission,
        paidCommission
      },
      eventReport
    });
  } catch (error) {
    console.error('Commission report error:', error);
    res.status(500).json({ error: 'Failed to fetch commission report' });
  }
});

app.post('/api/admin/mark-commission-paid/:eventId', authenticateToken, requireAdmin, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const eventId = parseInt(req.params.eventId);
    markEventCommissionsPaid.run(eventId);

    res.json({ message: 'Commission marked as paid for all transactions in this event' });
  } catch (error) {
    console.error('Mark commission paid error:', error);
    res.status(500).json({ error: 'Failed to mark commission as paid' });
  }
});

app.post('/api/admin/update-commission-status/:transactionId', authenticateToken, requireAdmin, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status } = req.body;
    const transactionId = parseInt(req.params.transactionId);

    if (!['pending', 'paid'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be pending or paid' });
    }

    updateCommissionStatus.run(transactionId, status);

    res.json({ message: `Commission status updated to ${status}` });
  } catch (error) {
    console.error('Update commission status error:', error);
    res.status(500).json({ error: 'Failed to update commission status' });
  }
});

app.get('/api/expenses', authenticateToken, requireAdmin, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const expenses = getAllExpenses.all();
    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

app.post('/api/expenses', authenticateToken, requireAdmin, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { event_id, expense_category, description, amount, expense_date, notes } = req.body;

    if (!expense_category || !description || !amount || !expense_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = createExpense.run(
      event_id || null,
      expense_category,
      description,
      parseFloat(amount),
      expense_date,
      notes || ''
    );

    res.status(201).json({ 
      message: 'Expense created successfully',
      expenseId: result.lastInsertRowid 
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

app.delete('/api/expenses/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    deleteExpense.run(req.params.id);
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Default credentials:');
  console.log('  Admin - username: admin, password: admin123');
  console.log('  Booker - username: booker, password: booker123');
});
