import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  };

  const openModal = (cat = null) => {
    setCurrentCategory(cat);
    setFormData(cat ? { name: cat.name, description: cat.description || '' } : { name: '', description: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentCategory) {
        await api.put(`/categories/${currentCategory.id}`, formData);
        toast.success('Category updated');
      } else {
        await api.post('/categories', formData);
        toast.success('Category created');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this category?')) {
      try {
        await api.delete(`/categories/${id}`);
        toast.success('Deleted');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Categories</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Add Category
        </button>
      </div>

      <div className="card table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id}>
                <td>#{c.id}</td>
                <td>{c.name}</td>
                <td>{c.description}</td>
                <td>
                  <div className="d-flex gap-2">
                    <button className="btn btn-outline" style={{padding: '0.4rem 0.6rem'}} onClick={() => openModal(c)}><Edit size={16} /></button>
                    <button className="btn" style={{padding: '0.4rem 0.6rem', color: '#dc2626', border: '1px solid #dc2626'}} onClick={() => handleDelete(c.id)}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="card animate-fade-in" style={{ width: '400px' }}>
            <h3 className="mb-4">{currentCategory ? 'Edit Category' : 'Add Category'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="d-flex gap-2 mt-4">
                <button type="button" className="btn btn-outline" style={{flex: 1}} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{flex: 1}}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
