import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Trash2, Tag, ShoppingBag,
  Plus, Minus, AlertCircle, CheckCircle2, ChevronRight,
  Clock, MapPin, Receipt, MessageCircle, X
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { CustomerAuthContext } from '../../context/CustomerAuthContext';
import CustomerLayout from '../../components/CustomerLayout';
import api from '../../services/api';
import { toast } from 'sonner';
import { IMAGE_BASE_URL } from '../../config';
import './CustomerCart.css';

const getImageUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80';
  if (url.startsWith('http')) return url;
  return `${IMAGE_BASE_URL}${url}`;
};

const CustomerCart = () => {
  const navigate = useNavigate();
  const { customer } = useContext(CustomerAuthContext);
  const {
    cart, updateQty, removeFromCart, clearCart,
    applyCoupon, removeCoupon, coupon,
    itemTotal, deliveryCharge, taxes, couponDiscount, grandTotal, totalItems
  } = useCart();

  const [coupons, setCoupons] = useState([]);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [showCouponPanel, setShowCouponPanel] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [restaurantName, setRestaurantName] = useState('Tirupati Hubspot');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/coupons');
      setCoupons(res.data || []);
      
      const settingsRes = await api.get('/settings');
      if (settingsRes.data && settingsRes.data.restaurant_name) {
        setRestaurantName(settingsRes.data.restaurant_name);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    try {
      const res = await api.post('/coupons/validate', { code, cartTotal: itemTotal });
      setCouponError('');
      setCouponInput('');
      applyCoupon(res.data);
      setShowCouponPanel(false);
      toast.success('Coupon applied!');
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon');
      toast.error(err.response?.data?.message || 'Invalid coupon');
    }
  };

  const handleProceedToPayment = () => {
    if (!customer) {
      toast.error('Please login to proceed');
      navigate('/customer/profile');
      return;
    }
    navigate('/customer/payment');
  };

  const cartItems = Object.values(cart);

  if (cartItems.length === 0) {
    return (
      <CustomerLayout>
        <div className="cc-empty-page" style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}>
          <div style={{ background: '#f1f5f9', padding: '30px', borderRadius: '50%', marginBottom: '24px' }}>
            <ShoppingBag size={80} color="#94a3b8" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', fontFamily: 'Outfit', color: '#1e293b' }}>Your cart is empty</h2>
          <p style={{ color: '#64748b', marginBottom: '32px' }}>Your plate is waiting to be filled with favorites!</p>
          <button className="btn btn-primary px-5 py-3" onClick={() => navigate('/customer/restaurants')}>
            Browse Menu
          </button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="cc-container">
        {/* Header */}
        <div className="cc-header" style={{ padding: '16px', background: 'white', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f1f5f9', sticky: 'top', zIndex: 100 }}>
           <button className="cl-back-btn" onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: 0 }}>
            <ChevronLeft size={24} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, fontFamily: 'Outfit' }}>Checkout</h1>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>{totalItems} items • {restaurantName}</p>
          </div>
        </div>

        <div className="cc-body" style={{ padding: '16px' }}>
            {/* Items */}
            <div className="cc-card" style={{ background: 'white', borderRadius: '20px', padding: '16px', marginBottom: '16px', border: '1px solid #f1f5f9' }}>
                <div className="d-flex align-items-center gap-2 mb-3" style={{ fontSize: '0.9rem', fontWeight: '800', fontFamily: 'Outfit', color: '#64748b' }}>
                    <Receipt size={18} />
                    <span>Selected Items</span>
                </div>
                <div className="cc-items-list d-flex flex-column gap-3">
                    {cartItems.map(item => (
                        <div key={item.id} className="d-flex justify-content-between align-items-start">
                            <div className="cc-item-info">
                                <div className="d-flex align-items-center gap-2 mb-1">
                                    <div className={`veg-badge ${item.food_type?.toLowerCase()}`}></div>
                                    <span className="fw-bold" style={{ fontSize: '0.95rem' }}>{item.name}</span>
                                </div>
                                <span className="text-muted small">₹{item.price}</span>
                            </div>
                            <div className="cc-item-right d-flex align-items-center gap-3">
                                <div className="qty-selector small shadow-sm d-flex align-items-center" style={{ border: '1px solid var(--primary)', borderRadius: '8px', overflow: 'hidden' }}>
                                    <button className="btn btn-sm px-2 text-primary" onClick={() => updateQty(item.id, -1)}>−</button>
                                    <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: '800', color: 'var(--primary)', fontSize: '0.85rem' }}>{item.qty}</span>
                                    <button className="btn btn-sm px-2 text-primary" onClick={() => updateQty(item.id, 1)}>+</button>
                                </div>
                                <span className="fw-bold" style={{ minWidth: '50px', textAlign: 'right' }}>₹{item.price * item.qty}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cooking Instructions */}
            <div className="cc-card" style={{ background: 'white', borderRadius: '20px', marginBottom: '16px', border: '1px solid #f1f5f9' }}>
                <div className="p-3 d-flex align-items-center gap-2" style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem', fontWeight: '800', color: '#64748b' }}>
                    <MessageCircle size={18} />
                    <span>Cooking Instructions</span>
                </div>
                <div className="p-3">
                    <textarea 
                        className="form-control" 
                        placeholder="E.g. Don't add onions, make it spicy..."
                        rows="2"
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        style={{ border: 'none', background: '#f8fafc', borderRadius: '12px', fontSize: '0.9rem' }}
                    ></textarea>
                </div>
            </div>

            {/* Coupons */}
            {coupon ? (
                <div className="p-3 mb-3 d-flex justify-content-between align-items-center" style={{ background: '#ecfdf5', borderRadius: '16px', border: '1px dashed #10b981' }}>
                    <div className="d-flex align-items-center gap-2">
                        <CheckCircle2 size={18} color="#10b981" />
                        <div>
                            <p className="m-0 fw-bold" style={{ color: '#065f46' }}>{coupon.code} applied!</p>
                            <p className="m-0 small" style={{ color: '#059669' }}>You saved ₹{coupon.discount}</p>
                        </div>
                    </div>
                    <button className="btn btn-link btn-sm text-danger text-decoration-none" onClick={removeCoupon}>Remove</button>
                </div>
            ) : (
                <div className="cc-card p-3 mb-3 d-flex justify-content-between align-items-center" onClick={() => setShowCouponPanel(true)} style={{ cursor: 'pointer', background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                    <div className="d-flex align-items-center gap-2">
                        <Tag size={18} color="var(--primary)" />
                        <span className="fw-bold">Apply Coupon</span>
                    </div>
                    <ChevronRight size={18} color="#94a3b8" />
                </div>
            )}

            {/* Bill Details */}
            <div className="cc-card" style={{ background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9', marginBottom: '16px' }}>
                <div className="p-3 border-bottom" style={{ fontSize: '0.9rem', fontWeight: '800', color: '#64748b' }}>
                    <span>Bill Details</span>
                </div>
                <div className="p-3">
                    <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted small">Item Total</span>
                        <span className="small">₹{itemTotal}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted small">Delivery partner fee</span>
                        <span className="small">₹{deliveryCharge}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted small">Taxes and Charges</span>
                        <span className="small">₹{taxes}</span>
                    </div>
                    {couponDiscount > 0 && (
                        <div className="d-flex justify-content-between mb-2 text-success fw-bold small">
                            <span>Coupon Discount</span>
                            <span>-₹{couponDiscount}</span>
                        </div>
                    )}
                    <div style={{ height: '1px', background: '#f1f5f9', margin: '15px 0', borderStyle: 'dashed' }}></div>
                    <div className="d-flex justify-content-between align-items-center fw-bolder" style={{ color: '#1e293b', fontFamily: 'Outfit', fontSize: '1.2rem' }}>
                        <span>To Pay</span>
                        <span>₹{grandTotal}</span>
                    </div>
                </div>
            </div>

            {/* Cancellation Notice */}
            {/* Cancellation Notice */}
            <div className="p-3 d-flex gap-2" style={{ background: '#fff7ed', borderRadius: '16px', marginBottom: '20px' }}>
                <AlertCircle size={18} color="#f59e0b" />
                <p className="m-0 small" style={{ color: '#9a3412', fontSize: '0.8rem' }}>
                    <strong>Review your order!</strong> Once placed, orders cannot be cancelled or modified. 
                </p>
            </div>

            {/* Proceed Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 30px', padding: '20px', background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                <div>
                    <p className="m-0 small text-muted">Total amount</p>
                    <h3 className="m-0 fw-bold" style={{ color: '#1e293b', fontFamily: 'Outfit' }}>₹{grandTotal}</h3>
                </div>
                <button 
                    className="btn btn-primary d-flex align-items-center gap-2 py-3 px-4" 
                    style={{ borderRadius: '14px', boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)', fontWeight: '700' }}
                    onClick={handleProceedToPayment}
                    disabled={placing}
                >
                    {placing ? 'Processing...' : 'Proceed to Payment'} <ChevronRight size={18} />
                </button>
            </div>
        </div>

        {/* Coupon Panel Modal */}
        {showCouponPanel && (
            <div className="modal-overlay" onClick={() => setShowCouponPanel(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'flex-end' }}>
                <div className="modal-container w-100" style={{ background: 'white', position: 'absolute', bottom: 0, borderRadius: '24px 24px 0 0', padding: '24px', animation: 'slideUp 0.3s ease-out' }} onClick={e => e.stopPropagation()}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="fw-bold m-0" style={{ fontFamily: 'Outfit' }}>Coupons for you</h3>
                        <button className="btn btn-link text-decoration-none text-muted p-0" onClick={() => setShowCouponPanel(false)}><X size={24} /></button>
                    </div>

                    <div className="d-flex gap-2 mb-4">
                        <input 
                            type="text" 
                            className="form-control flex-1 py-3" 
                            placeholder="Enter coupon code"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value)}
                            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                        />
                        <button className="btn btn-primary px-4" style={{ borderRadius: '12px' }} onClick={handleApplyCoupon}>Apply</button>
                    </div>

                    <div style={{ maxHeight: '40vh', overflowY: 'auto' }}>
                        {coupons.map(c => (
                            <div key={c.code} className="p-3 mb-3" style={{ border: '1px solid #f1f5f9', borderRadius: '16px', background: '#fdfdfd' }}>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="fw-bold px-3 py-1 bg-light rounded text-primary border border-primary border-opacity-25 small" style={{ letterSpacing: '1px' }}>{c.code}</span>
                                    <button 
                                        className="btn btn-link text-primary fw-bold p-0 text-decoration-none small" 
                                        onClick={() => { setCouponInput(c.code); handleApplyCoupon(); }}
                                        disabled={itemTotal < c.minOrder}
                                    >Apply</button>
                                </div>
                                <p className="m-0 fw-bold small">{c.desc}</p>
                                <p className="m-0 text-muted extra-small">Valid on orders above ₹{c.minOrder}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default CustomerCart;
