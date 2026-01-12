import { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { eventsAPI } from '../utils/api';

function EventForm({ event, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: event?.name || '',
    date: event?.date || '',
    location: event?.location || '',
    description: event?.description || '',
    commission_per_ticket: event?.commission_per_ticket || 0,
    is_admin_event: event?.is_admin_event === 1 || false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (event) {
        await eventsAPI.update(event.id, formData);
      } else {
        await eventsAPI.create(formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="bg-dark-card shadow-xl border-b border-dark-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-dark-text">
              {event ? 'Edit Event' : 'Create New Event'}
            </h1>
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

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-dark-text mb-2">
              Event Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-dark-text mb-2">
              Event Date *
            </label>
            <input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-dark-text mb-2">
              Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-dark-text mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field"
              rows="3"
            />
          </div>

          <div>
            <label htmlFor="commission_per_ticket" className="block text-sm font-medium text-dark-text mb-2">
              Booker Commission (₹ per ticket)
            </label>
            <input
              id="commission_per_ticket"
              name="commission_per_ticket"
              type="number"
              min="0"
              step="0.01"
              value={formData.commission_per_ticket}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter amount per ticket"
            />
          </div>

          <div className="flex items-center">
            <input
              id="is_admin_event"
              name="is_admin_event"
              type="checkbox"
              checked={formData.is_admin_event}
              onChange={handleChange}
              className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
            />
            <label htmlFor="is_admin_event" className="ml-2 block text-sm text-dark-text">
              Admin Event (Zero Amount)
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
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

export default EventForm;
