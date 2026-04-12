import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import CustomerLayout from '../components/CustomerLayout';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Clock, CheckCircle, Truck, XCircle, ChevronLeft } from 'lucide-react';

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/my-orders'); 
      setOrders(res.data || []);
    } catch (error) {
      toast.error('Failed to fetch your orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || '';
    switch (s) {
      case 'pending': return '#f59e0b';
      case 'preparing': return '#3b82f6';
      case 'out_for_delivery': return '#6366f1';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <Clock size={16} />;
      case 'preparing': return <ShoppingBag size={16} />;
      case 'out_for_delivery': return <Truck size={16} />;
      case 'delivered': return <CheckCircle size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <div className="cp-spinner" />
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div style={{ padding: '1rem', minHeight: '100vh', backgroundColor: '#fdfdfd', paddingBottom: '100px' }}>
        <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/customer/home')} style={{ background: 'none', border: 'none', padding: 0 }}>
             <ChevronLeft size={24} color="var(--secondary)" />
          </button>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', fontFamily: "'Outfit', sans-serif", margin: 0 }}>Your Orders</h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>Track your recent and past deliveries.</p>
          </div>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
          {orders.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
              <ShoppingBag size={48} color="#ccc" style={{ marginBottom: '1rem' }} />
              <h3>No orders found</h3>
              <p style={{ color: 'var(--text-secondary)' }}>You haven't placed any orders yet.</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="card animate-fade-in" style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderLeft: `5px solid ${getStatusColor(order.status)}`,
                fontFamily: "'Outfit', sans-serif"
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>Order #{order.id}</span>
                    <span style={{ 
                      padding: '0.2rem 0.8rem', borderRadius: '50px', 
                      backgroundColor: `${getStatusColor(order.status)}20`,
                      color: getStatusColor(order.status),
                      fontSize: '0.8rem', fontWeight: '700',
                      display: 'flex', alignItems: 'center', gap: '0.4rem'
                    }}>
                      {getStatusIcon(order.status)} {order.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                  </p>
                  <p style={{ fontSize: '0.95rem', fontWeight: '500', marginTop: '0.5rem' }}>
                    Delivering to: <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>{order.delivery_address}</span>
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Total Amount</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>₹{order.total_amount}</p>
                  <button className="btn btn-outline" style={{ marginTop: '0.5rem', padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CustomerOrders;
