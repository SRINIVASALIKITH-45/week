import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CustomerAuthContext } from '../context/CustomerAuthContext';
import { DriverAuthContext } from '../context/DriverAuthContext';
import { AuthContext } from '../context/AuthContext'; // Admin Auth
import { WriterAuthContext } from '../context/WriterAuthContext';
import { KitchenAuthContext } from '../context/KitchenAuthContext';
import { toast } from 'sonner';
import { Truck, User, Lock, Phone, ArrowRight, ChevronRight, ShieldAlert, ChefHat, Flame } from 'lucide-react';

const UnifiedLogin = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // The role is derived from the URL as the single source of truth
    const getRoleFromUrl = () => {
        const params = new URLSearchParams(location.search);
        const urlRole = params.get('role');
        if (urlRole) return urlRole;
        if (location.pathname.includes('driver')) return 'driver';
        if (location.pathname.includes('admin')) return 'admin';
        if (location.pathname.includes('writer')) return 'writer';
        if (location.pathname.includes('kitchen')) return 'kitchen';
        return 'customer';
    };

    const role = getRoleFromUrl();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login: customerLogin, customer } = useContext(CustomerAuthContext);
    const { login: driverLogin, driver } = useContext(DriverAuthContext);
    const { login: adminLogin, user: adminUser } = useContext(AuthContext);
    const { login: writerLogin, writer } = useContext(WriterAuthContext);
    const { login: kitchenLogin, kitchenUser } = useContext(KitchenAuthContext);
    
    // Function to switch roles via URL
    const switchRole = (newRole) => {
        setIdentifier('');
        setPassword('');
        navigate(`/login?role=${newRole}`);
    };

    // Auto-redirect if already logged in for that role
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const urlRole = params.get('role');

        // Logic: Only auto-redirect if:
        // 1. A session exists for a role
        // 2. We are on the login page without a specific ?role query OR the query matches the session
        // 3. We aren't logging out
        
        const isLogout = location.search.includes('logout=true');

        if (customer && !isLogout && (!urlRole || urlRole === 'customer')) {
            navigate('/customer/home');
        } else if (driver && !isLogout && urlRole === 'driver') {
            navigate('/driver/home');
        } else if (adminUser && !isLogout && urlRole === 'admin') {
            navigate('/dashboard');
        } else if (writer && !isLogout && urlRole === 'writer') {
            navigate('/writer/home');
        } else if (kitchenUser && !isLogout && urlRole === 'kitchen') {
            navigate('/kitchen');
        }
    }, [customer, driver, adminUser, writer, kitchenUser, role, navigate, location.search]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Helper to clear other sessions to prevent header pollution
        const clearOtherSessions = () => {
            const currentRole = role;
            if (currentRole !== 'admin') localStorage.removeItem('token');
            if (currentRole !== 'customer') {
                localStorage.removeItem('customerToken');
                localStorage.removeItem('customerUser');
            }
            if (currentRole !== 'driver') localStorage.removeItem('driverToken');
            if (currentRole !== 'writer') localStorage.removeItem('writerToken');
            if (currentRole !== 'kitchen') {
                localStorage.removeItem('kitchenToken');
                localStorage.removeItem('kitchenUser');
            }
        };

        try {
            if (role === 'customer') {
                clearOtherSessions();
                await customerLogin(identifier, password);
                toast.success('Welcome back, Customer!');
                navigate('/customer/home');
            } else if (role === 'driver') {
                clearOtherSessions();
                await driverLogin(identifier, password);
                toast.success('Drive safe, Partner!');
                navigate('/driver/home');
            } else if (role === 'writer') {
                clearOtherSessions();
                await writerLogin(identifier, password);
                toast.success('Ready to serve, Captain!');
                navigate('/writer/home');
            } else if (role === 'kitchen') {
                clearOtherSessions();
                await kitchenLogin(identifier, password);
                toast.success('Kitchen station active!');
                navigate('/kitchen');
            } else {
                clearOtherSessions();
                await adminLogin(identifier, password);
                toast.success('Admin access granted!');
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed. Please check credentials.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1.5rem',
            backgroundColor: 'var(--bg-color)',
            fontFamily: "'Outfit', sans-serif"
        }}>
            <div className="card glass animate-fade-in" style={{
                width: '100%',
                maxWidth: '460px',
                padding: '2.5rem',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-lg)'
            }}>
                {/* Brand Header */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ 
                        display: 'inline-flex', 
                        padding: '1rem', 
                        backgroundColor: 'var(--primary)', 
                        borderRadius: '16px', 
                        color: 'white',
                        marginBottom: '1rem',
                        boxShadow: '0 8px 16px rgba(79, 70, 229, 0.2)'
                    }}>
                        <Truck size={32} strokeWidth={2.5} />
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Tirupati Hubspot</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Centralized Access Portal</p>
                </div>

                {/* Role Switcher - 3 Options */}
                <div style={{
                    display: 'flex',
                    backgroundColor: 'rgba(0,0,0,0.03)',
                    padding: '4px',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '2rem',
                    border: '1px solid var(--border-color)'
                }}>
                    <button 
                        onClick={() => switchRole('customer')}
                        style={{
                            flex: 1,
                            padding: '0.8rem 0.4rem',
                            borderRadius: '10px',
                            border: 'none',
                            backgroundColor: role === 'customer' ? 'var(--surface-color)' : 'transparent',
                            color: role === 'customer' ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: role === 'customer' ? 'var(--shadow-sm)' : 'none',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                        }}
                    >
                        <User size={18} /> Customer
                    </button>
                    <button 
                        onClick={() => switchRole('driver')}
                        style={{
                            flex: 1,
                            padding: '0.8rem 0.4rem',
                            borderRadius: '10px',
                            border: 'none',
                            backgroundColor: role === 'driver' ? 'var(--surface-color)' : 'transparent',
                            color: role === 'driver' ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: role === 'driver' ? 'var(--shadow-sm)' : 'none',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                        }}
                    >
                        <Truck size={18} /> Partner
                    </button>
                    <button 
                        onClick={() => switchRole('writer')}
                        style={{
                            flex: 1,
                            padding: '0.8rem 0.4rem',
                            borderRadius: '10px',
                            border: 'none',
                            backgroundColor: role === 'writer' ? 'var(--surface-color)' : 'transparent',
                            color: role === 'writer' ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: role === 'writer' ? 'var(--shadow-sm)' : 'none',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                        }}
                    >
                        <ChefHat size={18} /> Captain
                    </button>
                    <button 
                        onClick={() => switchRole('kitchen')}
                        style={{
                            flex: 1,
                            padding: '0.8rem 0.4rem',
                            borderRadius: '10px',
                            border: 'none',
                            backgroundColor: role === 'kitchen' ? 'var(--surface-color)' : 'transparent',
                            color: role === 'kitchen' ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: role === 'kitchen' ? 'var(--shadow-sm)' : 'none',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                        }}
                    >
                        <Flame size={18} /> Kitchen
                    </button>
                    <button 
                        onClick={() => switchRole('admin')}
                        style={{
                            flex: 1,
                            padding: '0.8rem 0.4rem',
                            borderRadius: '10px',
                            border: 'none',
                            backgroundColor: role === 'admin' ? 'var(--surface-color)' : 'transparent',
                            color: role === 'admin' ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: role === 'admin' ? 'var(--shadow-sm)' : 'none',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                        }}
                    >
                        <ShieldAlert size={18} /> Admin
                    </button>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="form-group mb-4">
                        <label className="form-label">{role === 'admin' ? 'Username' : 'Phone Number'}</label>
                        <div style={{ position: 'relative' }}>
                            {role !== 'admin' ? (
                                <>
                                    <div style={{ 
                                        position: 'absolute', 
                                        left: '1rem', 
                                        top: '50%', 
                                        transform: 'translateY(-50%)', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '0.5rem',
                                        color: 'var(--text-secondary)',
                                        fontSize: '0.9rem',
                                        borderRight: '1px solid var(--border-color)',
                                        paddingRight: '0.5rem'
                                    }}>
                                        <Phone size={16} />
                                        <span style={{ fontWeight: '600' }}>+91</span>
                                    </div>
                                    <input 
                                        type="tel" 
                                        className="form-control" 
                                        placeholder="Enter mobile number" 
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        style={{ paddingLeft: '5.2rem' }}
                                        required 
                                    />
                                </>
                            ) : (
                                <>
                                    <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                                        <User size={18} />
                                    </div>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="Enter admin username" 
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        style={{ paddingLeft: '2.8rem' }}
                                        required 
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    <div className="form-group mb-4">
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                                <Lock size={18} />
                            </div>
                            <input 
                                type="password" 
                                className="form-control" 
                                placeholder="Enter secure password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ paddingLeft: '2.8rem' }}
                                required 
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="btn btn-primary" 
                        style={{ 
                            width: '100%', 
                            height: '3.8rem', 
                            fontSize: '1.1rem',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '1rem'
                        }}
                    >
                        {isSubmitting ? 'Verifying...' : (
                            <>
                                Sign In as {role === 'admin' ? 'Manager' : role === 'customer' ? 'Customer' : role === 'writer' ? 'Captain' : role === 'kitchen' ? 'Kitchen Staff' : 'Partner'} <ChevronRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                {role === 'customer' && (
                    <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Don't have an account? <span onClick={() => navigate('/customer-register')} style={{ color: 'var(--primary)', fontWeight: '700', cursor: 'pointer' }}>Create Profile</span>
                    </p>
                )}
                
                {role !== 'customer' && (
                    <div style={{ 
                        marginTop: '2rem', 
                        padding: '1rem', 
                        backgroundColor: 'var(--primary-light)', 
                        borderRadius: '12px',
                        border: '1px dashed var(--primary)',
                        textAlign: 'center'
                    }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '500' }}>
                            {role === 'admin' 
                                ? 'System administrators can manage all aspects of the delivery platform from here.' 
                                : 'Partner registration is managed via the admin panel. Contact your manager for access.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UnifiedLogin;
