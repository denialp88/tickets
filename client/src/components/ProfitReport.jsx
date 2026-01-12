import { X, TrendingUp, TrendingDown, DollarSign, Calendar, Ticket } from 'lucide-react';
import { useState, useEffect } from 'react';
import { eventsAPI, dashboardAPI } from '../utils/api';

function ProfitReport({ onClose }) {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
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
      
      const eventsWithDetails = await Promise.all(
        eventsRes.data.map(async (event) => {
          const details = await eventsAPI.getById(event.id);
          return details.data;
        })
      );
      
      setEvents(eventsWithDetails);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateEventProfit = (eventData) => {
    const { transactions } = eventData;
    const purchases = transactions.filter(t => t.transaction_type === 'purchase');
    const sales = transactions.filter(t => t.transaction_type === 'sale');
    
    const totalPurchase = purchases.reduce((sum, t) => sum + t.total_amount, 0);
    const totalSale = sales.reduce((sum, t) => sum + t.total_amount, 0);
    const totalCommission = transactions.reduce((sum, t) => sum + t.commission_amount, 0);
    
    const grossProfit = totalSale - totalPurchase;
    const netProfit = grossProfit - totalCommission;
    
    return {
      totalPurchase,
      totalSale,
      totalCommission,
      grossProfit,
      netProfit,
      purchaseCount: purchases.length,
      saleCount: sales.length,
      ticketsPurchased: purchases.reduce((sum, t) => sum + t.num_tickets, 0),
      ticketsSold: sales.reduce((sum, t) => sum + t.num_tickets, 0),
    };
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
              <h1 className="text-2xl font-bold text-dark-text">Profit & Loss Report</h1>
              <p className="text-sm text-dark-muted">Complete financial overview</p>
            </div>
            <button onClick={onClose} className="btn-secondary">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Overall Summary */}
        {stats && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-dark-text mb-4 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-primary-500" />
              Overall Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="card">
                <div className="flex items-center gap-3">
                  <div className="bg-red-900/30 p-3 rounded-lg border border-red-800">
                    <TrendingDown className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-muted">Total Purchases</p>
                    <p className="text-2xl font-bold text-red-400">₹{stats.totalPurchaseAmount.toFixed(2)}</p>
                    <p className="text-xs text-dark-muted">{stats.purchaseCount} transactions</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center gap-3">
                  <div className="bg-green-900/30 p-3 rounded-lg border border-green-800">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-muted">Total Sales</p>
                    <p className="text-2xl font-bold text-green-400">₹{stats.totalSaleAmount.toFixed(2)}</p>
                    <p className="text-xs text-dark-muted">{stats.saleCount} transactions</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-900/30 p-3 rounded-lg border border-primary-800">
                    <DollarSign className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-muted">Total Commission</p>
                    <p className="text-2xl font-bold text-primary-400">₹{stats.totalCommission.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center gap-3">
                  <div className={`${stats.netProfit >= 0 ? 'bg-green-900/30 border-green-800' : 'bg-red-900/30 border-red-800'} p-3 rounded-lg border`}>
                    <DollarSign className={`w-6 h-6 ${stats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                  </div>
                  <div>
                    <p className="text-sm text-dark-muted">Net Profit</p>
                    <p className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ₹{stats.netProfit.toFixed(2)}
                    </p>
                    <p className="text-xs text-dark-muted">
                      Gross: ₹{stats.grossProfit.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Individual Event Reports */}
        <div>
          <h2 className="text-xl font-bold text-dark-text mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary-500" />
            Event-wise Profit/Loss
          </h2>
          
          {events.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-dark-muted">No events found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((eventData) => {
                const { event, transactions } = eventData;
                const profit = calculateEventProfit(eventData);
                
                return (
                  <div key={event.id} className="card">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-dark-text">{event.name}</h3>
                        <p className="text-sm text-dark-muted">{event.location}</p>
                        <p className="text-xs text-dark-muted mt-1">
                          {new Date(event.date).toLocaleDateString()}
                        </p>
                        {event.commission_per_ticket > 0 && (
                          <p className="text-xs text-primary-400 mt-1">
                            Commission: ₹{event.commission_per_ticket}/ticket
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${profit.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {profit.netProfit >= 0 ? '+' : ''}₹{profit.netProfit.toFixed(2)}
                        </div>
                        <p className="text-xs text-dark-muted">Net Profit</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-dark-bg/50 p-3 rounded-lg border border-dark-border">
                        <p className="text-xs text-dark-muted mb-1">Purchases</p>
                        <p className="text-lg font-bold text-red-400">₹{profit.totalPurchase.toFixed(2)}</p>
                        <p className="text-xs text-dark-muted">{profit.ticketsPurchased} tickets</p>
                      </div>

                      <div className="bg-dark-bg/50 p-3 rounded-lg border border-dark-border">
                        <p className="text-xs text-dark-muted mb-1">Sales</p>
                        <p className="text-lg font-bold text-green-400">₹{profit.totalSale.toFixed(2)}</p>
                        <p className="text-xs text-dark-muted">{profit.ticketsSold} tickets</p>
                      </div>

                      <div className="bg-dark-bg/50 p-3 rounded-lg border border-dark-border">
                        <p className="text-xs text-dark-muted mb-1">Commission</p>
                        <p className="text-lg font-bold text-primary-400">₹{profit.totalCommission.toFixed(2)}</p>
                      </div>

                      <div className="bg-dark-bg/50 p-3 rounded-lg border border-dark-border">
                        <p className="text-xs text-dark-muted mb-1">Gross Profit</p>
                        <p className={`text-lg font-bold ${profit.grossProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ₹{profit.grossProfit.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-dark-muted">
                      <div className="flex items-center gap-1">
                        <Ticket className="w-4 h-4" />
                        <span>{transactions.length} transactions</span>
                      </div>
                      <div>
                        <span className="text-red-400">{profit.purchaseCount} purchases</span>
                        {' • '}
                        <span className="text-green-400">{profit.saleCount} sales</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfitReport;
