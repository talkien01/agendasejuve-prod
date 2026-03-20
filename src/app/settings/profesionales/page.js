'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import './../settings-crud.css';

export default function ProfesionalesPage() {
  const [profesionales, setProfesionales] = useState([]);
  const [locales, setLocales] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPro, setEditingPro] = useState(null);
  const [formData, setFormData] = useState({ name: '', specialty: '', localId: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [pd, ld] = await Promise.all([
        fetch('/api/admin/profesionales').then(r => r.json()),
        fetch('/api/admin/locales').then(r => r.json()),
      ]);
      setProfesionales(pd.profesionales || []);
      setLocales(ld.locales || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  const openNewModal = () => {
    setEditingPro(null);
    setFormData({ name: '', specialty: '', localId: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (pro) => {
    setEditingPro(pro.id);
    setFormData({ name: pro.name, specialty: pro.specialty || '', localId: pro.localId || '' });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar a este profesional?')) return;
    try {
      await fetch(`/api/admin/profesionales/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const method = editingPro ? 'PUT' : 'POST';
      const url = editingPro ? `/api/admin/profesionales/${editingPro}` : '/api/admin/profesionales';
      
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
    <div className="settings-section">
      <div className="crud-header">
        <h2>Profesionales</h2>
        <button className="btn-primary" onClick={openNewModal} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Nuevo Profesional
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
                <th>Especialidad</th>
                <th>Sucursal (Local)</th>
                <th style={{ width: '100px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {profesionales.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: '#666', padding: '40px' }}>No hay profesionales registrados.</td>
                </tr>
              ) : (
                profesionales.map((pro) => (
                  <tr key={pro.id}>
                    <td style={{ fontWeight: '600' }}>{pro.name}</td>
                    <td>{pro.specialty || '-'}</td>
                    <td>{pro.local?.name || <span style={{color: '#999'}}>Sin asignar</span>}</td>
                    <td>
                      <button className="action-btn" title="Editar" onClick={() => openEditModal(pro)}><Edit2 size={16} /></button>
                      <button className="action-btn danger" title="Eliminar" onClick={() => handleDelete(pro.id)}><Trash2 size={16} /></button>
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
              <h3>{editingPro ? 'Editar Profesional' : 'Nuevo Profesional'}</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre Completo</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej. Dra. María Pérez" />
              </div>
              <div className="form-group">
                <label>Especialidad</label>
                <input type="text" value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} placeholder="Ej. Psicología" />
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
