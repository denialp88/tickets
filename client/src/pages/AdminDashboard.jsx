import { useState, useEffect } from 'react';
import { LogOut, Plus, Calendar, TrendingUp, DollarSign, Ticket, Eye, Trash2, Edit, FileText, Users, CreditCard, Receipt } from 'lucide-react';
import { eventsAPI, dashboardAPI } from '../utils/api';
import EventForm from '../components/EventForm';
import TransactionForm from '../components/TransactionForm';
import EventDetails from '../components/EventDetails';
import ProfitReport from '../components/ProfitReport';
import UserManagement from '../components/UserManagement';
import CommissionReport from '../components/CommissionReport';
import ExpenseManagement from '../components/ExpenseManagement';

function AdminDashboard({ user, onLogout }) {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewingEvent, setViewingEvent] = useState(null);
  const [showProfitReport, setShowProfitReport] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showCommissionReport, setShowCommissionReport] = useState(false);
  const [showExpenseManagement, setShowExpenseManagement] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [eventsRes, statsRes] = await Promise.all([
        eventsAPI.getAll(),
        dashboardAPI.getStats()
      ]);
      setEvents(eventsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventCreated = () => {
    setShowEventForm(false);
    setEditingEvent(null);
    loadData();
  };

  const handleTransactionCreated = () => {
    setShowTransactionForm(false);
    setSelectedEvent(null);
    loadData();
  };

  const handleDeleteEvent = async (eventId) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await eventsAPI.delete(eventId);
        loadData();
      } catch (error) {
        alert('Failed to delete event');
      }
    }
  };

  const handleViewEvent = async (eventId) => {
    try {
      const response = await eventsAPI.getById(eventId);
      setViewingEvent(response.data);
    } catch (error) {
      alert('Failed to load event details');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-xl text-dark-text">Loading...</div>
      </div>
    );
  }

  if (showProfitReport) {
    return <ProfitReport onClose={() => setShowProfitReport(false)} />;
  }

  if (showUserManagement) {
    return <UserManagement onClose={() => setShowUserManagement(false)} />;
  }

  if (showCommissionReport) {
    return <CommissionReport onClose={() => setShowCommissionReport(false)} />;
  }

  if (showExpenseManagement) {
    return <ExpenseManagement onClose={() => setShowExpenseManagement(false)} />;
  }

  if (viewingEvent) {
    return (
      <EventDetails
        eventData={viewingEvent}
        onClose={() => {
          setViewingEvent(null);
          loadData();
        }}
        onAddTransaction={(event) => {
          setSelectedEvent(event);
          setShowTransactionForm(true);
          setViewingEvent(null);
        }}
      />
    );
  }

  if (showEventForm) {
    return (
      <EventForm
        event={editingEvent}
        onClose={() => {
          setShowEventForm(false);
          setEditingEvent(null);
        }}
        onSuccess={handleEventCreated}
      />
    );
  }

  if (showTransactionForm) {
    return (
      <TransactionForm
        event={selectedEvent}
        onClose={() => {
          setShowTransactionForm(false);
          setSelectedEvent(null);
        }}
        onSuccess={handleTransactionCreated}
      />
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="bg-dark-card shadow-xl border-b border-dark-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-dark-text">Admin Dashboard</h1>
              <p className="text-sm text-dark-muted">Welcome, {user.full_name}</p>
            </div>
            <button onClick={onLogout} className="btn-secondary flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-4 flex gap-3 flex-wrap">
          <button
            onClick={() => setShowProfitReport(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Profit/Loss Report
          </button>
          <button
            onClick={() => setShowCommissionReport(true)}
            className="btn-primary flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Commission Report
          </button>
          <button
            onClick={() => setShowExpenseManagement(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Receipt className="w-4 h-4" />
            Manage Expenses
          </button>
          <button
            onClick={() => setShowUserManagement(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Manage Bookers
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="card">
              <div className="flex items-center gap-3">
                <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-800">
                  <Calendar className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-dark-muted">Total Events</p>
                  <p className="text-2xl font-bold text-dark-text">{stats.totalEvents}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-3">
                <div className="bg-green-900/30 p-3 rounded-lg border border-green-800">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-dark-muted">Net Profit</p>
                  <p className="text-2xl font-bold text-green-400">₹{stats.netProfit.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-3">
                <div className="bg-primary-900/30 p-3 rounded-lg border border-primary-800">
                  <TrendingUp className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <p className="text-sm text-dark-muted">Commission</p>
                  <p className="text-2xl font-bold text-primary-400">₹{stats.totalCommission.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-3">
                <div className="bg-orange-900/30 p-3 rounded-lg border border-orange-800">
                  <Ticket className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-dark-muted">Transactions</p>
                  <p className="text-2xl font-bold text-dark-text">{stats.totalTransactions}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-3">
                <div className="bg-red-900/30 p-3 rounded-lg border border-red-800">
                  <Receipt className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-dark-muted">Expenses</p>
                  <p className="text-2xl font-bold text-red-400">₹{stats.totalExpenses.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-dark-text">Events</h2>
          <button
            onClick={() => setShowEventForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>

        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="card text-center py-12">
              <Calendar className="w-16 h-16 text-dark-muted mx-auto mb-4" />
              <p className="text-dark-muted">No events yet. Create your first event!</p>
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="card">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-dark-text">{event.name}</h3>
                    <p className="text-sm text-dark-muted">{event.location}</p>
                    <p className="text-sm text-dark-muted mt-1">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                  {event.is_admin_event === 1 && (
                    <span className="bg-blue-900/30 text-blue-400 text-xs px-2 py-1 rounded-full border border-blue-800">
                      Admin Event
                    </span>
                  )}
                </div>

                {event.commission_per_ticket > 0 && (
                  <div className="mb-3">
                    <span className="text-sm text-dark-muted">
                      Commission: <span className="font-semibold text-primary-400">₹{event.commission_per_ticket} per ticket</span>
                    </span>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleViewEvent(event.id)}
                    className="btn-primary flex items-center gap-2 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  <button
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowTransactionForm(true);
                    }}
                    className="btn-secondary flex items-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Transaction
                  </button>
                  <button
                    onClick={() => {
                      setEditingEvent(event);
                      setShowEventForm(true);
                    }}
                    className="btn-secondary flex items-center gap-2 text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="btn-danger flex items-center gap-2 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
