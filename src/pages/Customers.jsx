import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'sonner';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', gender: '', location: '', password: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch (error) {
      toast.error('Failed to fetch customers');
    }
  };

  const openModal = (cust = null) => {
    setCurrentCustomer(cust);
    if (cust) {
      setFormData({
        name: cust.name, email: cust.email, phone: cust.phone || '',
        gender: cust.gender || '', location: cust.location || '',
        password: '' // Don't show password
      });
    } else {
      setFormData({
        name: '', email: '', phone: '', gender: '', location: '', password: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentCustomer) {
        // For simple update, password might be empty if not changing
        await api.put(`/customers/${currentCustomer.id}`, formData);
        toast.success('Customer updated');
      } else {
        // Using the same endpoint as public registration for simplicity or a new admin one
        await api.post('/customer-auth/register', formData);
        toast.success('Customer created');
      }
      setShowModal(false);
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const toggleBlock = async (id) => {
    try {
      await api.patch(`/customers/${id}/toggle-block`);
      toast.success('Customer status updated');
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Customers</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>
          Add Customer
        </button>
      </div>
      <div className="card table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Gender</th>
              <th>Location</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: '600' }}>{c.name}</td>
                <td>
                  <div style={{ fontSize: '0.9rem' }}>{c.email}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.phone}</div>
                </td>
                <td>{c.gender}</td>
                <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.location}
                </td>
                <td>
                  <span className={`badge ${c.is_blocked ? 'badge-danger' : 'badge-success'}`}>
                    {c.is_blocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '0.4rem 0.6rem' }}
                      onClick={() => openModal(c)}
                    >
                      Edit
                    </button>
                    <button 
                      className={`btn ${c.is_blocked ? 'btn-primary' : 'btn-outline'}`} 
                      style={{ padding: '0.4rem 0.8rem' }}
                      onClick={() => toggleBlock(c.id)}
                    >
                      {c.is_blocked ? 'Unblock' : 'Block'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="card animate-fade-in" style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 className="mb-4">{currentCustomer ? 'Edit Customer' : 'Add New Customer'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group mb-3">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">Phone</label>
                  <input type="text" className="form-control" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group mb-3">
                  <label className="form-label">Gender</label>
                  <select className="form-control" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} required>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder={currentCustomer ? "Leave blank to keep same" : "Ente password"}
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                    required={!currentCustomer} 
                  />
                </div>
              </div>
              <div className="form-group mb-4">
                <label className="form-label">Location</label>
                <textarea className="form-control" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required></textarea>
              </div>
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{currentCustomer ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
