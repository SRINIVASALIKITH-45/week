import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { WriterAuthContext } from '../../context/WriterAuthContext';
import { IMAGE_BASE_URL } from '../../config';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
    Search, 
    ShoppingCart, 
    ArrowLeft, 
    Plus, 
    Minus, 
    X, 
    Check,
    ChevronUp,
    MessageSquare,
    Star,
    Clock,
    Filter,
    Zap,
    Users,
    User
} from 'lucide-react';
import './WriterStyles.css';

const WriterOrder = () => {
    const { id: tableId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { writer } = useContext(WriterAuthContext);
    
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [activeFoodType, setActiveFoodType] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    
    const [cart, setCart] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null); // For notes modal

    useEffect(() => {
        fetchInitialData();
        const draft = sessionStorage.getItem(`writer_draft_${tableId}`);
        if (draft) setCart(JSON.parse(draft));
    }, [tableId]);

    const fetchInitialData = async () => {
        try {
            const [catRes, prodRes] = await Promise.all([
                api.get('/categories'),
                api.get('/products')
            ]);
            setCategories([{ id: 'all', name: 'All' }, ...(catRes.data || [])]);
            const productList = prodRes.data?.products || (Array.isArray(prodRes.data) ? prodRes.data : []);
            setProducts(productList);
        } catch (error) {
            toast.error('Failed to load menu');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = useMemo(() => {
        let result = products;
        if (activeCategory !== 'All') result = result.filter(p => p.category_name === activeCategory);
        if (activeFoodType !== 'All') result = result.filter(p => p.food_type === activeFoodType);
        if (searchQuery) result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
        return result;
    }, [products, activeCategory, activeFoodType, searchQuery]);

    const handleUpdateQty = (product, delta) => {
        setCart(prev => {
            const existingIdx = prev.findIndex(item => item.id === product.id);
            let nextCart = [...prev];

            if (existingIdx > -1) {
                const newQty = nextCart[existingIdx].qty + delta;
                if (newQty <= 0) {
                    nextCart.splice(existingIdx, 1);
                } else {
                    nextCart[existingIdx] = { ...nextCart[existingIdx], qty: newQty };
                }
            } else if (delta > 0) {
                nextCart.push({ ...product, qty: 1, uniqueId: Date.now() });
            }

            sessionStorage.setItem(`writer_draft_${tableId}`, JSON.stringify(nextCart));
            return nextCart;
        });
    };

    const handleGenerateBill = async () => {
        if (!window.confirm('Are you sure you want to generate the final bill for this table? This will send the bill to the Admin for payment.')) return;
        
        try {
            const res = await api.post('/orders/dine-in/generate', { table_id: tableId });
            toast.success(`Bill Generated: ₹${res.data.total}`);
            navigate('/writer/home');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to generate bill');
        }
    };

    const getItemQty = (productId) => {
        const item = cart.find(i => i.id === productId);
        return item ? item.qty : 0;
    };

    const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);

    const tableInfo = location.state?.table;
    const tableDisplayId = tableInfo?.table_number?.includes('-') ? tableInfo.table_number.split('-')[1] : (tableInfo?.table_number || tableId);
    const customerName = tableInfo?.customer_name || tableInfo?.name || null;
    const customerPax = tableInfo?.pax || null;

    if (loading) {
        return (
            <div className="writer-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
                <div className="cp-spinner" />
                <p style={{ color: '#64748b', fontWeight: '700' }}>Loading Menu...</p>
            </div>
        );
    }

    return (
        <div className="writer-container animate-fade-in">
            {/* Header */}
            <div className="writer-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button className="writer-nav-back" onClick={() => navigate('/writer/home')}>
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: '900', margin: 0, color: '#1e293b' }}>Table {tableDisplayId}</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                 <div className="pulse-dot" style={{ width: '6px', height: '6px', backgroundColor: '#10b981', borderRadius: '50%' }} />
                                 <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#10b981', textTransform: 'uppercase' }}>Active Session</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ background: '#fef3c7', color: '#d97706', padding: '6px 12px', borderRadius: '50px', fontSize: '0.65rem', fontWeight: '800' }}>
                            KOT PANEL
                        </div>
                        <button 
                            onClick={handleGenerateBill}
                            style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '50px', fontSize: '0.65rem', fontWeight: '800', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)' }}
                        >
                            GENERATE BILL
                        </button>
                    </div>
                </div>

                {/* Customer Session Banner */}
                {customerName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', padding: '10px 14px', borderRadius: '14px', border: '1px solid #bae6fd' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <User size={16} color="white" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: '900', color: '#0c4a6e', display: 'block', lineHeight: 1.2 }}>{customerName}</span>
                            <span style={{ fontSize: '0.7rem', color: '#0ea5e9', fontWeight: '700' }}>{customerPax ? `${customerPax} Members` : 'Table Guest'}</span>
                        </div>
                        {customerPax && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'white', padding: '4px 10px', borderRadius: '8px' }}>
                                <Users size={13} color="#0ea5e9" />
                                <span style={{ fontSize: '0.8rem', fontWeight: '900', color: '#0c4a6e' }}>{customerPax}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Search & Food Type Filter */}
            <div style={{ padding: '16px 20px 0' }}>
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                    <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                        type="text" 
                        className="ch-search-input" 
                        placeholder="Search for dishes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: '16px', border: '1.5px solid #f1f5f9', background: 'white', fontWeight: '600' }}
                    />
                </div>

                <div className="writer-pill-scroller" style={{ padding: '0 0 16px', gap: '8px' }}>
                    <button className={`pill-soft ${activeFoodType === 'All' ? 'active' : ''}`} onClick={() => setActiveFoodType('All')}>All</button>
                    <button className={`pill-soft ${activeFoodType === 'Veg' ? 'active' : ''}`} onClick={() => setActiveFoodType('Veg')} style={{ color: '#10b981' }}>Veg Only</button>
                    <button className={`pill-soft ${activeFoodType === 'Non-Veg' ? 'active' : ''}`} onClick={() => setActiveFoodType('Non-Veg')} style={{ color: '#ef4444' }}>Non-Veg</button>
                </div>
            </div>

            {/* Categories */}
            <div className="writer-pill-scroller" style={{ backgroundColor: '#fff', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: '75px', zIndex: 900 }}>
                {categories.map(cat => (
                    <button 
                        key={cat.id} 
                        className={`writer-pill ${activeCategory === cat.name ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat.name)}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Dishes List - Horizontal Style */}
            <div style={{ padding: '20px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#94a3b8', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {filteredProducts.length} Selection{filteredProducts.length !== 1 ? 's' : ''} Available
                </div>
                
                {filteredProducts.map(product => {
                    const qty = getItemQty(product.id);
                    return (
                        <div key={product.id} className="dish-card animate-fade-in shadow-sm">
                            <div className="dish-info">
                                <div className={product.food_type === 'Veg' ? 'veg-badge' : 'nonveg-badge'} style={{ marginBottom: '8px' }}></div>
                                <h3 className="dish-title">{product.name}</h3>
                                <div className="dish-meta">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#fef3c7', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', color: '#d97706', fontWeight: '800' }}>
                                        <Star size={10} fill="#d97706" /> 4.5
                                    </div>
                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600' }}>• 20 Mins</span>
                                </div>
                                <span className="dish-price">₹{product.price}</span>
                                <p className="dish-desc">{product.description || 'Finely prepared using authentic spices and fresh herbs for a rich taste.'}</p>
                            </div>
                            
                            <div className="dish-image-wrap">
                                <img 
                                    src={product.image_url ? `${IMAGE_BASE_URL}${product.image_url}` : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'} 
                                    className="dish-img" 
                                    alt={product.name}
                                />
                                <div className="dish-add-overlay">
                                    {qty === 0 ? (
                                        <motion.button 
                                            whileTap={{ scale: 0.9 }}
                                            className="btn btn-primary btn-sm px-4" 
                                            style={{ backgroundColor: 'white', color: '#4f46e5', border: '1.5px solid #4f46e5', fontWeight: '900', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}
                                            onClick={() => handleUpdateQty(product, 1)}
                                        >
                                            ADD
                                        </motion.button>
                                    ) : (
                                        <div className="writer-qty-selector">
                                            <button className="writer-qty-btn" onClick={() => handleUpdateQty(product, -1)}>−</button>
                                            <span className="writer-qty-val">{qty}</span>
                                            <button className="writer-qty-btn" onClick={() => handleUpdateQty(product, 1)}>+</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Cart Bar - Super UI Mobile */}
            <AnimatePresence>
                {cart.length > 0 && (
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        onClick={() => navigate(`/writer/cart/${tableId}`, { state: { cart, table: tableInfo, customerName, customerPax } })}
                        style={{
                            position: 'fixed', bottom: '90px', left: '50%', transform: 'translateX(-50%)',
                            width: 'calc(100% - 2rem)',
                            maxWidth: '448px',
                            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                            borderRadius: '24px', padding: '16px 20px', zIndex: 1100,
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <ShoppingCart size={20} color="white" strokeWidth={2.5} />
                            </div>
                            <div>
                                <span style={{ color: 'white', fontWeight: '800', fontSize: '1rem', display: 'block' }}>{totalItems} Items Added</span>
                                <span style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' }}>Review & Send KOT</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ color: 'white', fontWeight: '900', fontSize: '1.2rem' }}>₹{totalPrice}</span>
                                <span style={{ color: '#10b981', display: 'block', fontSize: '0.65rem', fontWeight: '800' }}>NET PAYABLE</span>
                            </div>
                            <div className="animate-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '4px' }}>
                                <ChevronUp size={20} color="white" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WriterOrder;
