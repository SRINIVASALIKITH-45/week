import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Star, Clock, Share2, Heart,
  ShoppingCart, Flame, Leaf, Drumstick, Plus, Minus, Check
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import CustomerLayout from '../../components/CustomerLayout';
import api from '../../services/api';
import { IMAGE_BASE_URL } from '../../config';
import './CustomerProductDetail.css';

const SPICE_LEVELS = ['Mild', 'Medium', 'Spicy', 'Extra Spicy'];
const SPICE_ICONS = ['🌱', '🌶️', '🌶️🌶️', '🌶️🌶️🌶️'];

const ADDONS = [
  { id: 1, name: 'Extra Cheese', price: 30 },
  { id: 2, name: 'Extra Sauce', price: 20 },
  { id: 3, name: 'Garlic Bread', price: 40 },
  { id: 4, name: 'Jalapeños', price: 25 },
  { id: 5, name: 'Mushrooms', price: 35 },
];

const getImageUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80';
  if (url.startsWith('http')) return url;
  return `${IMAGE_BASE_URL}${url}`;
};

const CustomerProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart, updateQty } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [wishlisted, setWishlisted] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch {
        // fallback to null
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const toggleAddon = (addon) => {
    setSelectedAddons(prev =>
      prev.find(a => a.id === addon.id)
        ? prev.filter(a => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  const addonTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const totalPrice = product ? (product.price + addonTotal) * qty : 0;

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({ ...product, addons: selectedAddons, price: product.price + addonTotal }, qty);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 2000);
  };

  const cartQty = cart[product?.id]?.qty || 0;

  const spiceIndex = SPICE_LEVELS.indexOf(product?.spice_level);

  if (loading) {
    return (
      <CustomerLayout>
        <div className="cpd-skeleton-wrap">
          <div className="cp-skeleton" style={{ height: '320px', borderRadius: 0 }} />
          <div style={{ padding: '20px' }}>
            <div className="cp-skeleton" style={{ height: '24px', width: '70%', marginBottom: '12px' }} />
            <div className="cp-skeleton" style={{ height: '16px', width: '40%', marginBottom: '20px' }} />
            <div className="cp-skeleton" style={{ height: '80px', marginBottom: '20px' }} />
            <div className="cp-skeleton" style={{ height: '48px' }} />
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (!product) {
    return (
      <CustomerLayout>
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>😕</div>
          <h3>Product not found</h3>
          <button className="cp-btn-outline" style={{ marginTop: '16px' }} onClick={() => navigate('/customer/restaurants')}>
            Back to Menu
          </button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="cpd-container">
        {/* Hero Image */}
        <div className="cpd-hero">
          {!imgLoaded && <div className="cp-skeleton cpd-img-skeleton" />}
          <img
            src={getImageUrl(product.image_url)}
            alt={product.name}
            className={`cpd-hero-img ${imgLoaded ? 'loaded' : ''}`}
            onLoad={() => setImgLoaded(true)}
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80'; setImgLoaded(true); }}
          />
          {/* Gradient overlay */}
          <div className="cpd-hero-gradient" />

          {/* Top Buttons */}
          <div className="cpd-hero-btns">
            <button className="cpd-circle-btn" onClick={() => navigate(-1)}>
              <ChevronLeft size={22} />
            </button>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="cpd-circle-btn" onClick={() => setWishlisted(!wishlisted)}>
                <Heart size={20} fill={wishlisted ? '#ef4444' : 'none'} color={wishlisted ? '#ef4444' : '#1e1e1e'} />
              </button>
              <button className="cpd-circle-btn">
                <Share2 size={20} />
              </button>
            </div>
          </div>

          {/* Food Type Badge on image */}
          <div className="cpd-food-badge-wrap">
            <div className={`veg-badge ${product.food_type === 'Veg' ? 'veg' : 'non-veg'}`}
              style={{ background: 'white', padding: '3px' }} />
            <span className="cpd-food-type-label">{product.food_type}</span>
          </div>
        </div>

        {/* Content Card */}
        <div className="cpd-content">
          {/* Title Row */}
          <div className="cpd-title-row">
            <div style={{ flex: 1 }}>
              <h1 className="cpd-title">{product.name}</h1>
              {product.category?.name && (
                <span className="cp-tag cp-tag-orange" style={{ marginTop: '4px' }}>
                  {product.category.name}
                </span>
              )}
            </div>
            <div className="cpd-price-badge">
              <span className="cpd-price">₹{product.price}</span>
            </div>
          </div>

          {/* Ratings & Info */}
          <div className="cpd-meta-row">
            <div className="cpd-meta-chip">
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
              <span>{(product.rating || 4.2).toFixed(1)}</span>
            </div>
            <div className="cpd-meta-chip">
              <Clock size={14} color="#64748b" />
              <span>25–30 min</span>
            </div>
            {product.calories && (
              <div className="cpd-meta-chip">
                <Flame size={14} color="#FF6B35" />
                <span>{product.calories} cal</span>
              </div>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="cpd-section">
              <p className="cpd-desc">{product.description}</p>
            </div>
          )}

          <div className="cp-divider" />

          {/* Spice Level */}
          {product.spice_level && (
            <div className="cpd-section">
              <h3 className="cpd-section-title">🌶️ Spice Level</h3>
              <div className="cpd-spice-bar">
                {SPICE_LEVELS.map((level, i) => (
                  <div
                    key={level}
                    className={`cpd-spice-dot ${i <= spiceIndex ? 'active' : ''}`}
                    title={level}
                  >
                    <span className="cpd-spice-icon">{SPICE_ICONS[i]}</span>
                    <span className="cpd-spice-name">{level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="cp-divider" />

          {/* Add-ons */}
          <div className="cpd-section">
            <h3 className="cpd-section-title">🍴 Add-ons (Optional)</h3>
            <div className="cpd-addons">
              {ADDONS.map(addon => {
                const selected = selectedAddons.find(a => a.id === addon.id);
                return (
                  <button
                    key={addon.id}
                    className={`cpd-addon ${selected ? 'active' : ''}`}
                    onClick={() => toggleAddon(addon)}
                  >
                    <div className="cpd-addon-info">
                      {selected && <Check size={14} className="cpd-addon-check" />}
                      <span className="cpd-addon-name">{addon.name}</span>
                    </div>
                    <span className="cpd-addon-price">+₹{addon.price}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="cp-divider" />

          {/* Quantity Selector */}
          <div className="cpd-section cpd-qty-section">
            <h3 className="cpd-section-title">Quantity</h3>
            <div className="cpd-qty-ctrl">
              <button
                className="cpd-qty-btn"
                onClick={() => setQty(q => Math.max(1, q - 1))}
              >
                <Minus size={18} />
              </button>
              <span className="cpd-qty-val">{qty}</span>
              <button
                className="cpd-qty-btn"
                onClick={() => setQty(q => q + 1)}
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Nutritional Tags */}
          <div className="cpd-section">
            <div className="cpd-tags-row">
              {product.food_type === 'Veg' && (
                <span className="cp-tag cp-tag-green"><Leaf size={11} /> Pure Veg</span>
              )}
              {product.meal_type && (
                <span className="cp-tag cp-tag-blue">🕐 {product.meal_type}</span>
              )}
              {product.portion && (
                <span className="cp-tag cp-tag-purple">🍽️ {product.portion}</span>
              )}
            </div>
          </div>

          {/* Spacer for sticky button */}
          <div style={{ height: '100px' }} />
        </div>
      </div>

      {/* Sticky Add to Cart */}
      <div className="cpd-sticky-bar">
        <div className="cpd-sticky-info">
          <span className="cpd-sticky-label">Total</span>
          <span className="cpd-sticky-price">₹{totalPrice}</span>
        </div>

        {cartQty === 0 ? (
          <button
            className={`cpd-add-btn ${addedAnim ? 'added' : ''}`}
            onClick={handleAddToCart}
          >
            {addedAnim ? (
              <><Check size={18} /> Added!</>
            ) : (
              <><ShoppingCart size={18} /> Add to Cart</>
            )}
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="qty-selector">
              <button className="qty-btn" onClick={() => updateQty(product.id, -1)}>−</button>
              <span className="qty-value">{cartQty}</span>
              <button className="qty-btn" onClick={() => updateQty(product.id, 1)}>+</button>
            </div>
            <button className="cpd-view-cart-btn" onClick={() => navigate('/customer/cart')}>
              View Cart →
            </button>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default CustomerProductDetail;
