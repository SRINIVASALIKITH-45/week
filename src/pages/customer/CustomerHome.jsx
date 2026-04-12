import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronDown, Bell, Star, Clock, ChevronRight, Flame, Utensils, Heart, Sparkles, Gift, CheckCircle, Zap, ShieldCheck } from 'lucide-react';
import { CustomerAuthContext } from '../../context/CustomerAuthContext';
import CustomerLayout from '../../components/CustomerLayout';
import api from '../../services/api';
import { IMAGE_BASE_URL } from '../../config';
import './CustomerHome.css';

const CustomerHome = () => {
  const { customer } = useContext(CustomerAuthContext);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [promoCoupon, setPromoCoupon] = useState(null);
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: 'Tirupati Hubspot',
    rating: 4.8,
    reviews: '2k+',
    cuisine: 'North Indian, Chinese, Continental',
    status: 'Open Now',
    time: '25-30 min'
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [catRes, prodRes, settingsRes, couponsRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products', { params: { limit: 10, is_bestseller: 1 } }),
        api.get('/settings'),
        api.get('/coupons').catch(() => ({ data: [] }))
      ]);

      setCategories(catRes.data || []);
      // Handle both formats: object with products array or direct array
      const products = prodRes.data?.products || (Array.isArray(prodRes.data) ? prodRes.data : []);
      setFeaturedProducts(products.slice(0, 6));

      if (couponsRes.data && couponsRes.data.length > 0) {
        setPromoCoupon(couponsRes.data[0]);
      }

      // Fetch Favorites & Recommended
      const favRes = await api.get('/products/favorites').catch(() => ({ data: [] }));
      setFavorites(favRes.data || []);

      // Fake recommended (just shuffle products or pick a category)
      setRecommended(products.sort(() => 0.5 - Math.random()).slice(0, 6));
      
      const settings = settingsRes.data || {};
      
      setRestaurantInfo(prev => ({
        ...prev,
        name: settings.restaurant_name || 'Tirupati Hubspot',
        rating: settings.restaurant_rating || prev.rating,
        reviews: settings.restaurant_reviews || prev.reviews,
        cuisine: settings.restaurant_cuisine || prev.cuisine,
        time: settings.restaurant_time || prev.time,
        status: settings.is_restaurant_open === 'false' ? 'Closed' : 'Open Now'
      }));

    } catch (err) {
      console.error('Error fetching data:', err);
      setCategories([]);
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/customer/restaurants?search=${searchQuery}`);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80';
    if (url.startsWith('http')) return url;
    return `${IMAGE_BASE_URL}${url}`;
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column', gap: '15px' }}>
          <div className="cp-spinner" />
          <p style={{ color: '#64748b', fontWeight: '600', fontFamily: 'Outfit' }}>Preparing your table...</p>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="ch-container">
        {/* Restaurant Hero Section */}
        <div className="ch-hero">
            <div className="ch-hero-overlay"></div>
            <img 
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80" 
                alt="Restaurant" 
                className="ch-hero-img" 
            />
            <div className="ch-hero-content">
                <div className="ch-badge-status">{restaurantInfo.status}</div>
                <h1 className="ch-res-name">{restaurantInfo.name}</h1>
                <p className="ch-res-cuisines">{restaurantInfo.cuisine}</p>
                <div className="ch-res-meta">
                    <div className="ch-meta-item">
                        <div className="ch-rating-box">
                            {restaurantInfo.rating} <Star size={14} fill="white" />
                        </div>
                        <span className="ch-meta-sub">{restaurantInfo.reviews} reviews</span>
                    </div>
                    <div className="ch-res-divider"></div>
                    <div className="ch-meta-item">
                        <div className="ch-meta-val">{restaurantInfo.time}</div>
                        <span className="ch-meta-sub">Delivery Time</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Search & Location Bar */}
        <div className="ch-search-section">
            <div className="ch-location-row" onClick={() => navigate('/customer/profile')}>
                <MapPin size={18} color="var(--primary)" />
                <span className="ch-location-text">Deliver to: <strong>{customer ? customer.name : 'Current Location'}</strong></span>
                <ChevronDown size={16} />
            </div>
            
            <form className="ch-search-form" onSubmit={handleSearch}>
                <Search size={20} className="ch-search-icon" />
                <input 
                    type="text" 
                    placeholder={`Search in ${restaurantInfo.name}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="ch-search-input"
                />
            </form>
        </div>

        <div className="ch-body">
            {/* Quick Categories */}
            <div className="ch-section">
                <div className="ch-section-header">
                    <h2 className="ch-section-title">What are you craving?</h2>
                </div>
                <div className="ch-categories-grid">
                    {categories.slice(0, 8).map(cat => (
                        <div key={cat.id} className="ch-cat-card" onClick={() => navigate(`/customer/restaurants?category=${cat.name}`)}>
                            <div className="ch-cat-icon-wrap">
                                <Utensils size={24} color="var(--primary)" />
                            </div>
                            <span className="ch-cat-name">{cat.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Popular Items */}
            <div className="ch-section">
                <div className="ch-section-header">
                    <div className="d-flex align-items-center gap-2">
                        <Flame size={20} color="#FF4D4D" />
                        <h2 className="ch-section-title">Must Tries</h2>
                    </div>
                    <button className="ch-btn-text" onClick={() => navigate('/customer/restaurants')}>
                        Full Menu <ChevronRight size={16} />
                    </button>
                </div>
                
                <div className="ch-horizontal-scroll">
                    {featuredProducts.map(product => (
                        <div key={product.id} className="ch-product-card-mini" onClick={() => navigate('/customer/restaurants')}>
                             <div className="ch-mini-img-wrap">
                                <img src={getImageUrl(product.image_url)} alt={product.name} />
                                <div className={`veg-badge ${product.food_type?.toLowerCase()}`} style={{ position: 'absolute', top: '8px', left: '8px' }}></div>
                             </div>
                             <div className="ch-mini-info">
                                <h4 className="ch-mini-name">{product.name}</h4>
                                <div className="ch-mini-meta">
                                    <span className="ch-mini-rating"><Star size={10} fill="#f59e0b" color="#f59e0b" /> 4.5</span>
                                    <span className="ch-mini-price">₹{product.price}</span>
                                </div>
                             </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Your Favorites */}
            {favorites.length > 0 && (
                <div className="ch-section">
                    <div className="ch-section-header">
                        <div className="d-flex align-items-center gap-2">
                            <Heart fill="#ef4444" color="#ef4444" size={20} />
                            <h2 className="ch-section-title">Your Favorites</h2>
                        </div>
                    </div>
                    <div className="ch-horizontal-scroll">
                        {favorites.map(product => (
                            <div key={product.id} className="ch-product-card-mini" onClick={() => navigate('/customer/restaurants')}>
                                <div className="ch-mini-img-wrap">
                                    <img src={getImageUrl(product.image_url)} alt={product.name} />
                                </div>
                                <div className="ch-mini-info">
                                    <h4 className="ch-mini-name">{product.name}</h4>
                                    <span className="ch-mini-price">₹{product.price}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommended for You */}
            <div className="ch-section">
                <div className="ch-section-header">
                    <div className="d-flex align-items-center gap-2">
                        <Sparkles fill="#4f46e5" color="#4f46e5" size={20} />
                        <h2 className="ch-section-title">Recommended for You</h2>
                    </div>
                </div>
                <div className="ch-horizontal-scroll">
                    {recommended.map(product => (
                        <div key={product.id} className="ch-product-card-mini" onClick={() => navigate('/customer/restaurants')}>
                            <div className="ch-mini-img-wrap">
                                <img src={getImageUrl(product.image_url)} alt={product.name} />
                                <div className="badge bg-white text-primary position-absolute p-1" style={{ top: 8, right: 8, fontSize: '0.6rem', borderRadius: '4px' }}>AI Match</div>
                            </div>
                            <div className="ch-mini-info">
                                <h4 className="ch-mini-name">{product.name}</h4>
                                <span className="ch-mini-price">₹{product.price}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Promo Banner */}
            {promoCoupon && (
                <div className="ch-promo">
                    <div className="ch-promo-content">
                        <h3>Special Offer</h3>
                        <p>{promoCoupon.desc}</p>
                        <button className="ch-promo-btn">Use Code: {promoCoupon.code}</button>
                    </div>
                    <div className="ch-promo-img">
                        <Gift size={48} color="white" strokeWidth={1.5} style={{ opacity: 0.9 }} />
                    </div>
                </div>
            )}

            {/* Why Order From Us */}
            <div className="ch-section ch-features">
                <div className="ch-feature-item">
                    <div className="ch-feat-icon"><CheckCircle size={24} color="#16a34a" /></div>
                    <span>Quality First</span>
                </div>
                <div className="ch-feature-item">
                    <div className="ch-feat-icon"><Zap size={24} color="#f59e0b" fill="#f59e0b" /></div>
                    <span>Super Fast</span>
                </div>
                <div className="ch-feature-item">
                    <div className="ch-feat-icon"><ShieldCheck size={24} color="#4f46e5" /></div>
                    <span>Hygienic</span>
                </div>
            </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CustomerHome;
