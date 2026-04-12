import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import { useSocket } from '../context/SocketContext';
import { Download, CheckCircle, Clock, Truck, Package, XCircle, ChevronRight } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [filters, setFilters] = useState({ status: '', startDate: '', endDate: '' });
  const { socket } = useSocket();

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders', { params: filters });
      setOrders(res.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await api.get('/drivers');
      setDrivers(res.data.filter(d => d.is_active));
    } catch { }
  };

  useEffect(() => {
    fetchOrders();
    fetchDrivers();
    if (socket) {
      socket.on('orderStatusUpdate', fetchOrders);
      socket.on('newOrder', fetchOrders);
    }
    return () => {
      if (socket) {
        socket.off('orderStatusUpdate', fetchOrders);
        socket.off('newOrder', fetchOrders);
      }
    };
  }, [socket, filters]);

  const handleStatusChange = async (id, status, driver_id = null) => {
    try {
      await api.put(`/orders/${id}`, { status, driver_id });
      toast.success(`Order #${id} marked as ${status}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#f59e0b'; // Yellow
      case 'Order Accepted': return '#3b82f6'; // Blue
      case 'Out for Delivery': return '#FF6B35'; // Orange
      case 'Delivered': return '#22c55e'; // Green
      case 'Paid': return '#22c55e'; // Green
      case 'Bill Generated': return '#8b5cf6'; // Purple
      case 'Cancelled': return '#ef4444';
      default: return '#64748b';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ fontWeight: '800' }}>Order Management Workflow</h2>
        <div className="badge-soft-success">3 Panels Connected</div>
      </div>

      <div className="card table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Order ID / Customer</th>
              <th>Status Timeline</th>
              <th>Workflow Controls</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td>
                  <div style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '1.1rem' }}>#{o.id}</div>
                  <div style={{ fontWeight: '600' }}>{o.customer_name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    ₹{o.total_amount} · {o.payment_method}
                    {o.is_dine_in && (
                        <span className="ms-2 badge bg-primary" style={{ fontSize: '0.7rem' }}>TABLE {o.table_id}</span>
                    )}
                  </div>
                </td>
                <td style={{ minWidth: '320px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', gap: '4px' }}>
                    {['Pending', 'Order Accepted', 'Out for Delivery', 'Delivered'].map((step, idx) => {
                      const isActive = o.status === step || (o.status === 'Delivered');
                      const currentIdx = ['Pending', 'Order Accepted', 'Out for Delivery', 'Delivered'].indexOf(o.status);
                      const isPast = idx <= currentIdx;
                      
                      return (
                        <React.Fragment key={step}>
                          <div 
                            title={step}
                            style={{ 
                              width: '14px', height: '14px', borderRadius: '50%', 
                              backgroundColor: isPast ? getStatusColor(step) : '#e2e8f0',
                              border: o.status === step ? '3px solid white' : 'none',
                              boxShadow: o.status === step ? `0 0 0 2px ${getStatusColor(step)}` : 'none'
                            }} 
                          />
                          {idx < 3 && <div style={{ flex: 1, height: '2px', backgroundColor: idx < currentIdx ? getStatusColor(step) : '#e2e8f0' }} />}
                        </React.Fragment>
                      );
                    })}
                  </div>
                  <div className="d-flex justify-content-between" style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', opacity: 0.6 }}>
                    <span>Placed</span><span>Accepted</span><span>Ship</span><span>Done</span>
                  </div>
                </td>
                <td>
                  <div className="d-flex gap-2 align-items-center">
                    {o.status === 'Pending' ? (
                      <button 
                        className="btn btn-primary btn-sm d-flex align-items-center gap-1" 
                        onClick={() => handleStatusChange(o.id, 'Order Accepted')}
                        style={{ backgroundColor: '#3b82f6', border: 'none', padding: '0.5rem 1rem' }}
                      >
                        <CheckCircle size={14} /> Accept Order
                      </button>
                    ) : o.status === 'Bill Generated' ? (
                      <button 
                        className="btn btn-sm d-flex align-items-center gap-1" 
                        onClick={() => handleStatusChange(o.id, 'Delivered')}
                        style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', fontWeight: '800' }}
                      >
                        <CheckCircle size={14} /> Collect Payment
                      </button>
                    ) : (
                      <span className="badge" style={{ 
                        backgroundColor: `${getStatusColor(o.status)}15`, 
                        color: getStatusColor(o.status),
                        border: `1px solid ${getStatusColor(o.status)}30`,
                        fontWeight: '800',
                        fontSize: '0.8rem'
                      }}>
                        {o.status}
                      </span>
                    )}
                    
                    {o.status !== 'Delivered' && o.status !== 'Cancelled' && (
                        <button 
                          className="btn btn-neutral btn-sm" 
                          onClick={() => handleStatusChange(o.id, 'Cancelled')}
                          style={{ color: '#ef4444' }}
                        >
                          <XCircle size={14} />
                        </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
