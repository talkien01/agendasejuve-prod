'use client';

import { useState, useEffect } from 'react';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function LocalesPage() {
  const [locales, setLocales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocal, setEditingLocal] = useState(null);
  const [formData, setFormData] = useState({ name: '', address: '', phone: '', status: 'Activo' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchLocales();
  }, []);

  async function fetchLocales() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/locales');
      const data = await res.json();
      setLocales(data.locales || []);
    } catch (error) {
      console.error('Error fetching locales:', error);
    } finally {
      setLoading(false);
    }
  }

  const openNewModal = () => {
    setEditingLocal(null);
    setFormData({ name: '', address: '', phone: '', status: 'Activo' });
    setIsModalOpen(true);
  };

  const openEditModal = (local) => {
    setEditingLocal(local.id);
    setFormData({ name: local.name, address: local.address || '', phone: local.phone || '', status: local.status });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar esta sucursal?')) return;
    try {
      await fetch(`/api/admin/locales/${id}`, { method: 'DELETE' });
      fetchLocales();
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const method = editingLocal ? 'PUT' : 'POST';
      const url = editingLocal ? `/api/admin/locales/${editingLocal}` : '/api/admin/locales';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchLocales();
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

  return (
    <div className="settings-section relative-container">
      <div className="crud-header">
        <h2>Sucursales (Locales)</h2>
        <button className="btn-primary" onClick={openNewModal} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> Nueva Sucursal
        </button>
      </div>

      {loading ? (
        <p>Cargando locales...</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Dirección</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th style={{ width: '100px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {locales.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#666' }}>No hay sucursales registradas.</td>
                </tr>
              ) : (
                locales.map((local) => (
                  <tr key={local.id}>
                    <td style={{ fontWeight: '500' }}>{local.name}</td>
                    <td>{local.address || '-'}</td>
                    <td>{local.phone || '-'}</td>
                    <td>
                      <span className={`status-badge ${local.status === 'Activo' ? 'active' : 'inactive'}`}>
                        {local.status}
                      </span>
                    </td>
                    <td>
                      <button className="action-btn" title="Editar" onClick={() => openEditModal(local)}><Edit2 size={16} /></button>
                      <button className="action-btn danger" title="Eliminar" onClick={() => handleDelete(local.id)}><Trash2 size={16} /></button>
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
              <h3>{editingLocal ? 'Editar Sucursal' : 'Nueva Sucursal'}</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre de Sucursal</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej. Sede Centro" />
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Calle y número" />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="10 dígitos" />
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
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
        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        .status-badge.active {
          background-color: #e6f4ea;
          color: #1e8e3e;
        }
        .status-badge.inactive {
          background-color: #fce8e6;
          color: #d93025;
        }
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
