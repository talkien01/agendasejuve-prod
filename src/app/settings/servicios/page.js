'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

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
    <div className="settings-section relative-container">
      <div className="crud-header">
        <h2>Servicios</h2>
        <button className="btn-primary" onClick={openNewModal} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> Nuevo Servicio
        </button>
      </div>

      {loading ? (
        <p>Cargando servicios...</p>
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
                  <td colSpan="5" style={{ textAlign: 'center', color: '#666' }}>No hay servicios registrados.</td>
                </tr>
              ) : (
                servicios.map((service) => (
                  <tr key={service.id}>
                    <td style={{ fontWeight: '500' }}>{service.name}</td>
                    <td>{service.category || 'General'}</td>
                    <td>{service.duration} min</td>
                    <td>{formatCurrency(service.price)}</td>
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
                <input type="number" required min="1" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Precio (0 para Gratis)</label>
                <input type="number" required min="0" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
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
        .relative-container {
          position: relative;
        }
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }
        .modal-content {
          background: white;
          width: 100%;
          max-width: 500px;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .modal-header h3 {
          margin: 0;
          font-size: 18px;
        }
        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #666;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-size: 13px;
          font-weight: 500;
          color: #444;
        }
        .form-group input, .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
