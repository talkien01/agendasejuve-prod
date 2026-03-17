'use client';

import { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Clock,
  Plus,
  Search,
  MoreVertical,
  Activity,
  Calendar,
  Settings,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function RecursosPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const res = await fetch('/api/resources');
      const data = await res.json();
      if (Array.isArray(data)) {
        setResources(data);
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="resources-page">
      <header className="page-header">
        <div className="header-title">
          <h1>Gestión de Recursos</h1>
          <p>Configura y monitorea tus espacios físicos y equipamiento</p>
        </div>
        <button className="btn-primary">
          <Plus size={18} />
          <span>Nuevo Recurso</span>
        </button>
      </header>

      <div className="stats-row">
        <div className="stat-card">
          <Building2 size={24} className="stat-icon" />
          <div className="stat-content">
            <span className="stat-value">{resources.length}</span>
            <span className="stat-label">Total Recursos</span>
          </div>
        </div>
        <div className="stat-card">
          <Activity size={24} className="stat-icon active" />
          <div className="stat-content">
            <span className="stat-value">{resources.filter(r => r.status === 'Activo').length}</span>
            <span className="stat-label">En Línea</span>
          </div>
        </div>
        <div className="stat-card">
          <ShieldCheck size={24} className="stat-icon safety" />
          <div className="stat-content">
            <span className="stat-value">100%</span>
            <span className="stat-label">Disponibilidad</span>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nombre o tipo de recurso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="resources-grid">
        {loading ? (
          <div className="loading-state">Cargando recursos...</div>
        ) : (
          filteredResources.map((resource) => (
            <div key={resource.id} className="resource-card">
              <div className="resource-header">
                <div className={`status-dot ${resource.status === 'Activo' ? 'active' : 'maintenance'}`} />
                <span className="resource-type">{resource.type}</span>
                <button className="icon-btn"><MoreVertical size={16} /></button>
              </div>
              <div className="resource-body">
                <h3>{resource.name}</h3>
                <div className="resource-meta">
                  <div className="meta-item">
                    <MapPin size={14} />
                    <span>{resource.location || 'Sin ubicación'}</span>
                  </div>
                  <div className="meta-item">
                    <Zap size={14} />
                    <span>{resource.services || 'Sin servicios'}</span>
                  </div>
                </div>
              </div>
              <div className="resource-footer">
                <button className="btn-outline-sm">
                  <Calendar size={14} />
                  <span>Agenda</span>
                </button>
                <button className="btn-outline-sm">
                  <Settings size={14} />
                  <span>Config</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .resources-page {
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

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background-color: var(--primary-color);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          padding: 12px;
          border-radius: 10px;
          background: #f1f3f4;
          color: var(--text-secondary);
        }

        .stat-icon.active {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .stat-icon.safety {
          background: #e3f2fd;
          color: #1976d2;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .stat-label {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .filter-bar {
          margin-bottom: 24px;
        }

        .search-box {
          display: flex;
          align-items: center;
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 10px 16px;
          gap: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }

        .search-box input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 14px;
        }

        .resources-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }

        .resource-card {
          background: white;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          padding: 20px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .resource-card:hover {
          transform: translateY(-4px);
          padding: 4px 10px;
          border-radius: 20px;
          text-transform: uppercase;
        }

        .status-tag.activo { background: #e8f5e9; color: #2e7d32; }
        .status-tag.mantenimiento { background: #fff3e0; color: #ef6c00; }

        .res-card-body {
          padding: 20px;
          flex: 1;
        }

        .res-name {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 12px;
        }

        .res-detail {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }

        .services-list {
          margin-top: 16px;
        }

        .services-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          display: block;
          margin-bottom: 8px;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .service-tag {
          font-size: 12px;
          background: #f1f3f4;
          color: var(--text-main);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .res-card-footer {
          padding: 16px 20px;
          background: #f8f9fa;
          border-top: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .footer-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: var(--brand-secondary);
        }

        .footer-actions {
          display: flex;
          gap: 4px;
        }

        .icon-btn-gray {
          color: var(--text-secondary);
          padding: 6px;
          border-radius: 4px;
        }

        .icon-btn-gray:hover {
          background: #e9ecef;
          color: var(--text-main);
        }

        .icon-btn-gray.danger:hover {
          color: #f44336;
        }

        .add-resource-card {
          border: 2px dashed var(--border-color);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
          min-height: 200px;
        }

        .add-resource-card:hover {
          background: white;
          border-color: var(--brand-primary);
          color: var(--brand-primary);
        }
      `}</style>
    </div>
  );
}
