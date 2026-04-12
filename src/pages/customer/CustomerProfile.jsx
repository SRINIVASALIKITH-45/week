import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Phone, Mail, MapPin, CreditCard, Package,
  ChevronRight, Edit3, Plus, Trash2, LogOut,
  Shield, Bell, HelpCircle, Star, ChevronLeft, Check
} from 'lucide-react';
import { CustomerAuthContext } from '../../context/CustomerAuthContext';
import CustomerLayout from '../../components/CustomerLayout';
import { toast } from 'sonner';
import api from '../../services/api';
import './CustomerProfile.css';

const CustomerProfile = () => {
  const navigate = useNavigate();
  const { customer, logout } = useContext(CustomerAuthContext);

  const [editMode, setEditMode] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ orders: 0, rating: 4.8, saved: 0 });
  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  
  const [form, setForm] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
  });

  React.useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const [statsRes, addrRes, payRes] = await Promise.all([
        api.get('/customer-profile/stats'),
        api.get('/customer-profile/addresses'),
        api.get('/customer-profile/payment-methods')
      ]);
      setStats(statsRes.data);
      setAddresses(addrRes.data);
      setPaymentMethods(payRes.data);
    } catch (err) {
      console.error('Error fetching profile data:', err);
      toast.error('Error fetching profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.put(`/customers/${customer.id}`, form);
      toast.success('Profile updated successfully!');
      setEditMode(false);
      // Wait for AuthContext to update if it has a way, otherwise maybe refresh?
      // For now just local success.
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/customer-login');
  };

  const initials = customer?.name
    ? customer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'FD';

  const menuItems = [
    {
      group: 'Account',
      items: [
        { icon: Package, label: 'My Orders', sub: 'View order history', path: '/customer/orders', color: '#8b5cf6' },
        { icon: MapPin, label: 'Saved Addresses', sub: `${addresses.length} addresses saved`, color: '#22c55e', action: 'address' },
        { icon: CreditCard, label: 'Payment Methods', sub: `${paymentMethods.length} methods linked`, color: '#3b82f6', action: 'payment' },
      ]
    },
    {
      group: 'More',
      items: [
        { icon: Bell, label: 'Notifications', sub: 'Manage preferences', color: '#f59e0b', action: 'notif' },
        { icon: Shield, label: 'Privacy & Security', sub: 'Manage your data', color: '#64748b', action: 'privacy' },
        { icon: HelpCircle, label: 'Help & Support', sub: 'FAQs and contact us', color: '#0ea5e9', action: 'help' },
        { icon: Star, label: 'Rate the App', sub: 'Love the experience?', color: '#f59e0b', action: 'rate' },
      ]
    }
  ];

  const [expandedSection, setExpandedSection] = useState(null);

  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: '', address: '' });

  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({ type: 'Credit Card', detail: '' });

  const handleAddAddress = async () => {
    if (!newAddress.address) return toast.error('Address cannot be empty');
    try {
      await api.post('/customer-profile/addresses', newAddress);
      toast.success('Address added successfully');
      setShowAddAddress(false);
      setNewAddress({ label: '', address: '' });
      fetchProfileData();
    } catch (err) {
      console.error('Add address error:', err);
      toast.error('Failed to add: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAddPayment = async () => {
    if (!newPayment.detail) return toast.error('Payment detail cannot be empty');
    try {
      await api.post('/customer-profile/payment-methods', newPayment);
      toast.success('Payment Method added successfully');
      setShowAddPayment(false);
      setNewPayment({ type: 'Credit Card', detail: '' });
      fetchProfileData();
    } catch (err) {
      console.error('Add payment error:', err);
      toast.error('Failed to add payment: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <CustomerLayout>
      <div className="cpro-container">
        {/* Header */}
        <div className="cpro-header">
          <div className="cpro-header-inner">
            <h1 className="cpro-header-title">My Profile</h1>
            <button
              className="cpro-edit-btn"
              onClick={() => editMode ? handleSave() : setEditMode(true)}
            >
              {editMode ? (
                <><Check size={16} /> Save</>
              ) : (
                <><Edit3 size={16} /> Edit</>
              )}
            </button>
          </div>

          {/* Avatar + Info */}
          <div className="cpro-avatar-section">
            <div className="cpro-avatar-wrap">
              <div className="cpro-avatar">{initials}</div>
              <div className="cpro-avatar-ring" />
              {editMode && (
                <button className="cpro-avatar-edit">
                  <Edit3 size={12} />
                </button>
              )}
            </div>
            {!editMode ? (
              <div className="cpro-user-info">
                <h2 className="cpro-name">{customer?.name || 'Food Lover'}</h2>
                <p className="cpro-email">{customer?.email || 'user@example.com'}</p>
                <div className="cpro-member-badge">
                  <Star size={12} fill="var(--primary)" color="var(--primary)" /> Premium Member
                </div>
              </div>
            ) : (
              <div className="cpro-edit-fields">
                <input
                  className="cpro-field"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Full Name"
                />
                <input
                  className="cpro-field"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="Email"
                  type="email"
                />
                <input
                  className="cpro-field"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="Phone Number"
                  type="tel"
                />
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="cpro-stats">
            <div className="cpro-stat">
              <span className="cpro-stat-val">{stats.orders}</span>
              <span className="cpro-stat-label">Orders</span>
            </div>
            <div className="cpro-stat-divider" />
            <div className="cpro-stat">
              <span className="cpro-stat-val">{(stats.rating || 4.8).toFixed(1)}</span>
              <span className="cpro-stat-label">Rating</span>
            </div>
            <div className="cpro-stat-divider" />
            <div className="cpro-stat">
              <span className="cpro-stat-val">₹{stats.saved}</span>
              <span className="cpro-stat-label">Saved</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="cpro-body">
          {/* Saved Addresses */}
          <div className="cpro-section">
            <div
              className="cpro-section-header"
              onClick={() => setExpandedSection(expandedSection === 'address' ? null : 'address')}
            >
              <div className="cpro-section-left">
                <div className="cpro-section-icon" style={{ background: '#F0FDF4' }}>
                  <MapPin size={18} color="#22c55e" />
                </div>
                <div>
                  <p className="cpro-section-title">Saved Addresses</p>
                  <p className="cpro-section-sub">{addresses.length} locations saved</p>
                </div>
              </div>
              <ChevronRight
                size={18}
                color="#94a3b8"
                style={{
                  transition: 'transform 0.2s',
                  transform: expandedSection === 'address' ? 'rotate(90deg)' : 'none'
                }}
              />
            </div>
            {expandedSection === 'address' && (
              <div className="cpro-expand-content">
                {addresses.length === 0 ? (
                  <p className="cpro-empty-info">No addresses saved yet</p>
                ) : (
                  addresses.map(addr => (
                    <div key={addr.id} className="cpro-address-card">
                      <div className="cpro-addr-icon-wrap" style={{ color: 'var(--primary)' }}>
                        <MapPin size={20} />
                      </div>
                      <div className="cpro-addr-info">
                        <p className="cpro-addr-label">{addr.label}</p>
                        <p className="cpro-addr-text">{addr.address}</p>
                      </div>
                      <button className="cpro-addr-del">
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    </div>
                  ))
                )}
                {showAddAddress ? (
                  <div className="cpro-add-form" style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginTop: '12px' }}>
                    <input 
                      type="text" 
                      className="form-control mb-2" 
                      placeholder="Label (e.g. Home, Work)" 
                      value={newAddress.label}
                      onChange={e => setNewAddress({...newAddress, label: e.target.value})}
                    />
                    <textarea 
                      className="form-control mb-2" 
                      rows="2" 
                      placeholder="Full Address" 
                      value={newAddress.address}
                      onChange={e => setNewAddress({...newAddress, address: e.target.value})}
                    />
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-primary flex-grow-1" onClick={handleAddAddress}>Save Address</button>
                      <button className="btn btn-sm btn-light" onClick={() => setShowAddAddress(false)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button className="cpro-add-addr" onClick={() => setShowAddAddress(true)}>
                    <Plus size={16} /> Add New Address
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div className="cpro-section">
            <div
              className="cpro-section-header"
              onClick={() => setExpandedSection(expandedSection === 'payment' ? null : 'payment')}
            >
              <div className="cpro-section-left">
                <div className="cpro-section-icon" style={{ background: '#EFF6FF' }}>
                  <CreditCard size={18} color="#3b82f6" />
                </div>
                <div>
                  <p className="cpro-section-title">Payment Methods</p>
                  <p className="cpro-section-sub">{paymentMethods.length} methods linked</p>
                </div>
              </div>
              <ChevronRight
                size={18}
                color="#94a3b8"
                style={{
                  transition: 'transform 0.2s',
                  transform: expandedSection === 'payment' ? 'rotate(90deg)' : 'none'
                }}
              />
            </div>
            {expandedSection === 'payment' && (
              <div className="cpro-expand-content">
                {paymentMethods.length === 0 ? (
                  <p className="cpro-empty-info">No payment methods linked</p>
                ) : (
                  paymentMethods.map(pm => (
                    <div key={pm.id} className="cpro-payment-card">
                      <div className="cpro-pay-icon-wrap" style={{ color: 'var(--primary)' }}>
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <p className="cpro-pay-type">{pm.type}</p>
                        <p className="cpro-pay-detail">{pm.detail}</p>
                      </div>
                      {pm.is_default && <span className="cpro-pay-default">Default</span>}
                    </div>
                  ))
                )}
                {showAddPayment ? (
                  <div className="cpro-add-form" style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginTop: '12px' }}>
                    <select 
                      className="form-select mb-2" 
                      value={newPayment.type}
                      onChange={e => setNewPayment({...newPayment, type: e.target.value})}
                    >
                      <option>Credit Card</option>
                      <option>Debit Card</option>
                      <option>UPI</option>
                    </select>
                    <input 
                      type="text" 
                      className="form-control mb-2" 
                      placeholder="Details (e.g. **** 1234 or user@upi)" 
                      value={newPayment.detail}
                      onChange={e => setNewPayment({...newPayment, detail: e.target.value})}
                    />
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-primary flex-grow-1" onClick={handleAddPayment}>Save Method</button>
                      <button className="btn btn-sm btn-light" onClick={() => setShowAddPayment(false)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button className="cpro-add-addr" onClick={() => setShowAddPayment(true)}>
                    <Plus size={16} /> Add Payment Method
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Menu Groups */}
          {menuItems.map(group => (
            <div key={group.group} className="cpro-menu-group">
              <p className="cpro-menu-group-label">{group.group}</p>
              {group.items.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className="cpro-menu-item"
                    onClick={() => item.path ? navigate(item.path) : toast.info(`${item.label} coming soon!`)}
                  >
                    <div className="cpro-menu-icon" style={{ background: `${item.color}18` }}>
                      <Icon size={18} color={item.color} />
                    </div>
                    <div className="cpro-menu-text">
                      <span className="cpro-menu-label">{item.label}</span>
                      <span className="cpro-menu-sub">{item.sub}</span>
                    </div>
                    <ChevronRight size={16} color="#cbd5e1" />
                  </button>
                );
              })}
            </div>
          ))}

          {/* Logout */}
          <button
            className="cpro-logout-btn"
            onClick={() => setShowLogoutModal(true)}
          >
            <LogOut size={18} />
            Log Out
          </button>

          <p className="cpro-version">FoodFly v2.1.0 · Made with ❤️</p>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="cpro-modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="cpro-modal" onClick={e => e.stopPropagation()}>
            <div className="cpro-modal-icon-wrap" style={{ color: '#ef4444', marginBottom: '16px' }}>
              <LogOut size={48} />
            </div>
            <h3 className="cpro-modal-title">Logout?</h3>
            <p className="cpro-modal-sub">Are you sure you want to log out of your account?</p>
            <div className="cpro-modal-actions">
              <button className="cpro-modal-cancel" onClick={() => setShowLogoutModal(false)}>
                Cancel
              </button>
              <button className="cpro-modal-confirm" onClick={handleLogout}>
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
};

export default CustomerProfile;
