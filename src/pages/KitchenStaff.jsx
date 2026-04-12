import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import { Plus, Edit, ChefHat, Eye, EyeOff } from 'lucide-react';

const KitchenStaff = () => {
  const [staff, setStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await api.get('/kitchen-staff');
      setStaff(res.data);
    } catch (error) {
      toast.error('Failed to fetch kitchen staff');
    }
  };

  const openModal = (member = null) => {
    setCurrentStaff(member);
    setFormData(member
      ? { name: member.name, phone: member.phone, password: '' }
      : { name: '', phone: '', password: '' }
    );
    setShowPassword(false);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentStaff) {
        await api.put(`/kitchen-staff/${currentStaff.id}`, formData);
        toast.success('Kitchen staff updated');
      } else {
        await api.post('/kitchen-staff', formData);
        toast.success('Kitchen staff created');
      }
      setShowModal(false);
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const toggleActive = async (id) => {
    try {
      await api.patch(`/kitchen-staff/${id}/toggle-active`);
      toast.success('Status updated');
      fetchStaff();
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-2">
          <ChefHat size={28} style={{ color: 'var(--primary)' }} />
          <h2>Kitchen Staff</h2>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Add Kitchen Staff
        </button>
      </div>

      {/* Info Banner */}
      <div className="card mb-4" style={{ 
        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05), rgba(79, 70, 229, 0.1))',
        border: '1px dashed var(--primary)',
        padding: '1rem 1.5rem'
      }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--primary)' }}>💡 Login Credentials:</strong> Kitchen staff can log in at the unified login page using their <strong>Phone Number</strong> and <strong>Password</strong> (default: <code>kitchen123</code>). They will be redirected to the Kitchen Display panel.
        </p>
      </div>

      <div className="card table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                  No kitchen staff found. Click "Add Kitchen Staff" to create one.
                </td>
              </tr>
            ) : staff.map(s => (
              <tr key={s.id}>
                <td>#{s.id}</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div style={{
                      width: '32px', height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #ff6b00, #ff3b3b)',
                      display: 'flex', justifyContent: 'center', alignItems: 'center',
                      color: 'white', fontWeight: '700', fontSize: '0.8rem'
                    }}>
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    {s.name}
                  </div>
                </td>
                <td>{s.phone}</td>
                <td>
                  <span
                    className={`badge ${s.is_active ? 'badge-success' : 'badge-neutral'}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleActive(s.id)}
                  >
                    {s.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {s.last_login_time
                    ? new Date(s.last_login_time).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })
                    : 'Never'
                  }
                </td>
                <td>
                  <button className="btn btn-outline" style={{ padding: '0.4rem 0.6rem' }} onClick={() => openModal(s)}>
                    <Edit size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="card animate-fade-in" style={{ width: '420px' }}>
            <h3 className="mb-4">{currentStaff ? 'Edit Kitchen Staff' : 'Add Kitchen Staff'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Head Chef Raju"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="e.g. 8888888888"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Password {currentStaff && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>(leave blank to keep current)</span>}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder={currentStaff ? 'Enter new password' : 'Default: kitchen123'}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    {...(!currentStaff ? {} : {})}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="d-flex gap-2 mt-4">
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KitchenStaff;
