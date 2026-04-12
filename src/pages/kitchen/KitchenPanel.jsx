import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../context/SocketContext';
import { KitchenAuthContext } from '../../context/KitchenAuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './KitchenMobile.css';
import { 
    ChefHat, Clock, Volume2, VolumeX, 
    RefreshCw, LogOut, Printer, 
    Play, CheckCircle, User,
    BellRing, CheckCircle2, LayoutDashboard, Zap,
    History, Settings, Home, ClipboardList
} from 'lucide-react';
import { toast } from 'sonner';

/* ─── Sound Engine ──────────────────────────────────────── */
const playBeep = () => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
};

/* ─── Main Kitchen Dashboard ────────────────────────────── */
const KitchenPanel = () => {
    const { socket } = useSocket();
    const { kitchenUser, logout } = useContext(KitchenAuthContext);
    const navigate = useNavigate();
    
    const [kots, setKots] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [activeTab, setActiveTab] = useState('orders');
    const [isPrinting, setIsPrinting] = useState(null);

    const fetchKOTs = useCallback(async () => {
        try {
            const res = await api.get('/kots/active');
            setKots(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            toast.error('Sync failed');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchKOTs();
        if (socket) {
            socket.on('newKOT', (newKOT) => {
                setKots(prev => [newKOT, ...prev]);
                if (soundEnabled) playBeep();
            });
            socket.on('kotStatusUpdate', ({ id, status }) => {
                setKots(prev => {
                    if (status === 'Served') return prev.filter(k => k.id !== parseInt(id));
                    return prev.map(k => k.id === parseInt(id) ? { ...k, status } : k);
                });
            });
        }
        return () => {
            if (socket) { socket.off('newKOT'); socket.off('kotStatusUpdate'); }
        };
    }, [socket, fetchKOTs, soundEnabled]);

    const stats = useMemo(() => ({
        pending: kots.filter(k => k.status === 'Pending').length,
        cooking: kots.filter(k => k.status === 'Preparing').length,
        ready: kots.filter(k => k.status === 'Ready').length
    }), [kots]);

    const filteredKots = useMemo(() => {
        let list = kots;
        if (filter !== 'ALL') list = list.filter(k => k.status === filter);
        return list.sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
    }, [kots, filter]);

    return (
        <div className="km-app-shell">
            <div className="km-mobile-wrapper">
                {/* Navbar */}
                <nav className="km-navbar">
                    <div className="km-nav-brand">
                        <div className="km-nav-icon">
                            <ChefHat size={20} strokeWidth={2.5} />
                        </div>
                        <h2 className="km-nav-title">STATION MASTER</h2>
                    </div>
                    <button 
                        onClick={() => { logout(); navigate('/login?role=kitchen'); }}
                        className="km-nav-logout"
                    >
                        <LogOut size={18} />
                    </button>
                </nav>

                {/* Hero Section */}
                <section className="km-hero-section">
                    <div className="km-hero-card">
                        <div className="km-profile-row">
                            <div className="km-chef-info">
                                <div className="km-chef-avatar">
                                    <User size={24} color="white" opacity={0.8} />
                                </div>
                                <h2 className="km-chef-name">{kitchenUser?.name || 'Chef'}</h2>
                            </div>
                            <button className="km-duty-btn">
                                <Zap size={12} strokeWidth={3} />
                                STARTED
                            </button>
                        </div>

                        <div className="km-hero-stats">
                            <div className="km-hero-stat-card">
                                <span className="km-hero-stat-val">{stats.pending}</span>
                                <span className="km-hero-stat-label">Pending</span>
                            </div>
                            <div className="km-hero-stat-card">
                                <span className="km-hero-stat-val">{stats.cooking}</span>
                                <span className="km-hero-stat-label">Cooking</span>
                            </div>
                            <div className="km-hero-stat-card">
                                <span className="km-hero-stat-val">{stats.ready}</span>
                                <span className="km-hero-stat-label">Ready</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section Header */}
                <div className="km-section-title-row" style={{ padding: '0 20px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ background: '#f97316', padding: '6px', borderRadius: '8px', color: 'white' }}>
                        <LayoutDashboard size={18} />
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '900', margin: 0 }}>Kitchen Feed</h3>
                </div>

                {/* Filter Pills */}
                <div className="km-filter-scroller">
                    {['ALL', 'Pending', 'Preparing', 'Ready'].map(f => (
                        <button 
                            key={f} 
                            onClick={() => setFilter(f)} 
                            className={`pill-soft ${filter === f ? 'active' : ''}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Feed */}
                <main className="km-feed">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <RefreshCw className="animate-spin" size={24} color="#4f46e5" />
                        </div>
                    ) : filteredKots.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                            <BellRing size={32} color="#cbd5e1" style={{ marginBottom: '12px' }} />
                            <p style={{ margin: 0, fontWeight: '800', fontSize: '0.9rem', color: '#1e293b' }}>Stations Clear</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            <AnimatePresence mode="popLayout">
                                {filteredKots.map(kot => {
                                    const statusLower = kot.status.toLowerCase();
                                    const statusClass = statusLower === 'preparing' ? 'active-cooking' : `active-${statusLower}`;
                                    
                                    return (
                                        <motion.div
                                            layout
                                            key={kot.id}
                                            whileTap={{ scale: 0.94 }}
                                            onClick={() => {
                                                const nextS = kot.status === 'Pending' ? 'Preparing' : kot.status === 'Preparing' ? 'Ready' : 'Served';
                                                api.patch(`/kots/${kot.id}/status`, { status: nextS });
                                            }}
                                            className={`km-kot-card ${statusClass}`}
                                            style={{
                                                padding: '24px 8px',
                                                borderRadius: '24px',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                border: 'none',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                            }}
                                        >
                                            <span style={{ fontSize: '1.4rem', fontWeight: '900' }}>#{kot.id}</span>
                                            <span style={{ fontSize: '0.6rem', fontWeight: '800', textTransform: 'uppercase', opacity: 0.8 }}>
                                                T-{kot.table_number || kot.table_id}
                                            </span>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </main>

                {/* Bottom Nav */}
                <div className="km-bottom-nav">
                    <button className="nav-item active">
                        <Home size={22} />
                        <span>Tables</span>
                    </button>
                    <button className="nav-item">
                        <ClipboardList size={22} />
                        <span>Orders</span>
                    </button>
                    <button className="nav-item">
                        <User size={22} />
                        <span>Account</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default KitchenPanel;
