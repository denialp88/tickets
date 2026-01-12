import { useState, useEffect } from 'react';
import { X, Plus, Trash2, DollarSign, Calendar, Receipt } from 'lucide-react';
import { expensesAPI, eventsAPI } from '../utils/api';

function ExpenseManagement({ onClose }) {
  const [expenses, setExpenses] = useState([]);
  const [events, setEvents] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    event_id: '',
    expense_category: '',
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const expenseCategories = [
    'Transportation',
    'Food & Beverages',
    'Marketing',
    'Venue',
    'Staff',
    'Equipment',
    'Printing',
    'Miscellaneous',
    'Other'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [expensesRes, eventsRes] = await Promise.all([
        expensesAPI.getAll(),
        eventsAPI.getAll()
      ]);
      setExpenses(expensesRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    try {
      await expensesAPI.create(formData);
      setFormData({
        event_id: '',
        expense_category: '',
        description: '',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      setShowAddForm(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create expense');
    }
  };

  const handleDelete = async (expenseId) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        await expensesAPI.delete(expenseId);
        loadData();
      } catch (error) {
        alert('Failed to delete expense');
      }
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-xl text-dark-text">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="bg-dark-card shadow-xl border-b border-dark-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-dark-text">Expense Management</h1>
              <p className="text-sm text-dark-muted">Track additional expenses</p>
            </div>
            <button onClick={onClose} className="btn-secondary">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Summary Card */}
        <div className="mb-6">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="bg-red-900/30 p-3 rounded-lg border border-red-800">
                <DollarSign className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-dark-muted">Total Expenses</p>
                <p className="text-3xl font-bold text-red-400">₹{totalExpenses.toFixed(2)}</p>
                <p className="text-xs text-dark-muted">{expenses.length} expenses recorded</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Expense Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-dark-text flex items-center gap-2">
            <Receipt className="w-6 h-6 text-primary-500" />
            All Expenses
          </h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>

        {/* Add Expense Form */}
        {showAddForm && (
          <div className="card mb-6">
            <h3 className="text-lg font-bold text-dark-text mb-4">Add New Expense</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expense_category" className="block text-sm font-medium text-dark-text mb-2">
                    Category *
                  </label>
                  <select
                    id="expense_category"
                    name="expense_category"
                    value={formData.expense_category}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select category</option>
                    {expenseCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-dark-text mb-2">
                    Amount (₹) *
                  </label>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-dark-text mb-2">
                    Description *
                  </label>
                  <input
                    id="description"
                    name="description"
                    type="text"
                    value={formData.description}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Brief description"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="expense_date" className="block text-sm font-medium text-dark-text mb-2">
                    Date *
                  </label>
                  <input
                    id="expense_date"
                    name="expense_date"
                    type="date"
                    value={formData.expense_date}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="event_id" className="block text-sm font-medium text-dark-text mb-2">
                    Related Event (Optional)
                  </label>
                  <select
                    id="event_id"
                    name="event_id"
                    value={formData.event_id}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">General Expense</option>
                    {events.map(event => (
                      <option key={event.id} value={event.id}>
                        {event.name} - {new Date(event.date).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-dark-text mb-2">
                    Notes
                  </label>
                  <input
                    id="notes"
                    name="notes"
                    type="text"
                    value={formData.notes}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Additional notes"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn-primary">
                  Add Expense
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setError('');
                    setFormData({
                      event_id: '',
                      expense_category: '',
                      description: '',
                      amount: '',
                      expense_date: new Date().toISOString().split('T')[0],
                      notes: ''
                    });
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Expenses List */}
        <div className="space-y-3">
          {expenses.length === 0 ? (
            <div className="card text-center py-12">
              <Receipt className="w-16 h-16 text-dark-muted mx-auto mb-4" />
              <p className="text-dark-muted">No expenses recorded yet</p>
            </div>
          ) : (
            expenses.map((expense) => (
              <div key={expense.id} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-red-900/30 text-red-400 text-xs px-2 py-1 rounded-full border border-red-800">
                        {expense.expense_category}
                      </span>
                      {expense.event_name && (
                        <span className="bg-blue-900/30 text-blue-400 text-xs px-2 py-1 rounded-full border border-blue-800">
                          {expense.event_name}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-dark-text">{expense.description}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-dark-muted">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(expense.expense_date).toLocaleDateString()}</span>
                      </div>
                      {expense.notes && (
                        <span className="text-xs">Note: {expense.notes}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-400">₹{expense.amount.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="btn-danger flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ExpenseManagement;
