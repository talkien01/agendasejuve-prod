'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Eye,
  Edit2,
  Trash2,
  X,
  Loader2
} from 'lucide-react';

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    identifier: '',
    status: 'Activo'
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/patients');
      if (res.ok) {
        const data = await res.json();
        setPatients(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (patient = null) => {
    if (patient) {
      setEditingPatient(patient);
      setFormData({
        name: patient.name || '',
        email: patient.email || '',
        phone: patient.phone || '',
        identifier: patient.identifier || '',
        status: patient.status || 'Activo'
      });
    } else {
      setEditingPatient(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        identifier: '',
        status: 'Activo'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPatient(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const url = editingPatient 
      ? `/api/patients/${editingPatient.id}` 
      : '/api/patients';
    
    const method = editingPatient ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        handleCloseModal();
        fetchPatients();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error || 'No se pudo guardar el paciente'}`);
      }
    } catch (err) {
      console.error('Error saving patient:', err);
      alert('Error de red al guardar el paciente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este paciente?')) return;

    try {
      const res = await fetch(`/api/patients/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchPatients();
      } else {
        alert('Error al eliminar el paciente');
      }
    } catch (err) {
      console.error('Error deleting patient:', err);
      alert('Error de red al eliminar el paciente');
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.identifier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Activo': return { bg: '#E8F5E9', color: '#2E7D32' };
      case 'Inactivo': return { bg: '#FFEBEE', color: '#C62828' };
      case 'Pendiente': return { bg: '#FFF3E0', color: '#EF6C00' };
      default: return { bg: '#F5F5F5', color: '#616161' };
    }
  };

  return (
    <div className="patients-page">
      <header className="page-header">
        <div className="header-title">
          <h1>Base de Pacientes</h1>
          <p>Gestiona la información y el historial de tus clientes</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">
            <Download size={18} />
            <span>Exportar</span>
          </button>
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} />
            <span>Nuevo Paciente</span>
          </button>
        </div>
      </header>

      <div className="filter-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, correo o identificación..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn-filter">
          <Filter size={18} />
          <span>Filtros Avanzados</span>
        </button>
      </div>

      <div className="data-container">
        {loading ? (
          <div className="loading-state">
            <Loader2 className="animate-spin" size={24} />
            <span>Cargando pacientes...</span>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>NOMBRE</th>
                <th>CORREO</th>
                <th>TELÉFONO</th>
                <th>IDENTIFICACIÓN</th>
                <th>ESTADO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                    No se encontraron pacientes
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <div className="patient-info">
                        <div className="patient-avatar">
                          {patient.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="patient-name">{patient.name}</div>
                          <div className="patient-id">ID: {patient.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td>{patient.email || '-'}</td>
                    <td>{patient.phone || '-'}</td>
                    <td>
                      <span className="identifier-text">{patient.identifier || '-'}</span>
                    </td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{
                          backgroundColor: getStatusStyle(patient.status).bg,
                          color: getStatusStyle(patient.status).color
                        }}
                      >
                        {patient.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button title="Ver" className="action-btn"><Eye size={16} /></button>
                        <button title="Editar" className="action-btn" onClick={() => handleOpenModal(patient)}><Edit2 size={16} /></button>
                        <button title="Eliminar" className="action-btn danger" onClick={() => handleDelete(patient.id)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingPatient ? 'Editar Paciente' : 'Nuevo Paciente'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ej. Juan Pérez"
                  />
                </div>
                
                <div className="form-group">
                  <label>Correo Electrónico</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                
                <div className="form-group">
                  <label>Teléfono</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+52 ..."
                  />
                </div>
                
                <div className="form-group">
                  <label>Identificación (CURP/ID)</label>
                  <input 
                    type="text" 
                    value={formData.identifier}
                    onChange={(e) => setFormData({...formData, identifier: e.target.value})}
                    placeholder="CURP o ID de identidad"
                  />
                </div>
                
                <div className="form-group">
                  <label>Estado</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                    <option value="Pendiente">Pendiente</option>
                  </select>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Guardar Paciente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .patients-page {
          padding: 24px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .header-title h1 {
          font-size: 24px;
          color: #111;
          margin-bottom: 4px;
        }

        .header-title p {
          color: #666;
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .btn-primary, .btn-secondary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background-color: #0070f3;
          color: white;
          border: none;
        }

        .btn-primary:hover {
          background-color: #0060df;
        }

        .btn-primary:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .btn-secondary {
          background-color: white;
          color: #333;
          border: 1px solid #ddd;
        }

        .btn-secondary:hover {
          background-color: #f5f5f5;
        }

        .filter-bar {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          background: white;
          padding: 16px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .search-box {
          flex: 1;
          display: flex;
          align-items: center;
          background: #f5f5f5;
          border-radius: 8px;
          padding: 8px 16px;
          gap: 12px;
        }

        .search-box input {
          background: none;
          border: none;
          width: 100%;
          outline: none;
          font-size: 14px;
        }

        .btn-filter {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: white;
          color: #333;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }

        .data-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          min-width: 800px;
        }

        .data-table th {
          background: #fafafa;
          padding: 16px 24px;
          font-size: 12px;
          font-weight: 700;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #eee;
        }

        .data-table td {
          padding: 16px 24px;
          border-bottom: 1px solid #eee;
          font-size: 14px;
          color: #333;
        }

        .patient-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .patient-avatar {
          width: 36px;
          height: 36px;
          background-color: #e3f2fd;
          color: #0070f3;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
        }

        .patient-name {
          font-weight: 600;
          color: #111;
        }

        .patient-id {
          font-size: 11px;
          color: #999;
          margin-top: 2px;
        }

        .identifier-text {
          font-family: monospace;
          background: #f0f0f0;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          border: none;
          background: none;
          padding: 6px;
          color: #666;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background: #f0f0f0;
          color: #0070f3;
        }

        .action-btn.danger:hover {
          background: #fff0f0;
          color: #ff4d4f;
        }

        .loading-state {
          padding: 40px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: #666;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          width: 100%;
          max-width: 600px;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          overflow: hidden;
        }

        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
        }

        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #999;
        }

        form {
          padding: 24px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group.full-width {
          grid-column: span 2;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 600;
          color: #444;
        }

        .form-group input, .form-group select {
          padding: 10px 14px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        .form-group input:focus, .form-group select:focus {
          border-color: #0070f3;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 12px;
        }
      `}</style>
    </div>
  );
}

