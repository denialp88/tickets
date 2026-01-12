import { useState } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { transactionsAPI } from '../utils/api';

function TransactionForm({ event, onClose, onSuccess }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';
  const [formData, setFormData] = useState({
    event_id: event.id,
    transaction_type: 'purchase',
    num_tickets: '',
    price_per_ticket: '',
    party_name: '',
    party_mobile: '',
    upi_id: '',
    payment_reference: '',
    transaction_date: new Date().toISOString().split('T')[0],
    notes: '',
    no_commission: false,
  });
  const [qrImage, setQrImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setQrImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const calculateTotals = () => {
    const numTickets = parseInt(formData.num_tickets) || 0;
    const pricePerTicket = parseFloat(formData.price_per_ticket) || 0;
    const totalAmount = numTickets * pricePerTicket;
    
    let commissionAmount = 0;
    if (!formData.no_commission && !event.is_admin_event && event.commission_per_ticket > 0) {
      commissionAmount = numTickets * event.commission_per_ticket;
    }
    
    const netAmount = totalAmount - commissionAmount;
    
    return { totalAmount, commissionAmount, netAmount };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitData = { ...formData };
      if (qrImage) {
        submitData.qr_image = qrImage;
      }
      
      await transactionsAPI.create(submitData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  const { totalAmount, commissionAmount, netAmount } = calculateTotals();

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="bg-dark-card shadow-xl border-b border-dark-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-dark-text">Add Transaction</h1>
              <p className="text-sm text-dark-muted">{event.name}</p>
            </div>
            <button onClick={onClose} className="btn-secondary">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="card space-y-6">
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {isAdmin ? (
            <div>
              <label htmlFor="transaction_type" className="block text-sm font-medium text-pink-400 mb-2">
                Transaction Type *
              </label>
              <select
                id="transaction_type"
                name="transaction_type"
                value={formData.transaction_type}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="purchase">Purchase (Bought)</option>
                <option value="sale">Sale (Sold)</option>
              </select>
            </div>
          ) : (
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-400 font-medium">Transaction Type: Purchase (Bought)</p>
              <p className="text-xs text-dark-muted mt-1">Bookers can only add purchase transactions</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="num_tickets" className="block text-sm font-medium text-pink-400 mb-2">
                Number of Tickets *
              </label>
              <input
                id="num_tickets"
                name="num_tickets"
                type="number"
                min="1"
                value={formData.num_tickets}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="price_per_ticket" className="block text-sm font-medium text-pink-400 mb-2">
                Price per Ticket (₹) *
              </label>
              <input
                id="price_per_ticket"
                name="price_per_ticket"
                type="number"
                min="0"
                step="0.01"
                value={formData.price_per_ticket}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>

          {totalAmount > 0 && (
            <div className="bg-dark-bg/50 border border-dark-border rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-pink-400">Total Amount:</span>
                <span className="font-semibold text-pink-400">₹{totalAmount.toFixed(2)}</span>
              </div>
              {commissionAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-pink-400">Commission (₹{event.commission_per_ticket}/ticket):</span>
                  <span className="font-semibold text-pink-400">-₹{commissionAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm pt-2 border-t border-dark-border">
                <span className="text-pink-400 font-medium">Net Amount:</span>
                <span className="font-bold text-pink-400">₹{netAmount.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="party_name" className="block text-sm font-medium text-pink-400 mb-2">
              {formData.transaction_type === 'purchase' ? 'Seller Name' : 'Buyer Name'} *
            </label>
            <input
              id="party_name"
              name="party_name"
              type="text"
              value={formData.party_name}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="party_mobile" className="block text-sm font-medium text-pink-400 mb-2">
              Mobile Number
            </label>
            <input
              id="party_mobile"
              name="party_mobile"
              type="tel"
              value={formData.party_mobile}
              onChange={handleChange}
              className="input-field"
              placeholder="+91 XXXXXXXXXX"
            />
          </div>

          <div>
            <label htmlFor="upi_id" className="block text-sm font-medium text-pink-400 mb-2">
              UPI ID
            </label>
            <input
              id="upi_id"
              name="upi_id"
              type="text"
              value={formData.upi_id}
              onChange={handleChange}
              className="input-field"
              placeholder="example@upi"
            />
          </div>

          <div>
            <label htmlFor="payment_reference" className="block text-sm font-medium text-pink-400 mb-2">
              Payment Reference Number
            </label>
            <input
              id="payment_reference"
              name="payment_reference"
              type="text"
              value={formData.payment_reference}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-pink-400 mb-2">
              QR Code / Payment Screenshot
            </label>
            <div className="border-2 border-dashed border-pink-400 rounded-lg p-4 bg-dark-bg/30">
              {imagePreview ? (
                <div className="space-y-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-w-xs mx-auto rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setQrImage(null);
                      setImagePreview(null);
                    }}
                    className="btn-secondary w-full"
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center cursor-pointer">
                  <Upload className="w-12 h-12 text-pink-400 mb-2" />
                  <span className="text-sm text-pink-400 mb-1">Click to upload image</span>
                  <span className="text-xs text-pink-400">PNG, JPG, WEBP (max 5MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="transaction_date" className="block text-sm font-medium text-pink-400 mb-2">
              Transaction Date *
            </label>
            <input
              id="transaction_date"
              name="transaction_date"
              type="date"
              value={formData.transaction_date}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-pink-400 mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="input-field"
              rows="3"
              placeholder="Additional notes..."
            />
          </div>

          {isAdmin && (
            <div className="flex items-center">
              <input
                id="no_commission"
                name="no_commission"
                type="checkbox"
                checked={formData.no_commission}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="no_commission" className="ml-2 block text-sm text-dark-text">
                No Commission (Admin Override)
              </label>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Saving...' : 'Add Transaction'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransactionForm;
