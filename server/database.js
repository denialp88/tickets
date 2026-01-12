import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'tickets.db');
const SQL = await initSqlJs();

let db;
if (existsSync(dbPath)) {
  const buffer = readFileSync(dbPath);
  db = new SQL.Database(buffer);
} else {
  db = new SQL.Database();
}

function saveDatabase() {
  const data = db.export();
  writeFileSync(dbPath, data);
}

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    full_name TEXT,
    mobile TEXT,
    first_login INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    location TEXT,
    description TEXT,
    commission_per_ticket REAL DEFAULT 0,
    is_admin_event INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    transaction_type TEXT NOT NULL,
    num_tickets INTEGER NOT NULL,
    price_per_ticket REAL NOT NULL,
    total_amount REAL NOT NULL,
    party_name TEXT NOT NULL,
    party_mobile TEXT,
    upi_id TEXT,
    payment_reference TEXT,
    qr_image_path TEXT,
    commission_amount REAL DEFAULT 0,
    net_amount REAL NOT NULL,
    commission_payment_status TEXT DEFAULT 'pending',
    commission_paid_date TEXT,
    transaction_date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER,
    expense_category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    expense_date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE SET NULL
  )
`);

const checkAdmin = db.exec('SELECT * FROM users WHERE username = "admin"');
const adminExists = checkAdmin.length > 0 && checkAdmin[0].values.length > 0;

if (!adminExists) {
  const hashedAdminPassword = bcrypt.hashSync('admin123', 10);
  const hashedBookerPassword = bcrypt.hashSync('booker123', 10);
  
  db.run('INSERT INTO users (username, password, role, full_name, mobile) VALUES (?, ?, ?, ?, ?)',
    ['admin', hashedAdminPassword, 'admin', 'Administrator', '']);
  db.run('INSERT INTO users (username, password, role, full_name, mobile) VALUES (?, ?, ?, ?, ?)',
    ['booker', hashedBookerPassword, 'booker', 'Booker User', '']);
  
  saveDatabase();
  console.log('Default users created: admin/admin123 and booker/booker123');
}

export const getUserByUsername = {
  get: (username) => {
    const result = db.exec('SELECT * FROM users WHERE username = ?', [username]);
    if (result.length > 0 && result[0].values.length > 0) {
      const cols = result[0].columns;
      const vals = result[0].values[0];
      return cols.reduce((obj, col, i) => ({ ...obj, [col]: vals[i] }), {});
    }
    return null;
  }
};

export const createUser = {
  run: (...params) => {
    db.run('INSERT INTO users (username, password, role, full_name, mobile, first_login) VALUES (?, ?, ?, ?, ?, ?)', params);
    saveDatabase();
    return { lastInsertRowid: db.exec('SELECT last_insert_rowid()')[0].values[0][0] };
  }
};

export const updateUserPassword = {
  run: (userId, newPassword) => {
    db.run('UPDATE users SET password = ?, first_login = 0 WHERE id = ?', [newPassword, userId]);
    saveDatabase();
  }
};

export const getAllUsers = {
  all: () => {
    const result = db.exec('SELECT id, username, role, full_name, mobile, first_login, created_at FROM users ORDER BY created_at DESC');
    if (result.length === 0) return [];
    const cols = result[0].columns;
    return result[0].values.map(vals => cols.reduce((obj, col, i) => ({ ...obj, [col]: vals[i] }), {}));
  }
};

export const deleteUser = {
  run: (id) => {
    db.run('DELETE FROM users WHERE id = ?', [id]);
    saveDatabase();
  }
};

export const getEvents = {
  all: () => {
    const result = db.exec('SELECT * FROM events ORDER BY date DESC');
    if (result.length === 0) return [];
    const cols = result[0].columns;
    return result[0].values.map(vals => cols.reduce((obj, col, i) => ({ ...obj, [col]: vals[i] }), {}));
  }
};

export const getEventById = {
  get: (id) => {
    const result = db.exec('SELECT * FROM events WHERE id = ?', [id]);
    if (result.length > 0 && result[0].values.length > 0) {
      const cols = result[0].columns;
      const vals = result[0].values[0];
      return cols.reduce((obj, col, i) => ({ ...obj, [col]: vals[i] }), {});
    }
    return null;
  }
};

export const createEvent = {
  run: (...params) => {
    db.run('INSERT INTO events (name, date, location, description, commission_per_ticket, is_admin_event) VALUES (?, ?, ?, ?, ?, ?)', params);
    saveDatabase();
    return { lastInsertRowid: db.exec('SELECT last_insert_rowid()')[0].values[0][0] };
  }
};

export const updateEvent = {
  run: (...params) => {
    db.run('UPDATE events SET name = ?, date = ?, location = ?, description = ?, commission_per_ticket = ?, is_admin_event = ? WHERE id = ?', params);
    saveDatabase();
  }
};

export const deleteEvent = {
  run: (id) => {
    db.run('DELETE FROM events WHERE id = ?', [id]);
    saveDatabase();
  }
};

export const getTransactionsByEvent = {
  all: (eventId) => {
    const result = db.exec('SELECT * FROM transactions WHERE event_id = ? ORDER BY transaction_date DESC', [eventId]);
    if (result.length === 0) return [];
    const cols = result[0].columns;
    return result[0].values.map(vals => cols.reduce((obj, col, i) => ({ ...obj, [col]: vals[i] }), {}));
  }
};

export const getAllTransactions = {
  all: () => {
    const result = db.exec('SELECT t.*, e.name as event_name FROM transactions t JOIN events e ON t.event_id = e.id ORDER BY t.transaction_date DESC');
    if (result.length === 0) return [];
    const cols = result[0].columns;
    return result[0].values.map(vals => cols.reduce((obj, col, i) => ({ ...obj, [col]: vals[i] }), {}));
  }
};

export const createTransaction = {
  run: (...params) => {
    db.run('INSERT INTO transactions (event_id, transaction_type, num_tickets, price_per_ticket, total_amount, party_name, party_mobile, upi_id, payment_reference, qr_image_path, commission_amount, net_amount, transaction_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', params);
    saveDatabase();
    return { lastInsertRowid: db.exec('SELECT last_insert_rowid()')[0].values[0][0] };
  }
};

export const deleteTransaction = {
  run: (id) => {
    db.run('DELETE FROM transactions WHERE id = ?', [id]);
    saveDatabase();
  }
};

export const updateCommissionStatus = {
  run: (transactionId, status) => {
    const paidDate = status === 'paid' ? new Date().toISOString() : null;
    db.run('UPDATE transactions SET commission_payment_status = ?, commission_paid_date = ? WHERE id = ?', 
      [status, paidDate, transactionId]);
    saveDatabase();
  }
};

export const markEventCommissionsPaid = {
  run: (eventId) => {
    const paidDate = new Date().toISOString();
    db.run('UPDATE transactions SET commission_payment_status = ?, commission_paid_date = ? WHERE event_id = ? AND commission_amount > 0', 
      ['paid', paidDate, eventId]);
    saveDatabase();
  }
};

export const getAllExpenses = {
  all: () => {
    const result = db.exec('SELECT e.*, ev.name as event_name FROM expenses e LEFT JOIN events ev ON e.event_id = ev.id ORDER BY e.expense_date DESC');
    if (result.length === 0) return [];
    const cols = result[0].columns;
    return result[0].values.map(vals => cols.reduce((obj, col, i) => ({ ...obj, [col]: vals[i] }), {}));
  }
};

export const getExpensesByEvent = {
  all: (eventId) => {
    const result = db.exec('SELECT * FROM expenses WHERE event_id = ? ORDER BY expense_date DESC', [eventId]);
    if (result.length === 0) return [];
    const cols = result[0].columns;
    return result[0].values.map(vals => cols.reduce((obj, col, i) => ({ ...obj, [col]: vals[i] }), {}));
  }
};

export const createExpense = {
  run: (...params) => {
    db.run('INSERT INTO expenses (event_id, expense_category, description, amount, expense_date, notes) VALUES (?, ?, ?, ?, ?, ?)', params);
    saveDatabase();
    return { lastInsertRowid: db.exec('SELECT last_insert_rowid()')[0].values[0][0] };
  }
};

export const deleteExpense = {
  run: (id) => {
    db.run('DELETE FROM expenses WHERE id = ?', [id]);
    saveDatabase();
  }
};

export { saveDatabase };
export default db;
