import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, CreditCard, Banknote, ShieldCheck, 
  MapPin, Clock, Receipt, CheckCircle2, ShoppingBag, 
  ArrowRight, Info, AlertCircle, Plus 
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { CustomerAuthContext } from '../../context/CustomerAuthContext';
import CustomerLayout from '../../components/CustomerLayout';
import api from '../../services/api';
import { toast } from 'sonner';
import './CustomerPayment.css';

const CustomerPayment = () => {
  const navigate = useNavigate();
  const { customer } = useContext(CustomerAuthContext);
  const { 
    cart, clearCart, itemTotal, deliveryCharge, 
    taxes, couponDiscount, grandTotal, totalItems, coupon 
  } = useCart();

  const [placing, setPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  
  const [deliveryAddress, setDeliveryAddress] = useState(customer?.address || 'Your saved delivery address');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);

  useEffect(() => {
    if (customer?.address) {
      setDeliveryAddress(customer.address);
    }
    const fetchAddresses = async () => {
      try {
        const res = await api.get('/customer-profile/addresses');
        if (res.data && res.data.length > 0) {
          setSavedAddresses(res.data);
          if (deliveryAddress === 'Your saved delivery address' || deliveryAddress === customer?.address) {
            setDeliveryAddress(res.data[0].address);
          }
        }
      } catch (err) {
        console.error('Failed to fetch addresses', err);
      }
    };
    fetchAddresses();
  }, [customer]);

  const handleSaveToProfile = async () => {
    if (!deliveryAddress || deliveryAddress.trim() === '') return toast.error('Address cannot be empty');
    try {
      await api.post('/customer-profile/addresses', { label: 'Saved from Checkout', address: deliveryAddress });
      toast.success('Address saved to profile!');
      // Refresh the list
      const res = await api.get('/customer-profile/addresses');
      setSavedAddresses(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save address to profile: ' + (err.response?.data?.message || err.message));
    }
  };

  // Redirect if cart is empty and not in success state
  useEffect(() => {
    if (totalItems === 0 && !orderSuccess) {
      navigate('/customer/restaurants');
    }
  }, [totalItems, orderSuccess, navigate]);

  const handleConfirmOrder = async () => {
    if (!customer) {
      toast.error('Please login to place an order');
      navigate('/customer/profile');
      return;
    }

    setPlacing(true);
    try {
      const items = Object.values(cart).map(item => ({
        product_id: item.id,
        quantity: item.qty,
        unit_price: item.price
      }));

      const response = await api.post('/orders/customer', {
        items,
        total_price: grandTotal,
        coupon_code: coupon?.code || null,
        delivery_address: deliveryAddress,
      });

      setOrderId(response.data.order_id_string);
      setOrderSuccess(true);
      clearCart();
      toast.success('Order Placed Successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (orderSuccess) {
    return (
      <CustomerLayout>
        <div className="payment-success-container">
          <div className="success-card">
            <div className="success-icon-wrapper">
              <div className="success-icon-bg"></div>
              <CheckCircle2 size={80} className="success-icon" />
            </div>
            
            <h1 className="success-title">Order Placed Successfully</h1>
            <p className="success-subtitle">Sit back and relax while we prepare your meal.</p>
            
            <div className="order-id-box">
              <span className="order-id-label">Order ID</span>
              <span className="order-id-value">{orderId}</span>
            </div>

            <div className="success-actions">
              <button 
                className="btn-track-order"
                onClick={() => navigate('/customer/orders')}
              >
                Track Your Order <ArrowRight size={18} />
              </button>
              <button 
                className="btn-home-success"
                onClick={() => navigate('/customer/home')}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="cp-container">
        {/* Header */}
        <div className="cp-header">
          <button className="cp-back-btn" onClick={() => navigate(-1)}>
            <ChevronLeft size={24} />
          </button>
          <div className="cp-header-title">
            <h1>Payment Method</h1>
            <p>Complete your order</p>
          </div>
        </div>

        <div className="cp-content">
          {/* Payment Method Selection */}
          <div className="cp-section">
            <h2 className="section-title">Available Methods</h2>
            
            <div className="payment-options">
              <div className="payment-option active">
                <div className="option-icon-wrapper">
                  <Banknote size={24} />
                </div>
                <div className="option-details">
                  <span className="option-name">Cash on Delivery</span>
                  <span className="option-desc">Pay when your food arrives</span>
                </div>
                <div className="option-check">
                  <div className="check-circle active"></div>
                </div>
              </div>

              <div className="payment-option disabled">
                <div className="option-icon-wrapper">
                  <CreditCard size={24} />
                </div>
                <div className="option-details">
                  <span className="option-name">Online Payment</span>
                  <span className="option-desc">Temporarily unavailable</span>
                </div>
                <Info size={16} className="info-icon" />
              </div>
            </div>
            
            <div className="cod-notice">
              <ShieldCheck size={16} />
              <span>Safe & Secure Cash on Delivery</span>
            </div>
          </div>

          {/* Delivery Snapshot */}
          <div className="cp-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Delivery To</h2>
            </div>
            
            <div className="delivery-snapshot" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              
              <div className="d-flex flex-column gap-3 w-100">
                {savedAddresses.length > 0 ? (
                  <div className="saved-address-list">
                    <p className="text-muted small fw-bold mb-2">Select a Saved Address:</p>
                    {savedAddresses.map(addr => (
                      <div 
                        key={addr.id} 
                        onClick={() => setDeliveryAddress(addr.address)}
                        className="p-3 mb-2 rounded border cursor-pointer d-flex align-items-center gap-3"
                        style={{ 
                          borderColor: deliveryAddress === addr.address ? 'var(--primary)' : '#e2e8f0',
                          backgroundColor: deliveryAddress === addr.address ? '#f0fdf4' : '#fff',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div className="snapshot-icon" style={{ 
                          background: deliveryAddress === addr.address ? 'var(--primary)' : '#f8fafc',
                          color: deliveryAddress === addr.address ? '#fff' : '#94a3b8' 
                        }}>
                          <MapPin size={20} />
                        </div>
                        <div>
                          <span className="fw-bold d-block" style={{ fontSize: '0.9rem' }}>{addr.label}</span>
                          <span className="text-muted text-break" style={{ fontSize: '0.85rem' }}>{addr.address}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted small">No addresses saved yet.</p>
                )}

                <div className="mt-2">
                  <p className="text-muted small fw-bold mb-2">Or enter a Custom Address:</p>
                  <textarea 
                    className="form-control mb-2" 
                    rows="2" 
                    value={savedAddresses.some(a => a.address === deliveryAddress) ? '' : deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    onFocus={() => {
                       if (savedAddresses.some(a => a.address === deliveryAddress)) {
                          setDeliveryAddress('');
                       }
                    }}
                    placeholder="Type a new delivery address here..."
                    style={{ 
                      fontSize: '0.9rem', 
                      resize: 'none',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: 'none'
                    }}
                  />
                  {deliveryAddress && !savedAddresses.some(a => a.address === deliveryAddress) && (
                    <div className="d-flex justify-content-between align-items-center mt-2">
                       <div className="snapshot-time text-success" style={{ cursor: 'pointer' }} onClick={handleSaveToProfile}>
                         <Plus size={14} />
                         <span className="fw-bold">Save this address</span>
                       </div>
                      <div className="snapshot-time">
                        <Clock size={14} />
                        <span>30-40 mins estimate</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Order Summary Snapshot */}
          <div className="cp-section">
            <h2 className="section-title">Order Summary</h2>
            <div className="summary-card">
              <div className="summary-items">
                {Object.values(cart).map(item => (
                  <div key={item.id} className="summary-item">
                    <span className="item-qty">{item.qty}x</span>
                    <span className="item-name">{item.name}</span>
                    <span className="item-price">₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>
              <div className="summary-divider"></div>
              <div className="summary-bill">
                <div className="bill-row">
                  <span>Item Total</span>
                  <span>₹{itemTotal}</span>
                </div>
                {deliveryCharge > 0 && (
                  <div className="bill-row">
                    <span>Delivery Fee</span>
                    <span>₹{deliveryCharge}</span>
                  </div>
                )}
                <div className="bill-row">
                  <span>Taxes & Charges</span>
                  <span>₹{taxes}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="bill-row discount">
                    <span>Coupon Discount</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}
                <div className="bill-total">
                  <span>Grand Total</span>
                  <span>₹{grandTotal}</span>
                </div>
              </div>
            </div>
          </div>

            <div className="cancellation-policy">
                <AlertCircle size={16} />
                <p>Cancellation Policy: Orders cannot be cancelled once placed.</p>
            </div>

            {/* Confirm Order Button in normal flow */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px', padding: '20px', background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
              <div className="footer-price" style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="label" style={{ fontSize: '0.8rem', color: '#64748b' }}>Total to pay</span>
                <span className="value" style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b', fontFamily: 'Outfit' }}>₹{grandTotal}</span>
              </div>
              <button 
                className="btn btn-primary d-flex align-items-center gap-2 py-3 px-4" 
                style={{ borderRadius: '14px', boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)', fontWeight: '700' }}
                onClick={handleConfirmOrder}
                disabled={placing}
              >
                {placing ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : <ShoppingBag size={18} />}
                {placing ? 'Processing...' : 'Confirm Order'}
              </button>
            </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CustomerPayment;
