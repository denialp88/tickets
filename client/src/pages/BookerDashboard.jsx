import { useState, useEffect } from 'react';
import { LogOut, Plus, DollarSign, TrendingUp, Ticket, Clock, CheckCircle } from 'lucide-react';
import { eventsAPI, bookerAPI } from '../utils/api';
import TransactionForm from '../components/TransactionForm';

function BookerDashboard({ user, onLogout }) {
  const [events, setEvents] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const [eventsRes, earningsRes] = await Promise.all([
        eventsAPI.getAll(),
        bookerAPI.getEarnings()
      ]);
      setEvents(eventsRes.data);
      setEarnings(earningsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionCreated = () => {
    setShowTransactionForm(false);
    setSelectedEvent(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-xl text-dark-text">Loading...</div>
      </div>
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
              <h1 className="text-2xl font-bold text-dark-text">Booker Dashboard</h1>
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
        {earnings ? (
          <div>
            <h2 className="text-xl font-bold text-dark-text mb-4">My Earnings</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="card">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-900/30 p-3 rounded-lg border border-primary-800">
                    <DollarSign className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-muted">Total Commission</p>
                    <p className="text-2xl font-bold text-primary-400">₹{earnings.totalCommission.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-900/30 p-3 rounded-lg border border-orange-800">
                    <Clock className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-muted">Pending Payment</p>
                    <p className="text-2xl font-bold text-orange-400">₹{earnings.pendingCommission.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center gap-3">
                  <div className="bg-green-900/30 p-3 rounded-lg border border-green-800">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-muted">Received</p>
                    <p className="text-2xl font-bold text-green-400">₹{earnings.paidCommission.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-800">
                    <Ticket className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-muted">Total Tickets</p>
                    <p className="text-2xl font-bold text-dark-text">
                      {earnings.eventEarnings.reduce((sum, e) => sum + e.tickets, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {earnings.eventEarnings.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-dark-text mb-3">Event-wise Earnings</h3>
                <div className="space-y-3">
                  {earnings.eventEarnings.map((event, index) => (
                    <div key={index} className="card">
                      <div className="mb-3">
                        <h4 className="font-semibold text-dark-text">{event.eventName}</h4>
                        <p className="text-sm text-dark-muted">
                          {event.transactions} transactions • {event.tickets} tickets
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-dark-bg/50 p-2 rounded border border-dark-border">
                          <p className="text-xs text-dark-muted mb-1">Total</p>
                          <p className="text-sm font-bold text-primary-400">₹{event.commission.toFixed(2)}</p>
                        </div>
                        <div className="bg-dark-bg/50 p-2 rounded border border-dark-border">
                          <div className="flex items-center gap-1 mb-1">
                            <Clock className="w-3 h-3 text-orange-400" />
                            <p className="text-xs text-dark-muted">Pending</p>
                          </div>
                          <p className="text-sm font-bold text-orange-400">₹{event.pendingCommission.toFixed(2)}</p>
                        </div>
                        <div className="bg-dark-bg/50 p-2 rounded border border-dark-border">
                          <div className="flex items-center gap-1 mb-1">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            <p className="text-xs text-dark-muted">Received</p>
                          </div>
                          <p className="text-sm font-bold text-green-400">₹{event.paidCommission.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-dark-muted">Loading earnings data...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookerDashboard;
