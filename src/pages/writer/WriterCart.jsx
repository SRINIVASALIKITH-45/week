import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { WriterAuthContext } from '../../context/WriterAuthContext';
import { useSocket } from '../../context/SocketContext';
import { IMAGE_BASE_URL } from '../../config';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
    ArrowLeft, 
    Trash2, 
    Minus, 
    Plus, 
    Send, 
    CheckCircle2,
    UtensilsCrossed,
    Clock,
    ClipboardCheck,
    Receipt,
    MessageSquare,
    AlertCircle,
    Info,
    User,
    Users
} from 'lucide-react';
import './WriterStyles.css';

const WriterCart = () => {
    const { id: tableId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { writer } = useContext(WriterAuthContext);
    const { socket } = useSocket();
    
    const [cart, setCart] = useState(location.state?.cart || []);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [kotVersion, setKotVersion] = useState(1);
    const [existingItems, setExistingItems] = useState([]);

    const customerName = location.state?.customerName || location.state?.table?.customer_name || null;
    const customerPax = location.state?.customerPax || location.state?.table?.pax || null;
    const customerPhone = location.state?.table?.customer_phone || null;
    const customerEmail = location.state?.table?.customer_email || null;

    // Fetch existing KOT items for this table to identify new additions
    useEffect(() => {
        const fetchExisting = async () => {
            try {
                const res = await api.get(`/kots/table/${tableId}`);
                if (res.data && res.data.length > 0) {
                    const latest = res.data[0];
                    const items = typeof latest.items_json === 'string'
                        ? JSON.parse(latest.items_json)
                        : (latest.items_json || []);
                    setExistingItems(items);
                    setKotVersion((latest.version || 1) + 1);
                }
            } catch {}
        };
        fetchExisting();
    }, [tableId]);

    const updateQty = (uniqueId, delta) => {
        const updated = cart.map(item => {
            if (item.uniqueId === uniqueId) {
                return { ...item, qty: Math.max(1, item.qty + delta) };
            }
            return item;
        });
        setCart(updated);
        sessionStorage.setItem(`writer_draft_${tableId}`, JSON.stringify(updated));
    };

    const removeItem = (uniqueId) => {
        const updated = cart.filter(item => item.uniqueId !== uniqueId);
        setCart(updated);
        sessionStorage.setItem(`writer_draft_${tableId}`, JSON.stringify(updated));
        if (updated.length === 0) {
            navigate(`/writer/order/${tableId}`);
        }
    };

    const handleSubmitOrder = async () => {
        if (!writer?.is_on_duty) {
            toast.error('Shift error: You must be ON DUTY to dispatch KOTs');
            return;
        }

        setIsSubmitting(true);
        try {
            const kotData = {
                table_id: tableId,
                writer_id: writer.id,
                customer_name: customerName,
                pax: customerPax,
                items: cart.map(item => ({
                    product_id: item.id,
                    name: item.name,
                    quantity: item.qty,
                    price: item.price,
                    note: item.note
                }))
            };

            const res = await api.post('/kots', kotData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('writerToken')}` }
            });

            setOrderId(res.data.kotId);
            setKotVersion(res.data.version || 1);
            setIsSuccess(true);
            sessionStorage.removeItem(`writer_draft_${tableId}`);
            
            setTimeout(() => navigate('/writer/home'), 2500);

        } catch (error) {
            toast.error('Dispatch failed: Check kitchen connection');
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const tableInfo = location.state?.table;
    const tableDisplayId = tableInfo?.table_number?.includes('-') ? tableInfo.table_number.split('-')[1] : (tableInfo?.table_number || tableId);

    if (isSuccess) {
        return (
            <div className="writer-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '85vh', padding: '32px', textAlign: 'center' }}>
                <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 10 }}
                    style={{ 
                        width: '120px', height: '120px', borderRadius: '40px',
                        background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white',
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)', marginBottom: '32px'
                    }}
                >
                    <CheckCircle2 size={64} strokeWidth={3} />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b', marginBottom: '8px' }}>Dispatched!</h2>
                    {customerName && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#eff6ff', padding: '8px 16px', borderRadius: '12px', marginBottom: '12px' }}>
                            <User size={14} color="#4f46e5" />
                            <span style={{ fontWeight: '800', color: '#4f46e5', fontSize: '0.9rem' }}>{customerName}{customerPax ? ` • ${customerPax} pax` : ''}</span>
                        </div>
                    )}
                    <p style={{ fontSize: '1rem', color: '#64748b', fontWeight: '600' }}>KOT #{orderId} is live in the kitchen.</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="writer-container animate-fade-in" style={{ padding: '0 20px 40px' }}>
            {/* Header */}
            <div className="writer-header" style={{ margin: '0 -20px 24px', padding: '16px 20px', flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button className="writer-nav-back" onClick={() => navigate(-1)}>
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '900', margin: 0, color: '#1e293b' }}>KOT Review</h2>
                            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Table {tableDisplayId} • {cart.length} Items</span>
                        </div>
                    </div>
                    <div style={{ padding: '8px', background: '#eff6ff', borderRadius: '12px', color: '#4f46e5' }}>
                        <ClipboardCheck size={20} />
                    </div>
                </div>
                
                {/* Customer Info Card */}
                {customerName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', padding: '12px 16px', borderRadius: '16px', border: '1px solid #bae6fd' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <User size={20} color="white" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <span style={{ fontSize: '1rem', fontWeight: '900', color: '#0c4a6e', display: 'block' }}>{customerName}</span>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {customerPax && <span style={{ fontSize: '0.7rem', color: '#0ea5e9', fontWeight: '700' }}>{customerPax} Members</span>}
                                {customerPhone && <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>• {customerPhone}</span>}
                                {customerEmail && <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>• {customerEmail}</span>}
                            </div>
                        </div>
                        {customerPax && (
                            <div style={{ background: 'white', padding: '6px 10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Users size={14} color="#0ea5e9" />
                                <span style={{ fontWeight: '900', color: '#0c4a6e', fontSize: '0.85rem' }}>{customerPax}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Warning if lots of items */}
            {cart.length > 8 && (
                <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', padding: '12px 16px', borderRadius: '16px', marginBottom: '24px', display: 'flex', gap: '10px' }}>
                    <AlertCircle size={18} color="#ef4444" />
                    <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '600', color: '#b91c1c' }}>Large order detected. Please verify items before dispatching to avoid kitchen load.</p>
                </div>
            )}

            {/* Items List - Comprehensive Mobile Style */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                <AnimatePresence>
                    {cart.map((item) => {
                        // Detect if item is NEW compared to existing KOT
                        const existingItem = existingItems.find(e => (e.product_id || e.name) === (item.id || item.name));
                        const isNewItem = !existingItem;
                        const isIncreasedItem = existingItem && item.qty > existingItem.quantity;
                        const highlighted = isNewItem || isIncreasedItem;

                        return (
                        <motion.div 
                            key={item.uniqueId}
                            layout
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            style={{
                                background: highlighted && kotVersion > 1 ? '#fffbeb' : 'white',
                                borderRadius: '24px', padding: '16px',
                                border: highlighted && kotVersion > 1 ? '1.5px solid #fcd34d' : '1px solid #f1f5f9',
                                display: 'flex', gap: '12px'
                            }}
                        >
                            <img 
                                src={item.image_url ? `${IMAGE_BASE_URL}${item.image_url}` : 'https://via.placeholder.com/150'} 
                                style={{ width: '70px', height: '70px', borderRadius: '16px', objectFit: 'cover', flexShrink: 0 }} 
                            />
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                        <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: 0, color: '#1e293b' }}>{item.name}</h4>
                                        {highlighted && kotVersion > 1 && (
                                            <span style={{ background: '#fcd34d', color: '#92400e', fontSize: '0.6rem', fontWeight: '900', padding: '2px 7px', borderRadius: '6px', textTransform: 'uppercase' }}>
                                                {isNewItem ? '★ NEW' : `+${item.qty - (existingItem?.quantity || 0)} Added`}
                                            </span>
                                        )}
                                    </div>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '900', color: '#1e293b', flexShrink: 0 }}>₹{item.price * item.qty}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                    <div className={item.food_type === 'Veg' ? 'veg-badge' : 'nonveg-badge'}></div>
                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700' }}>{item.qty} units</span>
                                </div>
                                
                                {item.note && (
                                    <div style={{ display: 'flex', gap: '6px', background: '#f8fafc', padding: '8px 12px', borderRadius: '10px', marginBottom: '16px', borderLeft: '3px solid #f97316' }}>
                                        <MessageSquare size={14} color="#f97316" style={{ marginTop: '2px' }} />
                                        <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '600', color: '#64748b' }}>"{item.note}"</p>
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div className="writer-qty-selector" style={{ transform: 'scale(0.9)', originX: 0 }}>
                                        <button className="writer-qty-btn" onClick={() => updateQty(item.uniqueId, -1)}>−</button>
                                        <span className="writer-qty-val">{item.qty}</span>
                                        <button className="writer-qty-btn" onClick={() => updateQty(item.uniqueId, 1)}>+</button>
                                    </div>
                                    <button onClick={() => removeItem(item.uniqueId)} style={{ border: 'none', background: 'transparent', color: '#94a3b8', padding: '8px' }}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Billing Summary */}
            <div style={{ 
                background: 'white', borderRadius: '32px', padding: '24px',
                border: '1.5px solid #f1f5f9', marginBottom: '32px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <Receipt size={20} color="#4f46e5" />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '900', margin: 0 }}>Dispatch Summary</h3>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>KOT Subtotal</span>
                    <span style={{ fontWeight: '800', color: '#1e293b' }}>₹{totalAmount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#64748b', fontWeight: '600' }}>Taxes (Est. 5%)</span>
                        <Info size={12} color="#94a3b8" />
                    </div>
                    <span style={{ fontWeight: '800', color: '#10b981' }}>+ ₹{Math.round(totalAmount * 0.05)}</span>
                </div>
                
                <div style={{ height: '2px', background: 'dashed #f1f5f9', backgroundImage: 'linear-gradient(to right, #f1f5f9 50%, rgba(255,255,255,0) 0%)', backgroundPosition: 'bottom', backgroundSize: '12px 2px', backgroundRepeat: 'repeat-x', marginBottom: '20px' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '800', fontSize: '1.2rem', color: '#1e293b' }}>KOT Total</span>
                    <span style={{ fontWeight: '900', fontSize: '1.6rem', color: '#f97316' }}>₹{totalAmount + Math.round(totalAmount * 0.05)}</span>
                </div>
            </div>

            {/* Preparation Stats */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
                <div style={{ flex: 1, background: '#f0f9ff', padding: '20px 12px', borderRadius: '24px', textAlign: 'center', border: '1.5px solid #e0f2fe' }}>
                    <Clock size={24} color="#0369a1" style={{ margin: '0 auto 8px' }} />
                    <span style={{ display: 'block', fontSize: '1rem', fontWeight: '900', color: '#0c4a6e' }}>~15 Mins</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#0369a1', textTransform: 'uppercase' }}>Prep Time</span>
                </div>
                <div style={{ flex: 1, background: '#f0fdf4', padding: '20px 12px', borderRadius: '24px', textAlign: 'center', border: '1.5px solid #dcfce7' }}>
                    <UtensilsCrossed size={24} color="#15803d" style={{ margin: '0 auto 8px' }} />
                    <span style={{ display: 'block', fontSize: '1rem', fontWeight: '900', color: '#064e3b' }}>Hot Loop</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#15803d', textTransform: 'uppercase' }}>Kitchen Priority</span>
                </div>
            </div>

            {/* Final Dispatch Button */}
            <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                style={{
                    width: '100%', padding: '20px', borderRadius: '28px',
                    border: 'none', background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                    color: 'white', fontWeight: '900', fontSize: '1.15rem',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px',
                    boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.4)', cursor: 'pointer',
                    opacity: isSubmitting ? 0.8 : 1
                }}
            >
                {isSubmitting ? (
                    'Dispatching...'
                ) : (
                    <>
                        <Send size={24} strokeWidth={3} /> Dispatch to Kitchen
                    </>
                )}
            </motion.button>
            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', fontWeight: '600', marginTop: '16px' }}>
                Order will be tracked in real-time by the guest.
            </p>
        </div>
    );
};

export default WriterCart;
