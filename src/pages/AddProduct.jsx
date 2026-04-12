import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'sonner';
import {
  UtensilsCrossed, Tag, Leaf, Flame, Egg,
  ChefHat, Sun, Moon, Coffee, Scissors, Pizza,
  Thermometer, Snowflake, IndianRupee, Package,
  FileText, ImagePlus, X, CheckCircle2, ArrowLeft,
  Layers, Star, Zap
} from 'lucide-react';
import './AddProduct.css';

const FOOD_TYPES = [
  { value: 'Veg',     label: 'Veg',     emoji: '🟢', icon: <Leaf size={16} />,  color: '#22c55e' },
  { value: 'Non-Veg', label: 'Non-Veg', emoji: '🔴', icon: <Flame size={16} />, color: '#ef4444' },
  { value: 'Egg',     label: 'Egg',     emoji: '🟡', icon: <Egg size={16} />,   color: '#f59e0b' },
];

const SPICE_LEVELS = [
  { value: 'Mild',   label: 'Mild',   icon: '🌱', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  { value: 'Medium', label: 'Medium', icon: '🌶️', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  { value: 'Spicy',  label: 'Hot',    icon: '🔥', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
];

const MEAL_TYPES = [
  { value: 'Breakfast', label: 'Breakfast', icon: <Coffee size={15} /> },
  { value: 'Lunch',     label: 'Lunch',     icon: <Sun size={15} /> },
  { value: 'Dinner',    label: 'Dinner',    icon: <Moon size={15} /> },
  { value: 'Snacks',    label: 'Snacks',    icon: <Star size={15} /> },
];

const PORTIONS = [
  { value: 'Half',        label: 'Half',        icon: <Scissors size={14} /> },
  { value: 'Full',        label: 'Full',         icon: <Pizza size={14} /> },
  { value: 'Family Pack', label: 'Family Pack',  icon: <Layers size={14} /> },
];

const DIETARY_PREFS = [
  { value: 'None',         label: 'Standard',    icon: <ChefHat size={14} /> },
  { value: 'Vegan',        label: 'Vegan',       icon: '🌿' },
  { value: 'Gluten-Free',  label: 'Gluten-Free', icon: '🌾' },
  { value: 'Dairy-Free',   label: 'Dairy-Free',  icon: '🥛' },
];

const TEMPERATURES = [
  { value: 'Hot',  label: 'Hot ♨️',  icon: <Thermometer size={14} />, color: '#ef4444' },
  { value: 'Cold', label: 'Cold ❄️', icon: <Snowflake size={14} />,   color: '#3b82f6' },
];

const PRICE_RANGES = [
  { value: 'Budget',  label: 'Budget',  icon: '💰' },
  { value: 'Medium',  label: 'Standard', icon: '💎' },
  { value: 'Premium', label: 'Premium', icon: '👑' },
];

const defaultForm = {
  name: '', category_id: '', food_type: 'Veg',
  spice_level: 'Mild', meal_type: 'Lunch',
  portion: 'Full', dietary_preference: 'None',
  price_range: 'Medium', temperature: 'Hot',
  price: '', quantity: '', description: '',
  is_available: true, prep_time: 15, is_seasonal: false,
  tags: [], image: null,
};

const PillGroup = ({ options, value, onChange, name, multi = false }) => (
  <div className="ap-pill-group">
    {options.map(opt => {
      const active = multi ? value.includes(opt.value) : value === opt.value;
      return (
        <button
          key={opt.value}
          type="button"
          className={`ap-pill ${active ? 'ap-pill--active' : ''}`}
          style={active ? {
            background: opt.color ? `${opt.color}18` : 'var(--ap-primary-light)',
            borderColor: opt.color || 'var(--ap-primary)',
            color: opt.color || 'var(--ap-primary)',
          } : {}}
          onClick={() => {
            if (multi) {
              const next = active ? value.filter(v => v !== opt.value) : [...value, opt.value];
              onChange(name, next);
            } else {
              onChange(name, opt.value);
            }
          }}
        >
          <span className="ap-pill-icon">
            {typeof opt.icon === 'string' ? opt.icon : opt.icon}
          </span>
          {opt.label}
        </button>
      );
    })}
  </div>
);

const SectionHeader = ({ icon, title, subtitle }) => (
  <div className="ap-section-header">
    <div className="ap-section-icon">{icon}</div>
    <div>
      <h3 className="ap-section-title">{title}</h3>
      {subtitle && <p className="ap-section-sub">{subtitle}</p>}
    </div>
  </div>
);

const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(defaultForm);
  const [categories, setCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [previewImage, setPreviewImage] = useState('');
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const fileRef = useRef();

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data)).catch(() => {});
    api.get('/products/get-tags').then(r => setAvailableTags(r.data)).catch(() => {});
  }, []);

  const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));
  const handleInput = e => set(e.target.name, e.target.type === 'checkbox' ? e.target.checked : e.target.value);

  const handleImage = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    set('image', file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const onDrop = useCallback(e => {
    e.preventDefault(); setDragging(false);
    handleImage(e.dataTransfer.files[0]);
  }, []);

  const onDragOver = e => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category_id || !formData.price || !formData.quantity) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'tags') data.append(key, JSON.stringify(formData[key]));
      else if (formData[key] !== null && formData[key] !== undefined) data.append(key, formData[key]);
    });
    try {
      await api.post('/products', data);
      toast.success('🎉 Product added successfully!');
      navigate('/products');
    } catch {
      toast.error('Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedFoodType = FOOD_TYPES.find(f => f.value === formData.food_type);

  return (
    <div className="ap-wrapper animate-fade-in">
      {/* Page Header */}
      <div className="ap-page-header">
        <div className="ap-page-header-left">
          <button className="ap-back-btn" onClick={() => navigate('/products')}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="ap-page-title">Add New Menu Item</h1>
            <p className="ap-page-subtitle">Fill in the details below to add a product to your menu</p>
          </div>
        </div>
        <div className="ap-progress-bar">
          {[1,2,3,4].map(s => (
            <div key={s} className={`ap-step ${step >= s ? 'ap-step--done' : ''} ${step === s ? 'ap-step--active' : ''}`}>
              <div className="ap-step-dot">{step > s ? <CheckCircle2 size={14}/> : s}</div>
              <span>{['Basic', 'Prefs', 'Pricing', 'Media'][s-1]}</span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="ap-form-grid">
        {/* LEFT COLUMN */}
        <div className="ap-col-main">

          {/* ── SECTION 1: BASIC INFORMATION ── */}
          <div className="ap-card" onClick={() => setStep(1)}>
            <SectionHeader
              icon={<UtensilsCrossed size={20} />}
              title="Basic Information"
              subtitle="Name, category, and food type of the item"
            />

            {/* Product Name */}
            <div className="ap-field">
              <label className="ap-label">
                <Tag size={14} /> Product Name <span className="ap-required">*</span>
              </label>
              <div className="ap-input-wrap">
                <span className="ap-input-icon"><UtensilsCrossed size={16} /></span>
                <input
                  name="name"
                  type="text"
                  className="ap-input ap-input--icon"
                  placeholder="e.g. Paneer Butter Masala"
                  value={formData.name}
                  onChange={handleInput}
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div className="ap-field">
              <label className="ap-label">
                <Layers size={14} /> Category <span className="ap-required">*</span>
              </label>
              <div className="ap-input-wrap">
                <span className="ap-input-icon"><Layers size={16} /></span>
                <select
                  name="category_id"
                  className="ap-select ap-input--icon"
                  value={formData.category_id}
                  onChange={handleInput}
                  required
                >
                  <option value="">Select a category...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Food Type */}
            <div className="ap-field">
              <label className="ap-label"><Leaf size={14} /> Food Type</label>
              <div className="ap-food-type-group">
                {FOOD_TYPES.map(ft => (
                  <button
                    key={ft.value}
                    type="button"
                    className={`ap-food-type-btn ${formData.food_type === ft.value ? 'ap-food-type-btn--active' : ''}`}
                    style={formData.food_type === ft.value ? { borderColor: ft.color, color: ft.color, background: `${ft.color}15` } : {}}
                    onClick={() => set('food_type', ft.value)}
                  >
                    <span className="ap-food-dot" style={{ background: ft.color }}></span>
                    {ft.icon}
                    {ft.label}
                  </button>
                ))}
              </div>
              {selectedFoodType && (
                <div className="ap-food-badge" style={{ background: `${selectedFoodType.color}12`, color: selectedFoodType.color }}>
                  <span className="ap-food-dot" style={{ background: selectedFoodType.color }}></span>
                  Marked as <strong>{selectedFoodType.label}</strong>
                </div>
              )}
            </div>
          </div>

          {/* ── SECTION 2: CLASSIFICATION & PREFERENCES ── */}
          <div className="ap-card" onClick={() => setStep(2)}>
            <SectionHeader
              icon={<Zap size={20} />}
              title="Classification & Preferences"
              subtitle="Set spice level, meal time, and dietary preferences"
            />

            {/* Spice Level */}
            <div className="ap-field">
              <label className="ap-label"><Flame size={14} /> Spice Level</label>
              <PillGroup
                name="spice_level" options={SPICE_LEVELS}
                value={formData.spice_level} onChange={set}
              />
            </div>

            {/* Meal Type */}
            <div className="ap-field">
              <label className="ap-label"><Sun size={14} /> Meal Type</label>
              <PillGroup
                name="meal_type" options={MEAL_TYPES}
                value={formData.meal_type} onChange={set}
              />
            </div>

            <div className="ap-field-row">
              {/* Portion */}
              <div className="ap-field">
                <label className="ap-label"><Scissors size={14} /> Portion Size</label>
                <PillGroup
                  name="portion" options={PORTIONS}
                  value={formData.portion} onChange={set}
                />
              </div>

              {/* Temperature */}
              <div className="ap-field">
                <label className="ap-label"><Thermometer size={14} /> Temperature</label>
                <PillGroup
                  name="temperature" options={TEMPERATURES}
                  value={formData.temperature} onChange={set}
                />
              </div>
            </div>

            {/* Dietary Preference */}
            <div className="ap-field">
              <label className="ap-label"><Leaf size={14} /> Dietary Preference</label>
              <PillGroup
                name="dietary_preference" options={DIETARY_PREFS}
                value={formData.dietary_preference} onChange={set}
              />
            </div>
          </div>

          {/* ── SECTION 3: PRICING & STOCK ── */}
          <div className="ap-card" onClick={() => setStep(3)}>
            <SectionHeader
              icon={<IndianRupee size={20} />}
              title="Pricing & Stock"
              subtitle="Set product price, stock quantity and price segment"
            />

            <div className="ap-field-row">
              <div className="ap-field">
                <label className="ap-label">
                  <IndianRupee size={14} /> Price (₹) <span className="ap-required">*</span>
                </label>
                <div className="ap-input-wrap">
                  <span className="ap-input-icon ap-currency">₹</span>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    className="ap-input ap-input--icon"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleInput}
                    required
                  />
                </div>
              </div>

              <div className="ap-field">
                <label className="ap-label">
                  <Package size={14} /> Stock Quantity <span className="ap-required">*</span>
                </label>
                <div className="ap-input-wrap">
                  <span className="ap-input-icon"><Package size={16} /></span>
                  <input
                    name="quantity"
                    type="number"
                    min="0"
                    className="ap-input ap-input--icon"
                    placeholder="e.g. 50"
                    value={formData.quantity}
                    onChange={handleInput}
                    required
                  />
                </div>
              </div>

              <div className="ap-field">
                <label className="ap-label">⏱ Prep Time (min)</label>
                <div className="ap-input-wrap">
                  <span className="ap-input-icon">⏱</span>
                  <input
                    name="prep_time"
                    type="number"
                    min="1"
                    className="ap-input ap-input--icon"
                    value={formData.prep_time}
                    onChange={handleInput}
                  />
                </div>
              </div>
            </div>

            <div className="ap-field">
              <label className="ap-label">💎 Price Segment</label>
              <PillGroup
                name="price_range" options={PRICE_RANGES}
                value={formData.price_range} onChange={set}
              />
            </div>

            <div className="ap-toggles-row">
              <label className="ap-toggle-label">
                <div className={`ap-toggle ${formData.is_available ? 'ap-toggle--on' : ''}`}
                  onClick={() => set('is_available', !formData.is_available)}>
                  <div className="ap-toggle-thumb" />
                </div>
                <span>Available for sale</span>
              </label>
              <label className="ap-toggle-label">
                <div className={`ap-toggle ${formData.is_seasonal ? 'ap-toggle--on' : ''}`}
                  onClick={() => set('is_seasonal', !formData.is_seasonal)}>
                  <div className="ap-toggle-thumb" />
                </div>
                <span>Seasonal item</span>
              </label>
            </div>
          </div>

        </div>{/* END LEFT COL */}

        {/* RIGHT COLUMN */}
        <div className="ap-col-side">

          {/* ── SECTION 4: DESCRIPTION & MEDIA ── */}
          <div className="ap-card" onClick={() => setStep(4)}>
            <SectionHeader
              icon={<FileText size={20} />}
              title="Description & Media"
              subtitle="Add a description and product image"
            />

            <div className="ap-field">
              <label className="ap-label"><FileText size={14} /> Description</label>
              <textarea
                name="description"
                className="ap-textarea"
                rows={4}
                placeholder="Describe the dish — ingredients, taste, how it's made..."
                value={formData.description}
                onChange={handleInput}
              />
            </div>

            {/* Drag & Drop Image Upload */}
            <div className="ap-field">
              <label className="ap-label"><ImagePlus size={14} /> Product Image</label>
              <div
                className={`ap-dropzone ${dragging ? 'ap-dropzone--drag' : ''} ${previewImage ? 'ap-dropzone--has-image' : ''}`}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => fileRef.current?.click()}
              >
                {previewImage ? (
                  <div className="ap-image-preview">
                    <img src={previewImage} alt="Preview" className="ap-preview-img" />
                    <button
                      type="button"
                      className="ap-clear-img"
                      onClick={e => {
                        e.stopPropagation();
                        setPreviewImage('');
                        set('image', null);
                      }}
                    >
                      <X size={16} />
                    </button>
                    <div className="ap-preview-overlay">
                      <span>Click to change</span>
                    </div>
                  </div>
                ) : (
                  <div className="ap-dropzone-placeholder">
                    <div className="ap-dropzone-icon">
                      <ImagePlus size={32} />
                    </div>
                    <p className="ap-dropzone-title">
                      {dragging ? 'Drop it here!' : 'Drag & drop image here'}
                    </p>
                    <p className="ap-dropzone-sub">or click to browse files</p>
                    <p className="ap-dropzone-hint">PNG, JPG, WEBP · Max 5MB · 1:1 ratio recommended</p>
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => handleImage(e.target.files[0])}
              />
            </div>
          </div>

          {/* ── TAGS ── */}
          {availableTags.length > 0 && (
            <div className="ap-card">
              <SectionHeader
                icon={<Tag size={20} />}
                title="Tags & Discovery"
                subtitle="Help customers find this item"
              />
              <div className="ap-field">
                <div className="ap-tag-grid">
                  {availableTags.map(tag => {
                    const active = formData.tags.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        className={`ap-tag-chip ${active ? 'ap-tag-chip--active' : ''}`}
                        onClick={() => {
                          const next = active
                            ? formData.tags.filter(t => t !== tag.id)
                            : [...formData.tags, tag.id];
                          set('tags', next);
                        }}
                      >
                        {active && <CheckCircle2 size={11} />}
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── ORDER SUMMARY PREVIEW ── */}
          <div className="ap-card ap-summary-card">
            <h4 className="ap-summary-title">📋 Quick Preview</h4>
            <div className="ap-summary-rows">
              <div className="ap-summary-row">
                <span>Name</span>
                <strong>{formData.name || '—'}</strong>
              </div>
              <div className="ap-summary-row">
                <span>Price</span>
                <strong>{formData.price ? `₹${formData.price}` : '—'}</strong>
              </div>
              <div className="ap-summary-row">
                <span>Type</span>
                <strong>{formData.food_type}</strong>
              </div>
              <div className="ap-summary-row">
                <span>Spice</span>
                <strong>{formData.spice_level}</strong>
              </div>
              <div className="ap-summary-row">
                <span>Meal</span>
                <strong>{formData.meal_type}</strong>
              </div>
              <div className="ap-summary-row">
                <span>Portion</span>
                <strong>{formData.portion}</strong>
              </div>
              <div className="ap-summary-row">
                <span>Diet</span>
                <strong>{formData.dietary_preference === 'None' ? 'Standard' : formData.dietary_preference}</strong>
              </div>
              <div className="ap-summary-row">
                <span>Stock</span>
                <strong>{formData.quantity || '—'}</strong>
              </div>
            </div>
          </div>

          {/* ── SUBMIT BUTTONS ── */}
          <div className="ap-actions">
            <button
              type="button"
              className="ap-btn-cancel"
              onClick={() => navigate('/products')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="ap-btn-submit"
              disabled={loading}
            >
              {loading ? (
                <span className="ap-spinner"></span>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Add Product
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
