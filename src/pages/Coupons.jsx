import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState(null);
  const [formData, setFormData] = useState({ code: '', discount_percentage: '', expiry_date: '', is_active: true });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/coupons');
      setCoupons(res.data);
    } catch {
      toast.error('Failed to fetch coupons');
    }
  };

  const openModal = (coupon = null) => {
    setCurrentCoupon(coupon);
    setFormData(coupon ? { 
      code: coupon.code, 
      discount_percentage: coupon.discount_percentage, 
      expiry_date: coupon.expiry_date ? coupon.expiry_date.split('T')[0] : '', 
      is_active: coupon.is_active 
    } : { code: '', discount_percentage: '', expiry_date: '', is_active: true });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentCoupon) {
        await api.put(`/coupons/${currentCoupon.id}`, formData);
        toast.success('Coupon updated');
      } else {
        await api.post('/coupons', formData);
        toast.success('Coupon created');
      }
      setShowModal(false);
      fetchCoupons();
    } catch {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete coupon?')) {
      try {
        await api.delete(`/coupons/${id}`);
        toast.success('Deleted');
        fetchCoupons();
      } catch {
        toast.error('Failed to delete');
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Coupons</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Add Coupon
        </button>
      </div>

      <div className="card table-container">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount (%)</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(c => (
              <tr key={c.id}>
                <td style={{fontWeight: 'bold', letterSpacing: '1px'}}>{c.code}</td>
                <td>{c.discount_percentage}%</td>
                <td>{c.expiry_date ? new Date(c.expiry_date).toLocaleDateString() : 'No expiry'}</td>
                <td>
                  <span className={`badge ${c.is_active ? 'badge-success' : 'badge-neutral'}`}>
                    {c.is_active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <button className="btn btn-outline" style={{padding: '0.4rem 0.6rem'}} onClick={() => openModal(c)}><Edit size={16} /></button>
                    <button className="btn" style={{padding: '0.4rem 0.6rem', color: '#dc2626', border: '1px solid #dc2626'}} onClick={() => handleDelete(c.id)}><Trash2 size={16} /></button>
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
          <div className="card animate-fade-in" style={{ width: '400px' }}>
            <h3 className="mb-4">{currentCoupon ? 'Edit Coupon' : 'Add Coupon'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Code</label>
                <input type="text" className="form-control" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Discount Percentage</label>
                <input type="number" step="0.01" className="form-control" value={formData.discount_percentage} onChange={e => setFormData({...formData, discount_percentage: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Expiry Date</label>
                <input type="date" className="form-control" value={formData.expiry_date} onChange={e => setFormData({...formData, expiry_date: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} /> Active
                </label>
              </div>
              <div className="d-flex gap-2 mt-4">
                <button type="button" className="btn btn-outline" style={{flex: 1}} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{flex: 1}}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;
