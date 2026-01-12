import { useState, useEffect } from 'react';
import { X, DollarSign, CheckCircle, Clock, Calendar } from 'lucide-react';
import { commissionAPI } from '../utils/api';

function CommissionReport({ onClose }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      const response = await commissionAPI.getReport();
      setReport(response.data);
    } catch (error) {
      console.error('Failed to load commission report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkEventPaid = async (eventId, eventName) => {
    if (confirm(`Mark all commissions as PAID for "${eventName}"?`)) {
      try {
        await commissionAPI.markEventPaid(eventId);
        loadReport();
      } catch (error) {
        alert('Failed to mark commission as paid');
      }
    }
  };

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
              <h1 className="text-2xl font-bold text-dark-text">Commission Payment Report</h1>
              <p className="text-sm text-dark-muted">Track and manage booker commission payments</p>
            </div>
            <button onClick={onClose} className="btn-secondary">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {report && (
          <>
            {/* Summary Cards */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-dark-text mb-4 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-primary-500" />
                Overall Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-900/30 p-3 rounded-lg border border-primary-800">
                      <DollarSign className="w-6 h-6 text-primary-400" />
                    </div>
                    <div>
                      <p className="text-sm text-dark-muted">Total Commission</p>
                      <p className="text-2xl font-bold text-primary-400">
                        ₹{report.summary.totalCommission.toFixed(2)}
                      </p>
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
                      <p className="text-2xl font-bold text-orange-400">
                        ₹{report.summary.pendingCommission.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-900/30 p-3 rounded-lg border border-green-800">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-dark-muted">Paid</p>
                      <p className="text-2xl font-bold text-green-400">
                        ₹{report.summary.paidCommission.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Event-wise Report */}
            <div>
              <h2 className="text-xl font-bold text-dark-text mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-primary-500" />
                Event-wise Commission Report
              </h2>

              {report.eventReport.length === 0 ? (
                <div className="card text-center py-12">
                  <p className="text-dark-muted">No commission data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {report.eventReport.map((event) => (
                    <div key={event.eventId} className="card">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-dark-text">{event.eventName}</h3>
                          <p className="text-sm text-dark-muted">
                            {new Date(event.eventDate).toLocaleDateString()} • {event.transactionCount} transactions
                          </p>
                        </div>
                        {event.pendingCommission > 0 && (
                          <button
                            onClick={() => handleMarkEventPaid(event.eventId, event.eventName)}
                            className="btn-primary flex items-center gap-2 text-sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Mark as Paid
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-dark-bg/50 p-3 rounded-lg border border-dark-border">
                          <p className="text-xs text-dark-muted mb-1">Total Commission</p>
                          <p className="text-lg font-bold text-primary-400">
                            ₹{event.totalCommission.toFixed(2)}
                          </p>
                        </div>

                        <div className="bg-dark-bg/50 p-3 rounded-lg border border-dark-border">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-3 h-3 text-orange-400" />
                            <p className="text-xs text-dark-muted">Pending</p>
                          </div>
                          <p className="text-lg font-bold text-orange-400">
                            ₹{event.pendingCommission.toFixed(2)}
                          </p>
                        </div>

                        <div className="bg-dark-bg/50 p-3 rounded-lg border border-dark-border">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            <p className="text-xs text-dark-muted">Paid</p>
                          </div>
                          <p className="text-lg font-bold text-green-400">
                            ₹{event.paidCommission.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {event.pendingCommission === 0 && event.paidCommission > 0 && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span>All commissions paid for this event</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CommissionReport;
