import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DriverLayout from '../../components/driver/DriverLayout';
import { DriverAuthContext } from '../../context/DriverAuthContext';
import { useSocket } from '../../context/SocketContext';
import { MapPin, Navigation, Clock, CreditCard, Power, ChevronRight, Hash } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';
import './DriverHome.css';

const DriverHome = () => {
    const { driver, updateDriverStatus } = useContext(DriverAuthContext);
    const { socket } = useSocket();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAvailableOrders = useCallback(async () => {
        try {
            const res = await api.get('/driver-auth/orders/available');
            
            // Check if backend returned empty due to busy state
            const activeRes = await api.get('/driver-auth/deliveries?filter=active');
            if (activeRes.data && activeRes.data.length > 0) {
                navigate('/driver/active-delivery');
                return;
            }
            
            setOrders(res.data);
        } catch (error) {
            console.error('Failed to fetch available orders:', error);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        if (!driver) return;
        fetchAvailableOrders();

        if (socket) {
            socket.on('availableOrder', (data) => {
                toast('New Delivery Request!', { 
                    icon: '🚨',
                    description: 'A new order is available for pickup.',
                });
                fetchAvailableOrders();
            });

            socket.on('orderAccepted', (data) => {
                setOrders(prev => prev.filter(o => o.id !== data.id));
            });
        }

        return () => {
            if (socket) {
                socket.off('availableOrder');
                socket.off('orderAccepted');
            }
        };
    }, [socket, driver, fetchAvailableOrders]);

    const toggleStatus = async () => {
        try {
            const res = await api.post('/driver-auth/status/toggle');
            updateDriverStatus(res.data.is_active);
            toast.success(`You are now ${res.data.is_active ? 'Online' : 'Offline'}`);
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const handleAcceptOrder = async (orderId) => {
        try {
            await api.post(`/driver-auth/orders/${orderId}/accept`);
            toast.success('Order Accepted! Proceed to pickup.');
            navigate('/driver/active-delivery');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to accept order');
            fetchAvailableOrders();
        }
    };

    return (
        <DriverLayout>
            {/* Premium Page Header - Synced with Customer UI */}
            <div className="cp-page-header" style={{ paddingBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '4px' }}>Hi, {driver?.name?.split(' ')[0]}</h1>
                        <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>{driver?.is_active ? 'You are currently accepting orders' : 'Go online to start earning'}</p>
                    </div>
                    <button 
                        className={`status-chip ${driver?.is_active ? 'online' : 'offline'}`}
                        onClick={toggleStatus}
                    >
                        <Power size={14} />
                        {driver?.is_active ? 'Online' : 'Offline'}
                    </button>
                </div>
            </div>

            <div className="driver-container px-4" style={{ marginTop: '-20px', padding: '0 1rem' }}>
                {!driver?.is_active ? (
                    <div className="card glass animate-fade-in" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                        <div style={{ 
                            width: '80px', height: '80px', 
                            backgroundColor: 'var(--primary-light)', 
                            borderRadius: '50%', display: 'flex', 
                            justifyContent: 'center', alignItems: 'center', 
                            margin: '0 auto 1.5rem', color: 'var(--primary)'
                        }}>
                            <Power size={40} />
                        </div>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.5rem' }}>Account Offline</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Toggle the switch above to start receiving delivery requests.</p>
                        <button className="cp-btn-primary" onClick={toggleStatus}>Go Online Now</button>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', marginTop: '1rem' }}>
                            <h2 className="cp-section-title">Available Requests</h2>
                            <span className="badge-soft-primary" style={{ padding: '0.4rem 1rem', borderRadius: '12px', fontWeight: '800' }}>
                                {orders.length} ACTIVE
                            </span>
                        </div>

                        {loading ? (
                            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                <div className="cp-spinner" style={{ margin: '0 auto' }}></div>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', background: 'transparent', border: '2px dashed var(--border-color)', boxShadow: 'none' }}>
                                <div className="radar-ping"></div>
                                <h4 style={{ fontWeight: '800', marginTop: '1rem' }}>Scanning for orders...</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>We'll notify you as soon as a request comes in.</p>
                            </div>
                        ) : (
                            <div className="orders-feed">
                                {orders.map(order => (
                                    <div key={order.id} className="food-card animate-fade-in" style={{ padding: '1.5rem', flexDirection: 'column', gap: '1.25rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div className="badge-soft-info" style={{ gap: '0.4rem' }}>
                                                <Hash size={12} /> {order.order_id_string || order.id}
                                            </div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--primary)' }}>₹{order.total_amount}</div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></div>
                                                <div style={{ width: '2px', flex: 1, backgroundColor: 'var(--border-color)', margin: '4px 0' }}></div>
                                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid var(--primary)', backgroundColor: 'white' }}></div>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ marginBottom: '1rem' }}>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Pickup</span>
                                                    <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>Restaurant Location</p>
                                                </div>
                                                <div>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Drop-off</span>
                                                    <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{order.delivery_address}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: '12px', fontSize: '0.85rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                                                <CreditCard size={16} /> {order.payment_method}
                                            </div>
                                            <div style={{ color: '#ef4444', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Clock size={16} /> Urgent
                                            </div>
                                        </div>

                                        <button 
                                            className="cp-btn-primary"
                                            onClick={() => handleAcceptOrder(order.id)}
                                            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                                        >
                                            Accept Delivery <ChevronRight size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </DriverLayout>
    );
};

export default DriverHome;
