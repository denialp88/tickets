import { X, Plus, Trash2, ShoppingCart, DollarSign, TrendingUp, Image as ImageIcon } from 'lucide-react';
import { transactionsAPI } from '../utils/api';
import { useState } from 'react';

function EventDetails({ eventData, onClose, onAddTransaction }) {
  const { event, transactions } = eventData;
  const [selectedImage, setSelectedImage] = useState(null);

  const handleDeleteTransaction = async (transactionId) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionsAPI.delete(transactionId);
        window.location.reload();
      } catch (error) {
        alert('Failed to delete transaction');
      }
    }
  };

  const purchases = transactions.filter(t => t.transaction_type === 'purchase');
  const sales = transactions.filter(t => t.transaction_type === 'sale');

  const totalPurchaseAmount = purchases.reduce((sum, t) => sum + t.total_amount, 0);
  const totalSaleAmount = sales.reduce((sum, t) => sum + t.total_amount, 0);
  const totalCommission = transactions.reduce((sum, t) => sum + t.commission_amount, 0);
  const grossProfit = totalSaleAmount - totalPurchaseAmount;
  const netProfit = grossProfit - totalCommission;

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="bg-dark-card shadow-xl border-b border-dark-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-dark-text">{event.name}</h1>
              <p className="text-sm text-dark-muted">{event.location} • {new Date(event.date).toLocaleDateString()}</p>
            </div>
            <button onClick={onClose} className="btn-secondary">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="bg-red-900/30 p-3 rounded-lg border border-red-800">
                <ShoppingCart className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-dark-muted">Purchases</p>
                <p className="text-xl font-bold text-red-400">₹{totalPurchaseAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="bg-green-900/30 p-3 rounded-lg border border-green-800">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-dark-muted">Sales</p>
                <p className="text-xl font-bold text-green-400">₹{totalSaleAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="bg-orange-900/30 p-3 rounded-lg border border-orange-800">
                <TrendingUp className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-dark-muted">Commission</p>
                <p className="text-xl font-bold text-orange-400">₹{totalCommission.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className={`${netProfit >= 0 ? 'bg-green-900/30 border-green-800' : 'bg-red-900/30 border-red-800'} p-3 rounded-lg border`}>
                <DollarSign className={`w-6 h-6 ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`} />
              </div>
              <div>
                <p className="text-sm text-dark-muted">Net Profit</p>
                <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ₹{netProfit.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-dark-text">Transactions</h2>
          <button
            onClick={() => onAddTransaction(event)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-dark-muted">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="card">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                        transaction.transaction_type === 'purchase' 
                          ? 'bg-red-900/30 text-red-400 border-red-800' 
                          : 'bg-green-900/30 text-green-400 border-green-800'
                      }`}>
                        {transaction.transaction_type === 'purchase' ? 'Purchase' : 'Sale'}
                      </span>
                      <span className="text-sm text-dark-muted">
                        {new Date(transaction.transaction_date).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-dark-text">{transaction.party_name}</h3>
                  </div>
                  <button
                    onClick={() => handleDeleteTransaction(transaction.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-dark-muted">Tickets</p>
                    <p className="font-semibold text-dark-text">{transaction.num_tickets}</p>
                  </div>
                  <div>
                    <p className="text-sm text-dark-muted">Price per Ticket</p>
                    <p className="font-semibold text-dark-text">₹{transaction.price_per_ticket}</p>
                  </div>
                  <div>
                    <p className="text-sm text-dark-muted">Total Amount</p>
                    <p className="font-semibold text-dark-text">₹{transaction.total_amount.toFixed(2)}</p>
                  </div>
                  {transaction.commission_amount > 0 && (
                    <div>
                      <p className="text-sm text-dark-muted">Commission</p>
                      <p className="font-semibold text-orange-400">₹{transaction.commission_amount.toFixed(2)}</p>
                    </div>
                  )}
                </div>

                {(transaction.party_mobile || transaction.upi_id || transaction.payment_reference) && (
                  <div className="border-t border-dark-border pt-3 mt-3 space-y-2">
                    {transaction.party_mobile && (
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-muted">Mobile:</span>
                        <span className="font-medium text-dark-text">{transaction.party_mobile}</span>
                      </div>
                    )}
                    {transaction.upi_id && (
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-muted">UPI ID:</span>
                        <span className="font-medium text-dark-text">{transaction.upi_id}</span>
                      </div>
                    )}
                    {transaction.payment_reference && (
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-muted">Reference:</span>
                        <span className="font-medium text-dark-text">{transaction.payment_reference}</span>
                      </div>
                    )}
                  </div>
                )}

                {transaction.qr_image_path && (
                  <div className="border-t border-dark-border pt-3 mt-3">
                    <button
                      onClick={() => setSelectedImage(`https://chabuk-xi-backend.onrender.com${transaction.qr_image_path}`)}
                      className="flex items-center gap-2 text-primary-400 hover:text-primary-500 text-sm font-medium"
                    >
                      <ImageIcon className="w-4 h-4" />
                      View Payment Screenshot
                    </button>
                  </div>
                )}

                {transaction.notes && (
                  <div className="border-t border-dark-border pt-3 mt-3">
                    <p className="text-sm text-dark-muted">Notes:</p>
                    <p className="text-sm text-dark-text mt-1">{transaction.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage}
              alt="Payment Screenshot"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default EventDetails;
