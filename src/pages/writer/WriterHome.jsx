import React, { useState, useEffect, useContext, useMemo } from 'react';
import { WriterAuthContext } from '../../context/WriterAuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
    Clock, 
    User, 
    Power, 
    Grid, 
    CheckCircle2, 
    Info, 
    ChevronRight, 
    Users,
    Zap,
    Utensils,
    Star,
    Mail,
    ArrowRight,
    Receipt,
    X,
    UserPlus,
    Phone,
    LayoutDashboard,
    History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './WriterStyles.css';

const CustomerModal = ({ isOpen, onClose, onSubmit, table }) => {
    const [customer, setCustomer] = useState({
        name: '',
        phone: '',
        email: '',
        pax: 2
    });

    if (!isOpen) return null;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(8px)',
                zIndex: 2000,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '20px'
            }}
        >
            <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                style={{
                    background: 'white',
                    width: '100%',
                    maxWidth: '400px',
                    borderRadius: '32px',
                    padding: '32px',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                    position: 'relative'
                }}
            >
                <button 
                    onClick={onClose}
                    style={{ position: 'absolute', top: '24px', right: '24px', background: '#f8fafc', border: 'none', padding: '8px', borderRadius: '12px', color: '#64748b' }}
                >
                    <X size={20} />
                </button>

                <div style={{ marginBottom: '24px' }}>
                    <div style={{ width: '56px', height: '56px', background: '#ecfdf5', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <UserPlus size={28} color="#10b981" />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1e293b', margin: '0 0 8px' }}>Table {table?.table_number}</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500', margin: 0 }}>Enter customer details to start session</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Customer Name *</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input 
                                type="text"
                                placeholder="e.g. John Doe"
                                value={customer.name}
                                onChange={(e) => setCustomer({...customer, name: e.target.value})}
                                style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '16px', border: '1.5px solid #f1f5f9', background: '#f8fafc', fontWeight: '600', fontSize: '0.95rem', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Pax (Members) *</label>
                            <div style={{ position: 'relative' }}>
                                <Users size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input 
                                    type="number"
                                    min="1"
                                    value={customer.pax}
                                    onChange={(e) => setCustomer({...customer, pax: parseInt(e.target.value)})}
                                    style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '16px', border: '1.5px solid #f1f5f9', background: '#f8fafc', fontWeight: '600', fontSize: '0.95rem', outline: 'none' }}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Phone</label>
                            <div style={{ position: 'relative' }}>
                                <Phone size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input 
                                    type="tel"
                                    placeholder="Optional"
                                    value={customer.phone}
                                    onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                                    style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '16px', border: '1.5px solid #f1f5f9', background: '#f8fafc', fontWeight: '600', fontSize: '0.95rem', outline: 'none' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input 
                                type="email"
                                placeholder="Optional"
                                value={customer.email}
                                onChange={(e) => setCustomer({...customer, email: e.target.value})}
                                style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '16px', border: '1.5px solid #f1f5f9', background: '#f8fafc', fontWeight: '600', fontSize: '0.95rem', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <motion.button 
                        whileTap={{ scale: 0.96 }}
                        onClick={() => onSubmit(customer)}
                        disabled={!customer.name || !customer.pax}
                        style={{ 
                            width: '100%', padding: '16px', borderRadius: '18px', border: 'none',
                            background: (customer.name && customer.pax) ? 'linear-gradient(135deg, #4f46e5, #3b82f6)' : '#e2e8f0',
                            color: 'white', fontWeight: '900', fontSize: '1rem', marginTop: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                            boxShadow: (customer.name && customer.pax) ? '0 10px 20px rgba(79, 70, 229, 0.2)' : 'none'
                        }}
                    >
                        START ORDER <ArrowRight size={20} />
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const WriterHome = () => {
    const { writer, toggleDuty } = useContext(WriterAuthContext);
    const { socket } = useSocket();
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [restaurantInfo, setRestaurantInfo] = useState({ name: 'Tirupati Hubspot', rating: 4.8 });
    const [selectedTable, setSelectedTable] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTables();
        api.get('/settings').then(res => {
            if (res.data) setRestaurantInfo({ name: res.data.restaurant_name, rating: res.data.restaurant_rating });
        }).catch(() => {});

        if (socket) {
            socket.on('tableStatusUpdate', fetchTables);
            socket.on('tablesMerged', fetchTables);
        }
        
        return () => {
            if (socket) {
                socket.off('tableStatusUpdate', fetchTables);
                socket.off('tablesMerged', fetchTables);
            }
        };
    }, [socket]);

    const fetchTables = async () => {
        try {
            const res = await api.get('/tables');
            setTables(res.data);
        } catch (error) {
            toast.error('Failed to load tables');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleDuty = async () => {
        try {
            const newStatus = !writer.is_on_duty;
            await toggleDuty(newStatus);
            toast.success(newStatus ? 'Shift Started - ON DUTY' : 'Shift Ended - OFF DUTY');
        } catch (error) {
            toast.error('Failed to update shift status');
        }
    };

    const handleTableClick = (table) => {
        if (!writer.is_on_duty) {
            toast.error('Please switch to ON DUTY status to take orders');
            return;
        }

        if (table.status === 'Available') {
            setSelectedTable(table);
            setShowModal(true);
        } else {
            navigate(`/writer/order/${table.id}`, { state: { table } });
        }
    };

    const handleGenerateBill = async (e, tableId) => {
        e.stopPropagation();
        if (!window.confirm('Generate final bill for this table?')) return;
        
        try {
            const res = await api.post('/orders/dine-in/generate', { table_id: tableId });
            toast.success(`Bill Generated: ₹${res.data.total}`);
            fetchTables();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to generate bill');
        }
    };

    const handleOnboardSubmit = async (customerData) => {
        try {
            // Update table status with customer info
            await api.patch(`/tables/${selectedTable.id}/status`, {
                status: 'Occupied',
                customer_name: customerData.name,
                customer_phone: customerData.phone,
                customer_email: customerData.email,
                pax: customerData.pax
            });
            
            setShowModal(false);
            // Re-fetch tables to have latest data before navigating if needed, 
            // or just pass the customer data in navigation state
            const updatedTable = { ...selectedTable, status: 'Occupied', ...customerData, customer_name: customerData.name };
            navigate(`/writer/order/${selectedTable.id}`, { state: { table: updatedTable } });
        } catch (error) {
            toast.error('Failed to assign table');
        }
    };

    const occupiedTables = useMemo(() => tables.filter(t => t.status === 'Occupied').length, [tables]);
    const availableTables = useMemo(() => tables.filter(t => t.status === 'Available').length, [tables]);

    if (loading) {
        return (
            <div className="writer-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
                <div className="cp-spinner" />
                <p style={{ color: '#64748b', fontWeight: '700' }}>Syncing Tables...</p>
            </div>
        );
    }

    return (
        <div className="writer-container animate-fade-in" style={{ backgroundColor: '#f8fafc' }}>
            <AnimatePresence>
                {showModal && (
                    <CustomerModal 
                        isOpen={showModal} 
                        table={selectedTable}
                        onClose={() => setShowModal(false)}
                        onSubmit={handleOnboardSubmit}
                    />
                )}
            </AnimatePresence>

            {/* Super UI Mobile Home Header */}
            <div style={{ 
                background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                padding: '32px 24px 44px',
                borderRadius: '0 0 32px 32px',
                position: 'relative',
                overflow: 'hidden',
                color: 'white'
            }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, background: 'radial-gradient(circle, rgba(79, 70, 229, 0.2) 0%, transparent 70%)', borderRadius: '50%' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ 
                            width: '56px', height: '56px', borderRadius: '18px', 
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex', justifyContent: 'center', alignItems: 'center'
                        }}>
                            <User size={28} color="white" />
                        </div>
                        <div>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Primary Captain</span>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: '900', margin: 0 }}>{writer?.name || 'Captain'}</h2>
                        </div>
                    </div>
                    
                    <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={handleToggleDuty}
                        style={{
                            border: 'none',
                            background: writer?.is_on_duty ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.1)',
                            color: 'white', padding: '10px 16px', borderRadius: '14px',
                            fontWeight: '800', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px',
                            boxShadow: writer?.is_on_duty ? '0 10px 20px rgba(16, 185, 129, 0.25)' : 'none'
                        }}
                    >
                        <Power size={14} strokeWidth={3} />
                        {writer?.is_on_duty ? 'STARTED' : 'STANDBY'}
                    </motion.button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', position: 'relative' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: '900', display: 'block' }}>{occupiedTables}</span>
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Active Tables</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: '900', display: 'block' }}>{availableTables}</span>
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Open Tables</span>
                    </div>
                    <div style={{ background: 'rgba(79, 70, 229, 0.1)', padding: '12px', borderRadius: '18px', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: '900', display: 'block', color: '#818cf8' }}>{writer?.today_kot_count || 0}</span>
                        <span style={{ fontSize: '0.65rem', color: '#818cf8', fontWeight: '700', textTransform: 'uppercase' }}>Today's KOTs</span>
                    </div>
                </div>
            </div>

            <div style={{ padding: '24px 20px' }}>
                {/* Section Title */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ padding: '8px', background: '#f97316', borderRadius: '10px', color: 'white' }}>
                            <LayoutDashboard size={20} />
                        </div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#1e293b', margin: 0 }}>Floor Status</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ border: 'none', background: 'white', padding: '8px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <History size={18} color="#64748b" />
                        </button>
                    </div>
                </div>

                {/* Table Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {tables.map(table => (
                        <motion.div
                            key={table.id}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => handleTableClick(table)}
                            style={{
                                background: table.status === 'Occupied' ? 'linear-gradient(135deg, #4f46e5, #3b82f6)' : 'white',
                                borderRadius: '28px',
                                padding: '24px 12px',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                cursor: 'pointer',
                                boxShadow: table.status === 'Occupied' ? '0 12px 24px -6px rgba(79, 70, 229, 0.4)' : '0 4px 12px rgba(0,0,0,0.03)',
                                border: table.status === 'Available' ? '1.5px solid #f1f5f9' : 'none',
                                position: 'relative'
                            }}
                        >
                            <span style={{ 
                                fontSize: '1.6rem', fontWeight: '900', 
                                color: table.status === 'Occupied' ? 'white' : '#1e293b' 
                            }}>
                                {table.table_number?.includes('-') ? table.table_number.split('-')[1] : (table.table_number || table.id)}
                            </span>
                            <span style={{ 
                                fontSize: '0.65rem', fontWeight: '800', 
                                color: table.status === 'Occupied' ? 'rgba(255,255,255,0.7)' : '#94a3b8',
                                textTransform: 'uppercase', letterSpacing: '0.5px'
                            }}>
                                {table.status}
                            </span>
                            
                            {table.status === 'Occupied' && (
                                <>
                                    <div 
                                        onClick={(e) => handleGenerateBill(e, table.id)}
                                        style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: '10px', color: 'white' }}
                                    >
                                        <Receipt size={16} />
                                    </div>
                                    <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                                        <Users size={12} color="rgba(255,255,255,0.8)" />
                                        <span style={{ fontSize: '0.6rem', color: 'white', fontWeight: '900' }}>{table.pax || 0}</span>
                                    </div>
                                </>
                            )}
                            {table.status === 'Available' && (
                                <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', position: 'absolute', top: '12px', right: '12px', boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)' }} />
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Info Card */}
                <div style={{ 
                    marginTop: '32px', 
                    background: 'white', padding: '20px', borderRadius: '24px',
                    display: 'flex', gap: '16px', alignItems: 'start',
                    border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                }}>
                    <div style={{ padding: '10px', background: '#eff6ff', borderRadius: '14px' }}>
                        <Zap size={22} color="#4f46e5" fill="#4f46e5" />
                    </div>
                    <div>
                        <h4 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: '800', color: '#1e293b' }}>Workflow Tip</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: '500', lineHeight: 1.6 }}>
                            Entering accurate customer details helps in faster billing and better guest recommendations next time they visit.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WriterHome;
