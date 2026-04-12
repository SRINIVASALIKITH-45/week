import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import { IMAGE_BASE_URL } from '../config';
import { ShoppingCart, Plus, Minus, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';

const PublicMenu = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({});
  
  // Filters State
  const [filters, setFilters] = useState({
    search: '',
    category_id: [],
    food_type: [],
    spice_level: [],
    meal_type: [],
    portion: [],
    price_range: [],
    tags: [],
    sort: 'newest'
  });

  const [showFilters, setShowFilters] = useState(true);

  const fetchInitialData = async () => {
    try {
      const [catRes, tagRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products/get-tags')
      ]);
      setCategories(catRes.data);
      setAvailableTags(tagRes.data);
    } catch (error) {
        console.error("Initial fetch failed", error);
    }
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/products', { params: { ...filters, limit: 100 } });
      // Only show available products
      setProducts(res.data.products.filter(p => p.is_available));
    } catch (error) {
      toast.error('Failed to fetch menu');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchProducts();
    }, 300); // Debounce search/filters
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const toggleFilter = (type, value) => {
    setFilters(prev => {
        const current = [...(prev[type] || [])];
        const index = current.indexOf(value);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(value);
        }
        return { ...prev, [type]: current };
    });
  };

  const addToCart = (product) => {
    setCart(prev => ({
      ...prev,
      [product.id]: {
        ...product,
        qty: (prev[product.id]?.qty || 0) + 1
      }
    }));
    toast.success(`${product.name} added to cart!`);
  };

  const updateQty = (id, delta) => {
    setCart(prev => {
      const item = prev[id];
      if (!item) return prev;
      const newQty = item.qty + delta;
      if (newQty <= 0) {
        const newCart = { ...prev };
        delete newCart[id];
        return newCart;
      }
      return { ...prev, [id]: { ...item, qty: newQty } };
    });
  };

  const total = Object.values(cart).reduce((acc, item) => acc + (item.price * item.qty), 0);

  const FilterSection = ({ title, options, type, labelField = 'name', valueField = 'id' }) => (
    <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{title}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {options.map(opt => {
                const val = typeof opt === 'string' ? opt : opt[valueField];
                const label = typeof opt === 'string' ? opt : opt[labelField];
                const isActive = filters[type].includes(val);
                return (
                    <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <input 
                            type="checkbox" 
                            checked={isActive} 
                            onChange={() => toggleFilter(type, val)} 
                            style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                        />
                        <span style={{ color: isActive ? 'var(--primary-dark)' : 'inherit', fontWeight: isActive ? '600' : 'normal' }}>{label}</span>
                    </label>
                );
            })}
        </div>
    </div>
  );

  return (
    <div style={{ padding: '1rem', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <header className="mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
        <div>
          <h1 className="fw-bold" style={{ fontSize: '2.4rem', letterSpacing: '-0.04em', fontFamily: "'Outfit', sans-serif" }}>Hungry? <span style={{ color: 'var(--primary)' }}>Order Joy.</span></h1>
          <p className="text-muted" style={{ fontSize: '1.1rem', fontFamily: "'Outfit', sans-serif" }}>Choose from {products.length} hand-crafted recipes.</p>
        </div>
        
        <div className="d-flex align-items-center gap-4">
            <div className="position-relative">
                <Search className="position-absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                <input 
                    type="text" 
                    placeholder="Search your favorite dish..."
                    className="form-control ps-5"
                    style={{ width: '300px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                />
            </div>
            <div className="position-relative cursor-pointer" style={{ cursor: 'pointer' }}>
                <div style={{ backgroundColor: 'white', padding: '0.8rem', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', position: 'relative' }}>
                    <ShoppingCart size={24} color="var(--primary)" />
                    {Object.keys(cart).length > 0 && (
                        <span style={{
                            position: 'absolute', top: '-6px', right: '-6px',
                            backgroundColor: '#ef4444', color: 'white',
                            borderRadius: '50%', width: '22px', height: '22px',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            fontSize: '0.75rem', fontWeight: '800', border: '2px solid white'
                        }}>
                            {Object.values(cart).reduce((a, b) => a + b.qty, 0)}
                        </span>
                    )}
                </div>
            </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: showFilters ? '280px 1fr 340px' : '1fr 350px', gap: '2rem' }}>
        
        {/* Sidebar Filters */}
        <aside className="glass p-4" style={{ height: 'calc(100vh - 120px)', position: 'sticky', top: '20px', overflowY: 'auto', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.8)' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0 fw-bold d-flex align-items-center gap-2"><Filter size={18} /> Preferences</h5>
                <button className="btn btn-link p-0 x-small text-primary fw-bold" onClick={() => setFilters({ search: '', category_id: [], food_type: [], spice_level: [], meal_type: [], portion: [], price_range: [], tags: [], sort: 'newest' })}>CLEAR ALL</button>
            </div>

            <div className="d-flex flex-column gap-1">
                <FilterSection title="Menu Category" options={categories} type="category_id" />
                <FilterSection title="Dietary" options={['Veg', 'Non-Veg', 'Egg']} type="food_type" />
                <FilterSection title="Spice Preferences" options={['Mild', 'Medium', 'Spicy']} type="spice_level" />
                <FilterSection title="Meal Time" options={['Breakfast', 'Lunch', 'Dinner', 'Snacks']} type="meal_type" />
                
                <div className="mb-4">
                    <p className="section-title text-muted mb-3" style={{ fontSize: '0.7rem' }}>Special Tags</p>
                    <div className="d-flex flex-wrap gap-2">
                        {availableTags.map(tag => (
                            <button 
                                key={tag.id}
                                onClick={() => toggleFilter('tags', tag.id)}
                                className={`btn btn-sm ${filters.tags.includes(tag.id) ? 'btn-primary' : 'btn-neutral'}`}
                                style={{
                                    padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.7rem',
                                    backgroundColor: filters.tags.includes(tag.id) ? 'var(--primary)' : 'white',
                                    border: '1px solid #e2e8f0',
                                    color: filters.tags.includes(tag.id) ? 'white' : '#64748b'
                                }}
                            >
                                {tag.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </aside>

        {/* Menu Grid */}
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4 ps-1">
                <p className="text-secondary small mb-0 fw-medium">Found {products.length} curated options</p>
                <div className="d-flex align-items-center gap-2">
                    <span className="x-small text-muted fw-bold">SORT BY:</span>
                    <select 
                        className="form-select form-select-sm border-0 bg-white shadow-sm" 
                        style={{ width: '160px', borderRadius: '10px' }}
                        value={filters.sort}
                        onChange={(e) => setFilters({...filters, sort: e.target.value})}
                    >
                        <option value="newest">Recent Items</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="d-flex justify-content-center mt-5">
                    <div className="spinner-border text-primary" role="status"></div>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center p-5 glass mt-4" style={{ borderRadius: '24px' }}>
                    <div className="mb-3" style={{ fontSize: '3rem', opacity: 0.3, display: 'flex', justifyContent: 'center' }}>
                        <Search size={48} />
                    </div>
                    <h4 className="fw-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>No matches found</h4>
                    <p className="text-muted small" style={{ fontFamily: "'Outfit', sans-serif" }}>Try adjusting your filters for more tasty options.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                    {products.map(product => (
                        <div key={product.id} className="card h-100 animate-fade-in" style={{ padding: 0, border: 'none', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                            <div style={{ height: '220px', position: 'relative' }}>
                                <img 
                                    src={`${IMAGE_BASE_URL}${product.image_url}`} 
                                    alt={product.name} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';}}
                                />
                                <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                                    {product.tags?.some(t => t.name === 'Best Seller') && <span className="badge bg-warning text-dark fw-bold shadow-sm" style={{ fontSize: '0.65rem' }}>BEST SELLER</span>}
                                    <div className="bg-white p-1 rounded-circle shadow-sm" style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyItems: 'center', border: '2px solid white' }}>
                                        <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: product.food_type === 'Veg' ? '#22c55e' : (product.food_type === 'Non-Veg' ? '#ef4444' : '#f59e0b') }}></div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 d-flex flex-column" style={{ flex: 1 }}>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h5 className="fw-bold mb-0" style={{ fontSize: '1.15rem', fontFamily: "'Outfit', sans-serif" }}>{product.name}</h5>
                                    <span style={{ fontWeight: '900', color: 'var(--primary)', fontSize: '1.1rem', fontFamily: "'Outfit', sans-serif" }}>₹{product.price}</span>
                                </div>
                                <div className="d-flex gap-2 mb-3">
                                    <span className="badge-soft-info px-2 py-0.5 rounded x-small fw-bold">{product.meal_type}</span>
                                    <span className="badge-soft-warning px-2 py-0.5 rounded x-small fw-bold">{product.spice_level}</span>
                                </div>
                                <p className="text-secondary small mb-4 flex-grow-1" style={{ lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {product.description || 'Experience authentic flavors crafted with the finest local ingredients for a truly delightful meal.'}
                                </p>
                                <button 
                                    className="btn btn-primary w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2" 
                                    style={{ borderRadius: '14px', fontFamily: "'Outfit', sans-serif" }}
                                    onClick={() => addToCart(product)}
                                >
                                    <Plus size={18} strokeWidth={3} /> ADD TO BASKET
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Professional Cart Sidebar */}
        <aside style={{ position: 'sticky', top: '20px', height: 'fit-content' }}>
            <div className="card shadow-sm border-0 p-1" style={{ borderRadius: '24px', backgroundColor: 'white' }}>
                <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="mb-0 fw-bold d-flex align-items-center gap-2"><ShoppingCart size={22} /> Order Basket</h5>
                        {Object.keys(cart).length > 0 && <span className="badge-soft-primary px-2 py-1 rounded small fw-bold">{Object.keys(cart).length} ITEMS</span>}
                    </div>
                    
                    {Object.keys(cart).length === 0 ? (
                        <div className="text-center py-5">
                            <div className="mb-3" style={{ fontSize: '3rem', opacity: 0.3 }}>🛒</div>
                            <p className="text-muted mb-0 fw-medium">Your basket is feeling light!</p>
                            <p className="x-small text-secondary mt-1">Add items to proceed</p>
                        </div>
                    ) : (
                        <>
                        <div style={{ maxHeight: '380px', overflowY: 'auto' }} className="pe-2">
                            {Object.values(cart).map(item => (
                            <div key={item.id} className="d-flex justify-content-between align-items-center mb-4">
                                <div style={{ flex: 1 }}>
                                    <p className="mb-0 fw-bold small text-dark">{item.name}</p>
                                    <div className="d-flex align-items-center gap-2 mt-1">
                                        <span className="x-small text-primary fw-bold">₹{item.price}</span>
                                        <span className="x-small text-muted">x {item.qty}</span>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-2 bg-light rounded-pill px-2 py-1" style={{ border: '1px solid #f1f5f9' }}>
                                    <button onClick={() => updateQty(item.id, -1)} className="btn btn-sm p-1 d-flex bg-white shadow-sm rounded-circle"><Minus size={12} /></button>
                                    <span className="fw-bold px-1" style={{ minWidth: '20px', textAlign: 'center', fontSize: '0.8rem' }}>{item.qty}</span>
                                    <button onClick={() => updateQty(item.id, 1)} className="btn btn-sm p-1 d-flex bg-white shadow-sm rounded-circle"><Plus size={12} /></button>
                                </div>
                            </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-top">
                            <div className="d-flex justify-content-between mb-3">
                                <span className="text-secondary fw-medium">Basket Total</span>
                                <span className="fw-bold">₹{total}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-4">
                                <span className="text-success fw-bold x-small">DELIVERY CHARGE</span>
                                <span className="text-success fw-bold x-small">FREE</span>
                            </div>
                            <div className="d-flex justify-content-between mb-4 p-3 bg-light rounded-3">
                                <span className="fw-bold">Total Payable</span>
                                <span className="fw-bold text-primary" style={{ fontSize: '1.2rem' }}>₹{total}</span>
                            </div>
                        </div>
                        <button className="btn btn-primary w-100 py-3 fw-bold shadow-sm" style={{ borderRadius: '16px', letterSpacing: '0.5px' }}>
                            CONFIRM ORDER
                        </button>
                        </>
                    )}
                </div>
            </div>
            
            <div className="mt-3 p-3 glass d-flex align-items-center gap-3" style={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div className="bg-soft-success p-2 rounded-circle"><Truck size={20} className="text-success" /></div>
                <div>
                    <p className="mb-0 fw-bold x-small text-dark">Instant Delivery</p>
                    <p className="mb-0 x-small text-muted">Arrives in 25-30 mins</p>
                </div>
            </div>
        </aside>
      </div>
    </div>
  );
};

export default PublicMenu;
