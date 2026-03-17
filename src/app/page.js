'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  CalendarCheck,
  TrendingUp,
  Building2,
  MoreHorizontal,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const STATUS_STYLES = {
  CONFIRMADA: { bg: '#e3f2fd', color: '#1976d2', label: 'Confirmada' },
  PENDIENTE:  { bg: '#fff3e0', color: '#f57c00', label: 'Pendiente' },
  ASISTIDA:   { bg: '#e8f5e9', color: '#388e3c', label: 'Asistida' },
  CANCELADA:  { bg: '#ffebee', color: '#c62828', label: 'Cancelada' },
};

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const today = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);

  const stats = data ? [
    { name: 'Citas Hoy',        value: data.stats.todayAppointments, icon: CalendarCheck, color: '#00BFFF' },
    { name: 'Total Pacientes',  value: data.stats.totalPatients,     icon: Users,         color: '#4CAF50' },
    { name: 'Recursos Activos', value: `${data.stats.activeResources}/${data.stats.totalResources}`, icon: Building2, color: '#9C27B0' },
    { name: 'Ocupación',        value: data.stats.totalResources > 0
        ? `${Math.round((data.stats.activeResources / data.stats.totalResources) * 100)}%`
        : '0%',
      icon: TrendingUp, color: '#FF9800' },
  ] : [];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome">
          <h1>Resumen del Día</h1>
          <p>{todayCapitalized}</p>
        </div>
        <button className="btn-refresh" onClick={fetchDashboard} title="Actualizar">
          <RefreshCw size={16} />
          <span>Actualizar</span>
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Cargando datos...</div>
      ) : (
        <>
          <div className="stats-grid">
            {stats.map((stat) => (
              <div key={stat.name} className="card stat-card">
                <div className="stat-icon" style={{ backgroundColor: `${stat.color}18`, color: stat.color }}>
                  <stat.icon size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">{stat.name}</span>
                  <div className="stat-value-row">
                    <span className="stat-value">{stat.value}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="dashboard-grid">
            <div className="card main-app-card">
              <div className="card-header">
                <h3>Próximas Citas de Hoy</h3>
                <a href="/agenda" className="text-btn">Ver agenda →</a>
              </div>
              <div className="appointments-list">
                {data?.upcomingAppointments?.length === 0 ? (
                  <div className="empty-state-inline">No hay citas programadas para hoy</div>
                ) : (
                  data?.upcomingAppointments?.map((app) => {
                    const style = STATUS_STYLES[app.status] || STATUS_STYLES.PENDIENTE;
                    return (
                      <div key={app.id} className="appointment-item">
                        <div className="app-time">
                          <Clock size={14} />
                          <span>{app.startTime}</span>
                        </div>
                        <div className="app-info">
                          <span className="app-patient">{app.patient?.name || 'Sin paciente'}</span>
                          <span className="app-service">
                            {app.type}{app.resource ? ` • ${app.resource.name}` : ''}
                          </span>
                        </div>
                        <div className="status-badge" style={{ background: style.bg, color: style.color }}>
                          {style.label}
                        </div>
                        <button className="icon-btn-small">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="card side-app-card">
              <div className="card-header">
                <h3>Estado de Recursos</h3>
                <a href="/recursos" className="text-btn">Ver todos →</a>
              </div>
              <div className="resource-list">
                {data?.resources?.length === 0 ? (
                  <div className="empty-state-inline">No hay recursos registrados</div>
                ) : (
                  data?.resources?.map((res) => (
                    <div key={res.id} className="resource-item">
                      <div className="res-info">
                        <span className="res-name">{res.name}</span>
                        <span className="res-meta">{res.type}</span>
                      </div>
                      <div className="res-status">
                        <span className={`status-dot ${res.status === 'Activo' ? 'disponible' : 'mantenimiento'}`} />
                        <span>{res.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .dashboard {
          display: flex;
          flex-direction: column;
          gap: 32px;
          padding: 24px;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .welcome h1 {
          font-size: 24px;
          color: var(--text-main);
          margin-bottom: 4px;
        }

        .welcome p {
          color: var(--text-secondary);
          font-size: 14px;
          text-transform: capitalize;
        }

        .btn-refresh {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: white;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-refresh:hover {
          border-color: var(--brand-primary);
          color: var(--brand-primary);
        }

        .loading-state {
          text-align: center;
          padding: 80px 0;
          color: var(--text-secondary);
          font-size: 15px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          min-width: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-info { flex: 1; }

        .stat-label {
          font-size: 13px;
          color: var(--text-secondary);
          display: block;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-main);
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1.8fr 1fr;
          gap: 24px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .card-header h3 {
          font-size: 16px;
          font-weight: 600;
        }

        .text-btn {
          font-size: 13px;
          color: var(--brand-primary);
          font-weight: 600;
          text-decoration: none;
        }

        .appointments-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .appointment-item {
          display: flex;
          align-items: center;
          padding: 14px;
          background: #f8f9fa;
          border-radius: 8px;
          gap: 16px;
        }

        .app-time {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-secondary);
          min-width: 70px;
        }

        .app-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .app-patient {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-main);
        }

        .app-service {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .status-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          white-space: nowrap;
        }

        .icon-btn-small {
          color: var(--text-secondary);
          padding: 4px;
          border-radius: 4px;
        }

        .empty-state-inline {
          text-align: center;
          color: var(--text-secondary);
          font-size: 14px;
          padding: 24px 0;
        }

        .resource-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .resource-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--border-color);
        }

        .resource-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .res-name {
          display: block;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .res-meta {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .res-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 500;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .status-dot.disponible     { background: #4CAF50; }
        .status-dot.mantenimiento  { background: #FF9800; }
      `}</style>
    </div>
  );
}
