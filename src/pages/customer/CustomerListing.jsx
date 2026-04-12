import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, SlidersHorizontal, Star, Clock, ChevronLeft,
  X, ChevronRight, Check, Filter, Info, MapPin, Percent, Heart
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import CustomerLayout from '../../components/CustomerLayout';
import api from '../../services/api';
import { IMAGE_BASE_URL } from '../../config';
import './CustomerListing.css';

const DIETARY_OPTIONS = ['Jain', 'Gluten-Free', 'Low Calorie', 'High Protein', 'Vegan'];
const SPICE_OPTIONS = ['Mild', 'Medium', 'Spicy', 'Extra Spicy'];
const PRICE_RANGES = [
    { label: 'Under ₹200', value: 'under_200' },
    { label: '₹200 - ₹500', value: '200_500' },
    { label: 'Above ₹500', value: 'above_500' }
];
const RATING_OPTIONS = [
    { label: '4.5+', value: 4.5 },
    { label: '4.0+', value: 4.0 },
    { label: '3.5+', value: 3.5 }
];
const TIME_OPTIONS = [
    { label: 'Under 30 min', value: 30 },
    { label: '30 - 45 min', value: 45 },
    { label: '45+ min', value: 999 }
];

const CustomerListing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart, cart, updateQty } = useCart();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Core Filters (Sync with server if needed, but mainly for broad categories)
  const [coreFilters, setCoreFilters] = useState({
    search: searchParams.get('search') || '',
    category_id: searchParams.get('category_id')?.split(',') || [],
    food_type: searchParams.get('food_type')?.split(',') || []
  });

  // Advanced Filters (Client-side)
  const [tempFilters, setTempFilters] = useState({
    priceRange: [],
    rating: null,
    deliveryTime: null,
    dietary: [],
    spiceLevel: [],
    offers: [], // 'hasOffer', 'freeDelivery'
  });

  const [activeFilters, setActiveFilters] = useState({...tempFilters});
  const [sortBy, setSortBy] = useState('newest');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all available products to allow snappy client-side filtering
      const res = await api.get('/products', { params: { ...coreFilters, limit: 1000 } });
      setProducts(res.data.products?.filter(p => p.is_available) || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [coreFilters]);

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Client-side Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by Price Range
    if (activeFilters.priceRange.length > 0) {
        result = result.filter(p => {
            const price = parseFloat(p.price);
            return activeFilters.priceRange.some(range => {
                if (range === 'under_200') return price < 200;
                if (range === '200_500') return price >= 200 && price <= 500;
                if (range === 'above_500') return price > 500;
                return false;
            });
        });
    }

    // Filter by Rating
    if (activeFilters.rating) {
        result = result.filter(p => parseFloat(p.rating || 4.0) >= activeFilters.rating);
    }

    // Filter by Delivery Time
    if (activeFilters.deliveryTime) {
        result = result.filter(p => {
            const time = p.delivery_time || 30;
            if (activeFilters.deliveryTime === 30) return time <= 30;
            if (activeFilters.deliveryTime === 45) return time > 30 && time <= 45;
            if (activeFilters.deliveryTime === 999) return time > 45;
            return true;
        });
    }

    // Filter by Dietary
    if (activeFilters.dietary.length > 0) {
        result = result.filter(p => activeFilters.dietary.includes(p.dietary_preference));
    }

    // Filter by Spice Level
    if (activeFilters.spiceLevel.length > 0) {
        result = result.filter(p => activeFilters.spiceLevel.includes(p.spice_level));
    }

    // Filter by Offers
    if (activeFilters.offers.includes('hasOffer')) {
        result = result.filter(p => p.has_offer);
    }
    if (activeFilters.offers.includes('freeDelivery')) {
        result = result.filter(p => p.free_delivery);
    }

    // Sort
    if (sortBy === 'price_low') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_high') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'top_rated') result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortBy === 'newest') result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return result;
  }, [products, activeFilters, sortBy]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (activeFilters.priceRange.length > 0) count++;
    if (activeFilters.rating) count++;
    if (activeFilters.deliveryTime) count++;
    if (activeFilters.dietary.length > 0) count++;
    if (activeFilters.spiceLevel.length > 0) count++;
    if (activeFilters.offers.length > 0) count++;
    return count;
  }, [activeFilters]);

  const toggleCoreFilter = (type, value) => {
    setCoreFilters(prev => {
      const current = [...(prev[type] || [])];
      const idx = current.indexOf(value);
      if (idx > -1) current.splice(idx, 1);
      else current.push(value);
      return { ...prev, [type]: current };
    });
  };

  const toggleArrayFilter = (setter, type, value) => {
    setter(prev => {
        const current = [...prev[type]];
        const idx = current.indexOf(value);
        if (idx > -1) current.splice(idx, 1);
        else current.push(value);
        return { ...prev, [type]: current };
    });
  };

  const handleApplyFilters = () => {
    setActiveFilters({...tempFilters});
    setShowFiltersModal(false);
  };

  const handleClearAll = () => {
    const cleared = {
        priceRange: [],
        rating: null,
        deliveryTime: null,
        dietary: [],
        spiceLevel: [],
        offers: [],
    };
    setTempFilters(cleared);
    setActiveFilters(cleared);
    setCoreFilters({ search: '', category_id: [], food_type: [] });
  };

  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    // Fetch favorites on mount
    api.get('/products/favorites').then(res => {
        setFavorites(new Set(res.data.map(p => p.id)));
    }).catch(() => {});
  }, []);

  const toggleFavorite = async (productId) => {
    try {
        const res = await api.post(`/products/${productId}/toggle-favorite`);
        if (res.data.is_favorite) {
            setFavorites(prev => new Set([...prev, productId]));
            toast.success('❤️ Added to favorites');
        } else {
            setFavorites(prev => {
                const next = new Set(prev);
                next.delete(productId);
                return next;
            });
            toast.info('💔 Removed from favorites');
        }
    } catch {
        toast.error('Login to favorite dishes');
    }
  };

  const getImageUrl = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80';
    if (url.startsWith('http')) return url;
    return `${IMAGE_BASE_URL}${url}`;
  };

  return (
    <CustomerLayout>
      <div className="cl-container">
        {/* Sticky Header */}
        <div className="cl-header">
            <div className="cl-header-row">
                <button className="cl-back-btn" onClick={() => navigate('/customer/home')}>
                    <ChevronLeft size={22} />
                </button>
                <div className="cl-search-wrap">
                    <Search size={18} className="cl-search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search for dishes..."
                        className="cl-search-input"
                        value={coreFilters.search}
                        onChange={(e) => setCoreFilters({...coreFilters, search: e.target.value})}
                    />
                    {coreFilters.search && <X size={16} onClick={() => setCoreFilters({...coreFilters, search: ''})} />}
                </div>
            </div>

            {/* Fast Food Type Filters */}
            <div className="pill-scroller">
                <button className={`pill-soft ${coreFilters.food_type.length === 0 ? 'active' : ''}`} onClick={() => setCoreFilters({...coreFilters, food_type: []})}>All</button>
                <button className={`pill-soft ${coreFilters.food_type.includes('Veg') ? 'active' : ''}`} onClick={() => toggleCoreFilter('food_type', 'Veg')} style={{ color: '#22c55e', borderColor: coreFilters.food_type.includes('Veg') ? '#22c55e' : '' }}>Veg</button>
                <button className={`pill-soft ${coreFilters.food_type.includes('Non-Veg') ? 'active' : ''}`} onClick={() => toggleCoreFilter('food_type', 'Non-Veg')} style={{ color: '#ef4444', borderColor: coreFilters.food_type.includes('Non-Veg') ? '#ef4444' : '' }}>Non-Veg</button>
                <div style={{ width: '1px', height: '20px', background: '#e2e8f0', margin: 'auto 4px' }}></div>
                <button className={`pill-soft ${activeFiltersCount > 0 ? 'active' : ''}`} onClick={() => { setTempFilters({...activeFilters}); setShowFiltersModal(true); }}>
                    <SlidersHorizontal size={14} /> Filters {activeFiltersCount > 0 && <span className="filter-count-badge ms-1">{activeFiltersCount}</span>}
                </button>
            </div>
        </div>

        {/* Categories Bar */}
        <div className="cl-categories-bar pill-scroller" style={{ background: 'white', padding: '10px 16px', borderBottom: '1px solid #f1f5f9' }}>
            {categories.map(cat => (
                <button 
                    key={cat.id}
                    className={`pill ${coreFilters.category_id.includes(cat.id.toString()) ? 'active' : ''}`}
                    onClick={() => toggleCoreFilter('category_id', cat.id.toString())}
                >
                    {cat.name}
                </button>
            ))}
        </div>

        {/* Results */}
        <div className="cl-body" style={{ padding: '16px' }}>
            <div className="cl-results-info mb-3 d-flex justify-content-between align-items-center">
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748b' }}>{filteredProducts.length} DISHES FOUND</span>
                {activeFiltersCount > 0 && (
                    <button className="btn btn-link btn-sm text-decoration-none text-primary p-0" onClick={handleClearAll} style={{ fontSize: '0.8rem', fontWeight: '700' }}>Reset All</button>
                )}
            </div>

            {loading ? (
                <div className="d-flex flex-column gap-3">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="food-card" style={{ height: '120px', opacity: 0.5, background: '#f1f5f9' }}></div>
                    ))}
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="cl-empty">
                    <div className="cl-empty-icon">🍽️</div>
                    <h3 className="cl-empty-title">No dishes match your filters</h3>
                    <p className="cl-empty-sub">Try adjusting your preferences or search term.</p>
                    <button className="btn btn-primary mt-3" onClick={handleClearAll}>Clear All</button>
                </div>
            ) : (
                <div className="cl-food-list">
                    {filteredProducts.map(product => {
                        const cartItem = cart[product.id];
                        return (
                            <div key={product.id} className="food-card animate-fade-in shadow-sm">
                                <div className="food-card-content">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div className={`veg-badge ${product.food_type?.toLowerCase()}`} style={{ marginBottom: '8px' }}></div>
                                        <button className="btn p-0 border-0" onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}>
                                            <Heart 
                                                size={20} 
                                                fill={favorites.has(product.id) ? "#ef4444" : "none"} 
                                                color={favorites.has(product.id) ? "#ef4444" : "#94a3b8"} 
                                            />
                                        </button>
                                    </div>
                                    <h3 className="food-card-title">{product.name}</h3>
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <div className="badge-soft-warning px-1 rounded small d-flex align-items-center gap-1" style={{ fontSize: '0.7rem', background: '#fff7ed', color: '#f59e0b', padding: '2px 6px' }}>
                                            <Star size={10} fill="#f59e0b" /> {product.rating || '4.0'}
                                        </div>
                                        <div className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                                            <Clock size={10} /> {product.delivery_time || 30} mins
                                        </div>
                                    </div>
                                    <p className="food-card-price">₹{product.price}</p>
                                    <p className="text-muted small mt-2" style={{ lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '0.8rem' }}>
                                        {product.description || 'Deliciously prepared with fresh ingredients and authentic spices.'}
                                    </p>
                                    <div className="mt-2 d-flex flex-wrap gap-1">
                                        {product.has_offer && <span className="badge bg-success-soft text-success border-0 px-2 py-1" style={{ fontSize: '0.65rem', background: '#ecfdf5' }}>% OFFER</span>}
                                        {product.free_delivery && <span className="badge bg-blue-soft text-primary border-0 px-2 py-1" style={{ fontSize: '0.65rem', background: '#eff6ff' }}>FREE DELIVERY</span>}
                                    </div>
                                </div>
                                <div className="food-card-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ position: 'relative' }}>
                                        <img src={getImageUrl(product.image_url)} alt={product.name} className="food-card-img" />
                                        <div style={{ position: 'absolute', bottom: '-15px', left: '50%', transform: 'translateX(-50%)' }}>
                                            {(!cartItem || cartItem.qty === 0) ? (
                                                <button className="btn btn-primary btn-sm px-4" onClick={() => addToCart(product)} style={{ boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)', borderRadius: '8px', fontWeight: '800' }}>
                                                    ADD
                                                </button>
                                            ) : (
                                                <div className="qty-selector shadow-sm" style={{ background: 'white', borderRadius: '8px', border: '1px solid var(--primary)', padding: '2px' }}>
                                                    <button className="qty-btn" onClick={() => updateQty(product.id, -1)}>−</button>
                                                    <span className="qty-value" style={{ width: '25px', color: 'var(--primary)', fontWeight: '800' }}>{cartItem.qty}</span>
                                                    <button className="qty-btn" onClick={() => updateQty(product.id, 1)}>+</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '15px' }}>customisable</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

        {/* Filters Drawer / Modal */}
        {showFiltersModal && (
            <div className="drawer-overlay" onClick={() => setShowFiltersModal(false)}>
                <div className="drawer-container" onClick={e => e.stopPropagation()}>
                    <div className="drawer-header">
                        <h3>Filters</h3>
                        <button className="btn-close-drawer" onClick={() => setShowFiltersModal(false)} style={{ background: 'none', border: 'none' }}><X size={24} /></button>
                    </div>

                    <div className="drawer-body">
                        {/* Sort By */}
                        <div className="filter-section">
                            <p className="filter-title">Sort By</p>
                            <div className="sort-options">
                                {[
                                    { label: 'Newest First', value: 'newest' },
                                    { label: 'Price: Low to High', value: 'price_low' },
                                    { label: 'Price: High to Low', value: 'price_high' },
                                    { label: 'Top Rated', value: 'top_rated' }
                                ].map(opt => (
                                    <div 
                                        key={opt.value} 
                                        className={`sort-option ${sortBy === opt.value ? 'active' : ''}`}
                                        onClick={() => setSortBy(opt.value)}
                                    >
                                        <span className="sort-label">{opt.label}</span>
                                        {sortBy === opt.value && <Check size={18} />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Offers */}
                        <div className="filter-section">
                            <p className="filter-title">Offers</p>
                            <div className="filter-options">
                                <div 
                                    className={`filter-pill ${tempFilters.offers.includes('hasOffer') ? 'active' : ''}`}
                                    onClick={() => toggleArrayFilter(setTempFilters, 'offers', 'hasOffer')}
                                >
                                    <Percent size={14} /> On Offer
                                </div>
                                <div 
                                    className={`filter-pill ${tempFilters.offers.includes('freeDelivery') ? 'active' : ''}`}
                                    onClick={() => toggleArrayFilter(setTempFilters, 'offers', 'freeDelivery')}
                                >
                                    <Clock size={14} /> Free Delivery
                                </div>
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="filter-section">
                            <p className="filter-title">Price Range</p>
                            <div className="filter-options">
                                {PRICE_RANGES.map(range => (
                                    <div 
                                        key={range.value}
                                        className={`filter-pill ${tempFilters.priceRange.includes(range.value) ? 'active' : ''}`}
                                        onClick={() => toggleArrayFilter(setTempFilters, 'priceRange', range.value)}
                                    >
                                        {range.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Rating */}
                        <div className="filter-section">
                            <p className="filter-title">Rating</p>
                            <div className="filter-options">
                                {RATING_OPTIONS.map(opt => (
                                    <div 
                                        key={opt.value}
                                        className={`filter-pill radio ${tempFilters.rating === opt.value ? 'active' : ''}`}
                                        onClick={() => setTempFilters({...tempFilters, rating: tempFilters.rating === opt.value ? null : opt.value})}
                                    >
                                        <Star size={14} fill={tempFilters.rating === opt.value ? 'currentColor' : 'none'} /> {opt.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Delivery Time */}
                        <div className="filter-section">
                            <p className="filter-title">Delivery Time</p>
                            <div className="filter-options">
                                {TIME_OPTIONS.map(opt => (
                                    <div 
                                        key={opt.value}
                                        className={`filter-pill radio ${tempFilters.deliveryTime === opt.value ? 'active' : ''}`}
                                        onClick={() => setTempFilters({...tempFilters, deliveryTime: tempFilters.deliveryTime === opt.value ? null : opt.value})}
                                    >
                                        {opt.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Spice Level */}
                        <div className="filter-section">
                            <p className="filter-title">Spice Level</p>
                            <div className="filter-options">
                                {SPICE_OPTIONS.map(opt => (
                                    <div 
                                        key={opt}
                                        className={`filter-pill ${tempFilters.spiceLevel.includes(opt) ? 'active' : ''}`}
                                        onClick={() => toggleArrayFilter(setTempFilters, 'spiceLevel', opt)}
                                    >
                                        {opt}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Dietary Preference */}
                        <div className="filter-section">
                            <p className="filter-title">Dietary Preference</p>
                            <div className="filter-options">
                                {DIETARY_OPTIONS.map(opt => (
                                    <div 
                                        key={opt}
                                        className={`filter-pill ${tempFilters.dietary.includes(opt) ? 'active' : ''}`}
                                        onClick={() => toggleArrayFilter(setTempFilters, 'dietary', opt)}
                                    >
                                        {opt}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="drawer-footer">
                        <button className="btn-clear" onClick={handleClearAll}>Clear All</button>
                        <button className="btn-apply" onClick={handleApplyFilters}>Apply Filters</button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default CustomerListing;
