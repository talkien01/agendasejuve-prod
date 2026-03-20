'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Loader2, Home } from 'lucide-react';
import './../settings-crud.css';

export default function RecursosPage() {
  const [recursos, setRecursos] = useState([]);
  const [locales, setLocales] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({ name: '', type: 'Consultorio', localId: '', status: 'Activo', services: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [rd, ld] = await Promise.all([
        fetch('/api/admin/recursos').then(r => r.json()),
        fetch('/api/admin/locales').then(r => r.json()),
      ]);
      setRecursos(rd.resources || []);
      setLocales(ld.locales || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  const openNewModal = () => {
    setEditingResource(null);
    setFormData({ name: '', type: 'Consultorio', localId: '', status: 'Activo', services: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (res) => {
    setEditingResource(res.id);
    setFormData({ 
      name: res.name, 
      type: res.type, 
      localId: res.localId || '', 
      status: res.status || 'Activo',
      services: res.services || ''
    });
    setIsModalOpen(true);
  };

  const confirmDelete = (res) => {
    setResourceToDelete(res);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!resourceToDelete) return;
    const id = resourceToDelete.id;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/recursos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setIsDeleteModalOpen(false);
        setResourceToDelete(null);
        fetchData();
      } else {
        const err = await res.json();
        alert('Error al eliminar: ' + (err.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Delete fetch error:', error);
      alert('Error de red al eliminar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const method = editingResource ? 'PUT' : 'POST';
      const url = editingResource ? `/api/admin/recursos/${editingResource}` : '/api/admin/recursos';
      
      const payload = { ...formData };
      if (payload.localId === '') payload.localId = null;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        const errorData = await res.json();
        alert('Error al guardar datos: ' + (errorData.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error(error);
      alert('Error de red');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="settings-section">
      <div className="crud-header">
        <h2>Recursos (Salas, Consultorios, etc.)</h2>
        <button className="btn-primary" onClick={openNewModal} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Nuevo Recurso
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
                <th>Tipo</th>
                <th>Sucursal (Local)</th>
                <th>Estado</th>
                <th style={{ width: '100px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {recursos.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#666', padding: '40px' }}>No hay recursos registrados.</td>
                </tr>
              ) : (
                recursos.map((res) => (
                  <tr key={res.id}>
                    <td style={{ fontWeight: '600' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Home size={16} color="#666" />
                        {res.name}
                      </div>
                    </td>
                    <td>{res.type}</td>
                    <td>{res.local?.name || <span style={{color: '#999'}}>Sin asignar</span>}</td>
                    <td>
                      <span className={`status-badge ${res.status.toLowerCase()}`}>
                        {res.status}
                      </span>
                    </td>
                    <td>
                      <button className="action-btn" title="Editar" onClick={() => openEditModal(res)}><Edit2 size={16} /></button>
                      <button className="action-btn danger" title="Eliminar" onClick={() => confirmDelete(res)}><Trash2 size={16} /></button>
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
              <h3>{editingResource ? 'Editar Recurso' : 'Nuevo Recurso'}</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre del Recurso</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="Ej. Consultorio 1, Sala de Espera" 
                />
              </div>
              <div className="form-group">
                <label>Tipo</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="Consultorio">Consultorio</option>
                  <option value="Sala">Sala</option>
                  <option value="Cabina">Cabina</option>
                  <option value="Auditorio">Auditorio</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div className="form-group">
                <label>Asignar a Sucursal</label>
                <select value={formData.localId} onChange={e => setFormData({...formData, localId: e.target.value})}>
                  <option value="">-- Sin asignar --</option>
                  {locales.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                  <option value="Mantenimiento">Mantenimiento</option>
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

      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Confirmar eliminación</h3>
              <button className="close-btn" onClick={() => setIsDeleteModalOpen(false)}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px' }}>
              <p>¿Estás seguro de que deseas eliminar el recurso <strong>{resourceToDelete?.name}</strong>?</p>
              <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px' }}>Esta acción no se puede deshacer.</p>
              <div className="modal-footer" style={{ padding: 0 }}>
                <button type="button" className="btn-outline" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
                <button type="button" className="btn-primary" style={{ backgroundColor: '#ef4444' }} onClick={handleDelete} disabled={isSubmitting}>
                  {isSubmitting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
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
        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        .status-badge.activo {
          background-color: #e8f5e9;
          color: #2e7d32;
        }
        .status-badge.inactivo {
          background-color: #ffebee;
          color: #c62828;
        }
        .status-badge.mantenimiento {
          background-color: #fff3e0;
          color: #ef6c00;
        }
      `}</style>
    </div>
  );
}
