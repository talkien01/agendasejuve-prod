'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/patients');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPatients(data);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
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
          <button className="btn-primary">
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
            placeholder="Buscar por nombre, correo o teléfono..." 
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
          <div className="loading-state">Cargando pacientes...</div>
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
              {filteredPatients.map((patient) => (
                <tr key={patient.id}>
                  <td>
                    <div className="patient-info">
                      <div className="patient-avatar">
                        {patient.name.charAt(0)}
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
                      <button title="Ver"><Eye size={16} /></button>
                      <button title="Editar"><Edit2 size={16} /></button>
                      <button title="Eliminar"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && filteredPatients.length === 0 && (
          <div className="empty-state">
            <Users size={48} />
            <p>No se encontraron pacientes</p>
          </div>
        )}
      </div>

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
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .header-title p {
          color: var(--text-secondary);
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
          background-color: var(--primary-color);
          color: white;
          border: none;
        }

        .btn-secondary {
          background-color: white;
          color: var(--text-primary);
          border: 1px solid var(--border-color);
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
          background: var(--bg-secondary);
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
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: white;
          color: var(--text-primary);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }

        .data-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
          overflow: hidden;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .data-table th {
          background: #fafafa;
          padding: 16px 24px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border-color);
        }

        .data-table td {
          padding: 16px 24px;
          border-bottom: 1px solid var(--border-color);
          font-size: 14px;
          color: var(--text-primary);
        }

        .patient-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .patient-avatar {
          width: 40px;
          height: 40px;
          background-color: #e3f2fd;
          color: var(--primary-color);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 16px;
        }

        .patient-name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .patient-id {
        .id-number {
          font-family: monospace;
          font-size: 13px;
        }

        .status-pill {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
        }

        .status-pill.activo { background: #e8f5e9; color: #2e7d32; }
        .status-pill.inactivo { background: #ffebee; color: #c62828; }
        .status-pill.pendiente { background: #fff3e0; color: #ef6c00; }

        .actions-cell {
          width: 140px;
        }

        .action-btns {
          display: flex;
          gap: 8px;
        }

        .icon-btn-action {
          color: var(--text-secondary);
          padding: 6px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .icon-btn-action:hover {
          background: var(--bg-primary);
          color: var(--brand-primary);
        }

        .icon-btn-action.delete:hover {
          color: #f44336;
        }
      `}</style>
    </div>
  );
}
