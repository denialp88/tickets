import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Users, UserPlus } from 'lucide-react';
import { usersAPI } from '../utils/api';

function UserManagement({ onClose }) {
  const [users, setUsers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    mobile: '',
    role: 'booker'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to load users:', error);
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

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await usersAPI.create(formData);
      setFormData({ username: '', password: '', full_name: '', mobile: '' });
      setShowAddForm(false);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create booker');
    }
  };

  const handleDelete = async (userId) => {
    const user = users.find(u => u.id === userId);
    const userType = user?.role === 'admin' ? 'admin' : 'booker';
    if (confirm(`Are you sure you want to delete this ${userType}?`)) {
      try {
        await usersAPI.delete(userId);
        loadUsers();
      } catch (error) {
        alert('Failed to delete user');
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
              <h1 className="text-2xl font-bold text-dark-text">User Management</h1>
              <p className="text-sm text-dark-muted">Manage booker accounts</p>
            </div>
            <button onClick={onClose} className="btn-secondary">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-dark-text flex items-center gap-2">
            <Users className="w-6 h-6 text-primary-500" />
            All Users
          </h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add New User
          </button>
        </div>

        {showAddForm && (
          <div className="card mb-6">
            <h3 className="text-lg font-bold text-dark-text mb-4">Create New User</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-dark-text mb-2">
                    User Role *
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="booker">Booker</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-dark-text mb-2">
                    Username *
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-dark-text mb-2">
                    Temporary Password *
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Min 6 characters"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-dark-text mb-2">
                    Full Name
                  </label>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-dark-text mb-2">
                    Mobile Number
                  </label>
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn-primary">
                  Create {formData.role === 'admin' ? 'Admin' : 'Booker'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setError('');
                    setFormData({ username: '', password: '', full_name: '', mobile: '', role: 'booker' });
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-dark-muted">
                Note: User will be required to reset password on first login
              </p>
            </form>
          </div>
        )}

        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="card">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-dark-text">{user.username}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-primary-900/30 text-primary-400 border border-primary-800' 
                        : 'bg-blue-900/30 text-blue-400 border border-blue-800'
                    }`}>
                      {user.role}
                    </span>
                    {user.first_login === 1 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-orange-900/30 text-orange-400 border border-orange-800">
                        First Login Pending
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-dark-muted mt-1">
                    {user.full_name || 'No name'} {user.mobile && `• ${user.mobile}`}
                  </p>
                  <p className="text-xs text-dark-muted mt-1">
                    Created: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="btn-danger flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
