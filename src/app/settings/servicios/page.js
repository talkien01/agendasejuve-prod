'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import './../settings-crud.css';

export default function ServiciosPage() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({ name: '', duration: 60, price: 0, category: 'General' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/servicios');
      const data = await res.json();
      setServicios(data.services || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  const openNewModal = () => {
    setEditingService(null);
    setFormData({ name: '', duration: 60, price: 0, category: 'General' });
    setIsModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service.id);
    setFormData({ 
      name: service.name, 
      duration: service.duration, 
      price: service.price, 
      category: service.category || 'General' 
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este servicio?')) return;
    try {
      await fetch(`/api/admin/servicios/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const method = editingService ? 'PUT' : 'POST';
      const url = editingService ? `/api/admin/servicios/${editingService}` : '/api/admin/servicios';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        alert('Error al guardar datos');
      }
    } catch (error) {
      console.error(error);
      alert('Error de red');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === 0) return 'Gratis';
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  return (
    <div className="settings-section">
      <div className="crud-header">
        <h2>Servicios</h2>
        <button className="btn-primary" onClick={openNewModal} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Nuevo Servicio
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Loader2 className="animate-spin" size={24} color="#0070f3" />
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Duración</th>
                <th>Precio</th>
                <th style={{ width: '100px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {servicios.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#666', padding: '40px' }}>No hay servicios registrados.</td>
                </tr>
              ) : (
                servicios.map((service) => (
                  <tr key={service.id}>
                    <td style={{ fontWeight: '600' }}>{service.name}</td>
                    <td>{service.category || 'General'}</td>
                    <td>{service.duration} min</td>
                    <td style={{ fontWeight: '500', color: service.price === 0 ? '#2E7D32' : 'inherit' }}>
                      {formatCurrency(service.price)}
                    </td>
                    <td>
                      <button className="action-btn" title="Editar" onClick={() => openEditModal(service)}><Edit2 size={16} /></button>
                      <button className="action-btn danger" title="Eliminar" onClick={() => handleDelete(service.id)}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingService ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre del Servicio</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej. Terapia Presencial" />
              </div>
              <div className="form-group">
                <label>Categoría</label>
                <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Ej. General" />
              </div>
              <div className="form-group">
                <label>Duración (Minutos)</label>
                <input type="number" required min="1" value={formData.duration} onChange={e => setFormData({...formData, duration: parseInt(e.target.value) || 0})} />
              </div>
              <div className="form-group">
                <label>Precio (0 para Gratis)</label>
                <input type="number" required min="0" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
