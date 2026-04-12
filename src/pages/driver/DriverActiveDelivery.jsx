import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import DriverLayout from '../../components/driver/DriverLayout';
import { useSocket } from '../../context/SocketContext';
import { DriverAuthContext } from '../../context/DriverAuthContext';
import { MapPin, Navigation, Phone, CheckCircle2, ChevronRight, PackageOpen, Info, ShieldCheck, Timer } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';
import './DriverActiveDelivery.css';

const DriverActiveDelivery = () => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [otp, setOtp] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes timer
    const { driver } = useContext(DriverAuthContext);
    const { socket } = useSocket();
    const navigate = useNavigate();

    const fetchActiveDelivery = async () => {
        try {
            const res = await api.get('/driver-auth/deliveries?filter=active');
            if (res.data) {
                setOrder(res.data);
                // Calculate time left if OTP expiry exists
                if (res.data.otp_expiry) {
                    const expiry = new Date(res.data.otp_expiry).getTime();
                    const now = new Date().getTime();
                    const diff = Math.max(0, Math.floor((expiry - now) / 1000));
                    setTimeLeft(diff);
                }
            } else {
                setOrder(null);
            }
        } catch (error) {
            console.error('Failed to fetch active delivery:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActiveDelivery();
    }, []);

    // Timer logic
    useEffect(() => {
        if (!order || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [order, timeLeft]);

    const handleArrived = async () => {
        try {
            await api.post(`/driver-auth/orders/${order.id}/arrived`);
            toast.success('Arrival marked! Ask customer for OTP.');
            fetchActiveDelivery();
        } catch (error) {
            toast.error('Failed to mark arrival');
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            return toast.error('Please enter a valid 6-digit OTP');
        }
        setIsVerifying(true);
        try {
            const res = await api.post(`/driver-auth/orders/${order.id}/verify-otp`, { otp });
            toast.success(`Success! You earned ₹${res.data.earned} commission.`);
            
            // Trigger success state then navigate
            setTimeout(() => {
                navigate('/driver/home');
            }, 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Verification failed');
        } finally {
            setIsVerifying(false);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (loading) return (
        <DriverLayout>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="cp-spinner"></div>
            </div>
        </DriverLayout>
    );

    if (!order) return (
        <DriverLayout>
            <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <div style={{ 
                    width: '100px', height: '100px', 
                    backgroundColor: 'var(--primary-light)', 
                    borderRadius: '50%', display: 'flex', 
                    justifyContent: 'center', alignItems: 'center', 
                    margin: '0 auto 2rem', color: 'var(--primary)'
                }}>
                    <PackageOpen size={48} />
                </div>
                <h2 style={{ fontWeight: '800', marginBottom: '1rem' }}>No Active Deliveries</h2>
                <button className="cp-btn-primary" onClick={() => navigate('/driver/home')}>Explore Orders</button>
            </div>
        </DriverLayout>
    );

    return (
        <DriverLayout>
            <div className="cp-page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <span className="badge-soft-primary" style={{ marginBottom: '0.5rem' }}>Active Shipment</span>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>#{order.order_id_string || order.id}</h2>
                    </div>
                    <div className="badge-soft-warning">
                        {order.status}
                    </div>
                </div>
            </div>

            <div className="driver-container px-4" style={{ marginTop: '-20px', padding: '0 1rem', paddingBottom: '120px' }}>
                <div className="card glass animate-fade-in" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                        <div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '700' }}>CUSTOMER</p>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>{order.customer_name}</h3>
                        </div>
                        <a href={`tel:${order.customer_phone}`} className="call-btn">
                            <Phone size={20} />
                        </a>
                    </div>

                    <div className="delivery-step active">
                        <div className="step-icon"><div className="dot"></div></div>
                        <div className="step-content">
                            <span className="step-label">Pickup Point</span>
                            <p className="step-address">Restaurant Location</p>
                        </div>
                    </div>

                    <div className="delivery-step">
                        <div className="step-icon"><MapPin size={18} /></div>
                        <div className="step-content">
                            <span className="step-label">Delivery Address</span>
                            <p className="step-address">{order.delivery_address}</p>
                            <button className="nav-link-btn" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.delivery_address)}`, '_blank')}>
                                <Navigation size={14} /> Open Maps
                            </button>
                        </div>
                    </div>
                </div>

                {/* OTP Verification Section - Shows after Arrival */}
                {order.is_arrived ? (
                    <div className="card animate-fade-in" style={{ 
                        border: '2px solid var(--primary)', 
                        background: 'var(--primary-light)',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                                <ShieldCheck size={20} />
                                <h4 style={{ fontWeight: '800', margin: 0 }}>Verify OTP</h4>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: '700', color: timeLeft < 60 ? '#ef4444' : 'var(--text-secondary)' }}>
                                <Timer size={16} /> {formatTime(timeLeft)}
                            </div>
                        </div>
                        
                        <p style={{ fontSize: '0.85rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Enter the 6-digit code provided by the customer to complete delivery.</p>
                        
                        <div className="otp-container">
                            <input 
                                type="text" 
                                className="otp-input"
                                maxLength="6"
                                placeholder="0 0 0 0 0 0"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            />
                        </div>
                        
                        <button 
                            className="cp-btn-primary" 
                            style={{ width: '100%', marginTop: '1rem' }}
                            onClick={handleVerifyOtp}
                            disabled={isVerifying || otp.length < 6 || timeLeft <= 0}
                        >
                            {isVerifying ? 'Verifying...' : 'Validate & Complete'}
                        </button>
                    </div>
                ) : (
                    <div className="card" style={{ marginBottom: '1.5rem', textAlign: 'center', padding: '2rem' }}>
                        <div className="arrival-icon-wrapper">
                            <MapPin size={32} />
                        </div>
                        <h4 style={{ fontWeight: '800', marginTop: '1rem' }}>At the destination?</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Mark your arrival to unlock the OTP verification step.</p>
                        <button className="cp-btn-primary" onClick={handleArrived}>
                            I have Arrived
                        </button>
                    </div>
                )}

                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Info size={18} className="text-secondary" />
                        <h4 style={{ fontWeight: '800' }}>Billing Summary</h4>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Payment Method</span>
                            <span style={{ fontWeight: '700' }}>{order.payment_method} (COD)</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)' }}>
                            <span style={{ fontWeight: '800' }}>Collect from Customer</span>
                            <span style={{ fontWeight: '900', color: 'var(--primary)', fontSize: '1.1rem' }}>₹{order.total_amount}</span>
                        </div>
                    </div>
                </div>
            </div>
        </DriverLayout>
    );
};

export default DriverActiveDelivery;
