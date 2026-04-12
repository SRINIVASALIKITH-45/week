import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Phone, MessageCircle, MapPin,
  CheckCircle2, Clock, Package, Truck, Star, RefreshCw, ShieldCheck
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { CustomerAuthContext } from '../../context/CustomerAuthContext';
import CustomerLayout from '../../components/CustomerLayout';
import api from '../../services/api';
import './CustomerOrderTracking.css';

const ORDER_STATUSES = [
  { key: 'Pending',         label: 'Order Placed',       icon: '🟡', desc: 'Your order has been received' },
  { key: 'Order Accepted',  label: 'Order Accepted',     icon: '🔵', desc: 'Restaurant is preparing your food' },
  { key: 'Out for Delivery', label: 'Out for Delivery', icon: '🟠', desc: 'Rider is on the way' },
  { key: 'Delivered',       label: 'Delivered',         icon: '🟢', desc: 'Enjoy your meal!' },
];

const STATUS_INDEX = {
  'Pending': 0, 
  'Order Accepted': 1, 
  'Out for Delivery': 2, 
  'Delivered': 3
};

const CustomerOrderTracking = () => {
  const navigate = useNavigate();
  const { bulkAddToCart } = useCart();
  const { customer } = useContext(CustomerAuthContext);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rated, setRated] = useState({});
  const [hoverRating, setHoverRating] = useState({});

  const fetchOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.get('/orders/my-orders');
      // Normalize statuses that might be legacy
      const normalized = (res.data || []).map(o => {
          let s = o.status;
          if (s === 'pending') s = 'Pending';
          if (s === 'preparing' || s === 'Preparing') s = 'Order Accepted';
          if (s === 'out_for_delivery') s = 'Out for Delivery';
          if (s === 'delivered') s = 'Delivered';
          return { ...o, status: s };
      });
      const sorted = normalized.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setOrders(sorted);
      if (!selectedOrder && sorted.length > 0) setSelectedOrder(sorted[0]);
      else if (selectedOrder) {
        const updated = sorted.find(o => o.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(true), 15000); 
    return () => clearInterval(interval);
  }, []);

  const currentStatusIndex = selectedOrder
    ? (STATUS_INDEX[selectedOrder.status] ?? 0)
    : 0;

  const getStatusColor = (status) => {
    const map = {
      'Pending': '#f59e0b', // Yellow
      'Order Accepted': '#3b82f6', // Blue
      'Out for Delivery': '#FF6B35', // Orange
      'Delivered': '#22c55e', // Green
      'Cancelled': '#ef4444'
    };
    return map[status] || '#94a3b8';
  };

  const getETA = (status) => {
    const map = {
      'Pending': '~35 min', 
      'Order Accepted': '~25 min',
      'Out for Delivery': '~10 min',
      'Delivered': 'Delivered', 
      'Cancelled': 'Cancelled'
    };
    return map[status] || '--';
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  if (loading) return <CustomerLayout><div className="cot-loading"><div className="cp-spinner" /></div></CustomerLayout>;

  return (
    <CustomerLayout>
      <div className="cot-container">
        {/* Header */}
        <div className="cot-header">
          <button className="cl-back-btn" onClick={() => navigate('/customer/home')}>
            <ChevronLeft size={22} />
          </button>
          <h1 className="cot-title">Order Tracking</h1>
          <button className={`cot-refresh-btn ${refreshing ? 'spinning' : ''}`} onClick={() => fetchOrders(true)}>
            <RefreshCw size={18} />
          </button>
        </div>

        {selectedOrder && !['Delivered', 'Cancelled'].includes(selectedOrder.status) && (
          <div className="cot-active-card animate-fade-in">
            <div className="cot-status-hero" style={{ background: getStatusColor(selectedOrder.status) }}>
              <div className="cot-status-emoji">{ORDER_STATUSES[currentStatusIndex]?.icon || '📦'}</div>
              <div className="cot-status-info">
                <h2 className="cot-status-label">{ORDER_STATUSES[currentStatusIndex]?.label}</h2>
                <div className="cot-eta-chip"><Clock size={13} /> ETA: {getETA(selectedOrder.status)}</div>
              </div>
            </div>

            <div className="cot-order-meta">
              <span className="cot-order-id">#{selectedOrder.order_id_string || selectedOrder.id}</span>
              <span className="cot-order-time">{formatTime(selectedOrder.created_at)}</span>
            </div>

            {/* OTP Verification Display */}
            {selectedOrder.status === 'Out for Delivery' && (
              <div className="cot-otp-highlight">
                <div className="otp-header"><ShieldCheck size={16} /> DELIVERY OTP</div>
                <div className="otp-value">{selectedOrder.delivery_otp || '------'}</div>
                <p className="otp-hint">Share this code with your rider upon arrival</p>
              </div>
            )}

            <div className="cot-stepper">
              {ORDER_STATUSES.map((step, i) => (
                <div key={step.key} className="cot-step-wrap">
                  <div className={`cot-step ${i <= currentStatusIndex ? 'done' : ''}`}>
                    <div className="cot-step-icon">{i < currentStatusIndex ? <CheckCircle2 size={16} /> : step.icon}</div>
                    <span className="cot-step-label">{step.label}</span>
                  </div>
                  {i < ORDER_STATUSES.length - 1 && <div className={`cot-step-line ${i < currentStatusIndex ? 'done' : ''}`} />}
                </div>
              ))}
            </div>

            {selectedOrder.driver && (
              <div className="cot-driver-card">
                <div className="cot-driver-avatar">{selectedOrder.driver.name?.[0]}</div>
                <div className="cot-driver-info">
                  <p className="cot-driver-name">{selectedOrder.driver.name}</p>
                  <p className="cot-driver-label">Your Delivery Partner</p>
                </div>
                <a href={`tel:${selectedOrder.driver.phone}`} className="cot-contact-btn call"><Phone size={18} /></a>
              </div>
            )}
          </div>
        )}

        <div className="cot-history">
          <p className="cot-history-title">Recent Orders</p>
          {orders.map(order => (
            <div key={order.id} className={`cot-order-card ${selectedOrder?.id === order.id ? 'selected' : ''}`} onClick={() => setSelectedOrder(order)}>
              <div className="cot-order-card-left">
                <div className="cot-order-status-dot" style={{ background: getStatusColor(order.status) }} />
                <div>
                  <p className="cot-order-card-id">Order #{order.order_id_string || order.id}</p>
                  <p className="cot-order-card-time">{formatDate(order.created_at)} · ₹{order.total_price}</p>
                </div>
              </div>
              <span className="cot-order-status-badge" style={{ color: getStatusColor(order.status), background: `${getStatusColor(order.status)}15` }}>
                {order.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CustomerOrderTracking;
