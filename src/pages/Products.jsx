import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'sonner';
import { IMAGE_BASE_URL } from '../config';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [seasonalFilter, setSeasonalFilter] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [formData, setFormData] = useState({
    name: '', category_id: '', price: '', quantity: '', 
    description: '', is_available: true, prep_time: 15, is_seasonal: false,
    food_type: 'Veg', spice_level: 'Mild', meal_type: 'Lunch', 
    portion: 'Full', dietary_preference: 'None', price_range: 'Medium', 
    temperature: 'Hot', tags: []
  });

  useEffect(() => {
    fetchProducts();
  }, [page, categoryId, seasonalFilter]);

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const res = await api.get('/products/get-tags');
      setAvailableTags(res.data);
    } catch (error) {
      console.error('Failed to fetch tags');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products', {
        params: { page, limit: 8, search, category_id: categoryId, seasonal: seasonalFilter }
      });
      setProducts(res.data.products);
      setTotalCount(res.data.totalCount);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error('Failed to fetch products');
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setCurrentProduct(product);
      setFormData({
        name: product.name, 
        category_id: product.category_id,
        price: product.price, 
        quantity: product.quantity,
        description: product.description, 
        is_available: product.is_available,
        prep_time: product.prep_time || 15, 
        is_seasonal: !!product.is_seasonal,
        food_type: product.food_type || 'Veg',
        spice_level: product.spice_level || 'Mild',
        meal_type: product.meal_type || 'Lunch',
        portion: product.portion || 'Full',
        dietary_preference: product.dietary_preference || 'None',
        price_range: product.price_range || 'Medium',
        temperature: product.temperature || 'Hot',
        tags: product.tags?.map(t => t.id) || [],
        image: null
      });
      setPreviewImage(`${IMAGE_BASE_URL}${product.image_url}`);
    } else {
      setCurrentProduct(null);
      setFormData({
        name: '', category_id: '', price: '', quantity: '', 
        description: '', is_available: true, prep_time: 15, is_seasonal: false,
        food_type: 'Veg', spice_level: 'Mild', meal_type: 'Lunch', 
        portion: 'Full', dietary_preference: 'None', price_range: 'Medium', 
        temperature: 'Hot', tags: [], image: null
      });
      setPreviewImage('');
    }
    setShowModal(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleTagToggle = (tagId) => {
    setFormData(prev => {
        const currentTags = [...prev.tags];
        const index = currentTags.indexOf(tagId);
        if (index > -1) {
            currentTags.splice(index, 1);
        } else {
            currentTags.push(tagId);
        }
        return { ...prev, tags: currentTags };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'tags') {
        data.append(key, JSON.stringify(formData[key]));
      } else {
        data.append(key, formData[key]);
      }
    });

    try {
      if (currentProduct) {
        await api.put(`/products/${currentProduct.id}`, data);
        toast.success('Product updated');
      } else {
        await api.post('/products', data);
        toast.success('Product created');
      }
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const toggleAvailability = async (id) => {
    try {
      await api.patch(`/products/${id}/toggle-availability`);
      toast.success('Availability toggled');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to toggle');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        toast.success('Product deleted');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 style={{ fontWeight: '700' }}>Menu Inventory</h2>
          <p className="text-muted">Manage items, stock, and preparation times.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/products/add')}>
          Add New Product
        </button>
      </div>

      <div className="card mb-4 p-3 bg-white shadow-sm border-0">
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Search by name..." 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit" className="btn btn-neutral">Search</button>
            </form>
            <select 
                className="form-select" 
                style={{ width: '200px' }}
                value={categoryId}
                onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
            >
                <option value="">All Categories</option>
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>
            <div className="form-check form-switch">
              <input 
                className="form-check-input" 
                type="checkbox" 
                id="seasonalFilter" 
                checked={seasonalFilter}
                onChange={(e) => setSeasonalFilter(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="seasonalFilter">Seasonal Only</label>
            </div>
        </div>
      </div>

      <div className="card table-container border-0 shadow-sm overflow-hidden">
        <table className="table table-hover mb-0">
          <thead className="bg-light">
            <tr>
              <th className="border-0">Image</th>
              <th className="border-0">Name</th>
              <th className="border-0">Category</th>
              <th className="border-0">Prep Time</th>
              <th className="border-0">Price</th>
              <th className="border-0">Stock</th>
              <th className="border-0">Status</th>
              <th className="border-0 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="align-middle">
                <td className="border-0">
                  <div style={{ position: 'relative', width: '48px', height: '48px' }}>
                    <img src={`${IMAGE_BASE_URL}${p.image_url}`} alt="" style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                    <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: p.food_type === 'Veg' ? '#22c55e' : (p.food_type === 'Non-Veg' ? '#ef4444' : '#f59e0b'), border: '2px solid white' }}></div>
                  </div>
                </td>
                <td className="border-0">
                    <div className="fw-bold mb-1" style={{ fontSize: '0.95rem' }}>{p.name}</div>
                    <div className="d-flex gap-1 flex-wrap">
                        <span className="badge-soft-info px-2 py-0.5 rounded" style={{ fontSize: '0.6rem', fontWeight: '800' }}>#{p.id}</span>
                        {p.tags?.map(t => (
                            <span key={t.id} className="badge-soft-primary px-2 py-0.5 rounded" style={{ fontSize: '0.6rem', fontWeight: '700' }}>{t.name}</span>
                        ))}
                    </div>
                </td>
                <td className="border-0">
                    <span className="fw-medium text-dark" style={{ fontSize: '0.85rem' }}>{p.category_name}</span>
                    <div className="x-small text-muted">{p.meal_type} • {p.portion}</div>
                </td>
                <td className="border-0">
                    <div className="fw-bold">{p.prep_time ?? 15} min</div>
                    <div className="x-small text-muted">Prep Time</div>
                </td>
                <td className="border-0">
                    <div className="fw-bold text-primary">₹{p.price}</div>
                    <div className="x-small text-muted">{p.price_range}</div>
                </td>
                <td className="border-0">
                  <div className="d-flex align-items-center gap-2">
                    <span className={`fw-bold ${p.quantity < 10 ? 'text-danger' : 'text-success'}`}>{p.quantity}</span>
                    {p.quantity < 5 && (
                        <span className="badge bg-soft-danger text-danger border-danger border x-small" style={{ fontSize: '0.55rem', padding: '1px 4px' }}>CRITICAL</span>
                    )}
                  </div>
                  <div className="x-small text-muted">In Stock</div>
                </td>
                <td className="border-0">
                  <span className={`badge ${p.is_available ? 'badge-soft-success' : 'badge-soft-danger'}`} style={{ fontSize: '0.7rem' }}>
                    {p.is_available ? '● Active' : '○ Hidden'}
                  </span>
                </td>
                <td className="border-0">
                  <div className="d-flex gap-2 justify-content-end">
                    <button className="btn btn-sm btn-icon btn-neutral" style={{ padding: '0.4rem' }} onClick={() => openModal(p)} title="Edit"><Edit size={16} /></button>
                    <button className="btn btn-sm btn-icon btn-neutral text-danger" style={{ padding: '0.4rem' }} onClick={() => handleDelete(p.id)} title="Delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-4">
        <p className="text-muted small">Showing {products.length} of {totalCount} products</p>
        <div className="d-flex gap-2">
            <button className="btn btn-neutral btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
            <div className="d-flex align-items-center px-2 fw-bold small">Page {page} of {totalPages}</div>
            <button className="btn btn-neutral btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container animate-fade-in" style={{ width: '850px' }}>
            <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-white sticky-top mb-1" style={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
                <h3 className="mb-0 fw-bold">{currentProduct ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
                <button className="btn btn-neutral p-2" onClick={() => setShowModal(false)}><Trash2 size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4">
              <div className="row">
                {/* Left Column: Basic Info */}
                <div className="col-md-7">
                    <div className="form-section">
                        <div className="section-title"><ImageIcon size={14} /> Basic Information</div>
                        <div className="mb-3">
                            <label className="form-label">Product Name</label>
                            <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Paneer Butter Masala" required />
                        </div>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Category</label>
                                <select className="form-select w-100" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} required>
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Food Type</label>
                                <select className="form-select w-100" value={formData.food_type} onChange={e => setFormData({...formData, food_type: e.target.value})}>
                                    <option value="Veg">🌱 Pure Veg</option>
                                    <option value="Non-Veg">🍖 Non-Vegetarian</option>
                                    <option value="Egg">🥚 Contains Egg</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="section-title">✨ Classification & Preferences</div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-4">
                                <label className="form-label">Spice Level</label>
                                <select className="form-select w-100" value={formData.spice_level} onChange={e => setFormData({...formData, spice_level: e.target.value})}>
                                    <option value="Mild">Mild</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Spicy">🌶️ Spicy</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Meal Type</label>
                                <select className="form-select w-100" value={formData.meal_type} onChange={e => setFormData({...formData, meal_type: e.target.value})}>
                                    <option value="Breakfast">Breakfast</option>
                                    <option value="Lunch">Lunch</option>
                                    <option value="Dinner">Dinner</option>
                                    <option value="Snacks">Snacks</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Portion</label>
                                <select className="form-select w-100" value={formData.portion} onChange={e => setFormData({...formData, portion: e.target.value})}>
                                    <option value="Half">Half</option>
                                    <option value="Full">Full</option>
                                    <option value="Family Pack">Family Pack</option>
                                </select>
                            </div>
                        </div>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Dietary Preference</label>
                                <select className="form-select w-100" value={formData.dietary_preference} onChange={e => setFormData({...formData, dietary_preference: e.target.value})}>
                                    <option value="None">Standard</option>
                                    <option value="Vegan">Vegan</option>
                                    <option value="Gluten-Free">Gluten-Free</option>
                                    <option value="Dairy-Free">Dairy-Free</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Temperature</label>
                                <select className="form-select w-100" value={formData.temperature} onChange={e => setFormData({...formData, temperature: e.target.value})}>
                                    <option value="Hot">♨️ Serve Hot</option>
                                    <option value="Cold">❄️ Serve Cold</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Pricing, Tags & Image */}
                <div className="col-md-5">
                    <div className="form-section">
                        <div className="section-title">💰 Pricing & Inventory</div>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Price (₹)</label>
                                <input type="number" step="0.01" className="form-control" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Current Stock</label>
                                <input type="number" className="form-control" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} required />
                            </div>
                        </div>
                        <div className="mt-3">
                            <label className="form-label">Price Segment</label>
                            <select className="form-select w-100" value={formData.price_range} onChange={e => setFormData({...formData, price_range: e.target.value})}>
                                <option value="Budget">Budget Friendly</option>
                                <option value="Medium">Standard Price</option>
                                <option value="Premium">Premium Item</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="section-title">🔖 Tags & Discovery</div>
                        <div className="d-flex flex-wrap gap-2 mb-3">
                            {availableTags.map(tag => (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => handleTagToggle(tag.id)}
                                    className={`btn btn-sm ${formData.tags.includes(tag.id) ? 'btn-primary' : 'btn-outline-neutral'}`}
                                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: '8px', border: formData.tags.includes(tag.id) ? 'none' : '1px solid var(--border-color)' }}
                                >
                                    {tag.name}
                                </button>
                            ))}
                        </div>
                        
                        <div className="form-check form-switch mt-2">
                            <input className="form-check-input" type="checkbox" id="isAvailable" checked={formData.is_available} onChange={e => setFormData({...formData, is_available: e.target.checked})} />
                            <label className="form-check-label small fw-medium" htmlFor="isAvailable">Item is available for sale</label>
                        </div>
                    </div>

                    <div className="form-section mb-0">
                        <div className="section-title">🖼️ Media</div>
                        <div className="d-flex align-items-center gap-3">
                            <div style={{ width: '80px', height: '80px', borderRadius: '12px', border: '2px dashed #e2e8f0', overflow: 'hidden', backgroundColor: '#f9fafb' }}>
                                {previewImage ? (
                                    <img src={previewImage} style={{width: '100%', height: '100%', objectFit: 'cover'}} alt="Preview" />
                                ) : (
                                    <div className="d-flex align-items-center justify-content-center h-100 text-muted"><ImageIcon size={24} /></div>
                                )}
                            </div>
                            <div className="flex-grow-1">
                                <input type="file" accept="image/*" className="form-control form-control-sm" onChange={handleImageChange} />
                                <p className="x-small text-muted mt-1">Recommended 1:1 ratio</p>
                            </div>
                        </div>
                    </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-top d-flex justify-content-end gap-3">
                <button type="button" className="btn btn-neutral px-4" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary px-5 shadow-sm">
                    {currentProduct ? 'Update Product Details' : 'Publish Menu Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
