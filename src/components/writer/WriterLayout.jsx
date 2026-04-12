import React, { useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { WriterAuthContext } from '../../context/WriterAuthContext';
import { LogOut, Home, ShoppingCart, User, ClipboardList, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import '../../pages/writer/WriterStyles.css';

const WriterLayout = () => {
    const { writer, logout } = useContext(WriterAuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Tables', path: '/writer/home', icon: <Home size={22} /> },
        { name: 'Orders', path: '/writer/kots', icon: <ClipboardList size={22} /> },
        { name: 'Account', path: '/writer/profile', icon: <User size={22} /> },
    ];

    return (
        <div className="writer-layout-wrapper">
            <div className="writer-container">
                {/* Super UI Header */}
                <header style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    padding: '0.75rem 1.25rem',
                    borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <motion.div 
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate('/writer/home')}
                            style={{ 
                                width: '40px', height: '40px', 
                                background: 'linear-gradient(135deg, #4f46e5, #3b82f6)',
                                borderRadius: '12px',
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                color: 'white', fontWeight: 'bold',
                                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)'
                            }}
                        >
                            <Zap size={20} fill="white" />
                        </motion.div>
                        <div>
                            <span style={{ fontWeight: '800', fontSize: '1rem', color: '#1e293b', display: 'block', lineHeight: 1.2 }}>Captain Panel</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: writer?.is_on_duty ? '#10b981' : '#f59e0b' }} />
                                <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {writer?.is_on_duty ? 'On Duty' : 'Off Duty'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleLogout}
                        style={{ 
                            border: 'none', background: '#fee2e2', color: '#ef4444',
                            padding: '0.6rem', borderRadius: '12px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                    >
                        <LogOut size={18} />
                    </button>
                </header>

                {/* Main Content Area */}
                <main style={{ minHeight: '100vh' }}>
                    <Outlet />
                </main>

                {/* Premium Bottom Navigation */}
                <nav style={{
                    position: 'fixed',
                    bottom: '1rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 'calc(100% - 2rem)',
                    maxWidth: '448px', // Restricted width for bottom nav
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '24px',
                    display: 'flex',
                    justifyContent: 'space-around',
                    padding: '0.75rem 0.5rem',
                    zIndex: 1000,
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '4px',
                                    color: isActive ? '#f97316' : '#94a3b8',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    flex: 1,
                                    position: 'relative'
                                }}
                            >
                                <motion.div 
                                    animate={{ 
                                        scale: isActive ? 1.1 : 1,
                                        y: isActive ? -2 : 0 
                                    }}
                                    style={{ 
                                        color: isActive ? '#f97316' : '#94a3b8',
                                    }}
                                >
                                    {item.icon}
                                </motion.div>
                                <span style={{ 
                                    fontSize: '0.65rem', 
                                    fontWeight: isActive ? '800' : '600',
                                    letterSpacing: '0.2px'
                                }}>{item.name}</span>
                                
                                {isActive && (
                                    <motion.div 
                                        layoutId="navIndicator"
                                        style={{
                                            position: 'absolute',
                                            top: '-12px',
                                            width: '4px',
                                            height: '4px',
                                            borderRadius: '50%',
                                            backgroundColor: '#f97316',
                                            boxShadow: '0 0 10px #f97316'
                                        }}
                                    />
                                )}
                            </button>
                        )
                    })}
                </nav>
            </div>
        </div>
    );
};

export default WriterLayout;
