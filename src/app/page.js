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
          padding: 32px;
          background: #fdfdfd;
          min-height: 100vh;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 8px;
        }

        .welcome h1 {
          font-size: 28px;
          font-weight: 800;
          color: #1a1a1a;
          margin-bottom: 6px;
          letter-spacing: -0.5px;
        }

        .welcome p {
          color: #666;
          font-size: 15px;
          text-transform: capitalize;
          font-weight: 500;
        }

        .btn-refresh {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          background: white;
          color: #444;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }

        .btn-refresh:hover {
          border-color: #00BFFF;
          color: #00BFFF;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,191,255,0.1);
        }

        .loading-state {
          text-align: center;
          padding: 120px 0;
          color: #888;
          font-size: 16px;
          font-weight: 500;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 24px;
          background: white;
          border-radius: 20px;
          border: 1px solid #f0f0f0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          transition: transform 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          min-width: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(8px);
        }

        .stat-info { flex: 1; }

        .stat-label {
          font-size: 14px;
          color: #777;
          display: block;
          margin-bottom: 6px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 26px;
          font-weight: 800;
          color: #1a1a1a;
          letter-spacing: -0.5px;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1.8fr 1fr;
          gap: 32px;
        }

        .card {
          background: white;
          border-radius: 24px;
          border: 1px solid #f0f0f0;
          padding: 28px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.02);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .card-header h3 {
          font-size: 18px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .text-btn {
          font-size: 14px;
          color: #00BFFF;
          font-weight: 700;
          text-decoration: none;
          padding: 6px 12px;
          border-radius: 8px;
          background: rgba(0,191,255,0.05);
          transition: all 0.2s;
        }

        .text-btn:hover {
          background: rgba(0,191,255,0.1);
          transform: translateX(4px);
        }

        .appointments-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .appointment-item {
          display: flex;
          align-items: center;
          padding: 18px;
          background: #f9fafb;
          border-radius: 16px;
          gap: 20px;
          border: 1px solid transparent;
          transition: all 0.2s;
        }

        .appointment-item:hover {
          background: white;
          border-color: #e0e0e0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }

        .app-time {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          color: #444;
          min-width: 80px;
          padding: 6px 10px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }

        .app-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .app-patient {
          font-size: 15px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .app-service {
          font-size: 13px;
          color: #777;
          font-weight: 500;
        }

        .status-badge {
          font-size: 12px;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 12px;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .icon-btn-small {
          color: #aaa;
          padding: 8px;
          border-radius: 10px;
          transition: all 0.2s;
          cursor: pointer;
        }

        .icon-btn-small:hover {
          background: #eee;
          color: #666;
        }

        .empty-state-inline {
          text-align: center;
          color: #999;
          font-size: 15px;
          padding: 40px 0;
          font-weight: 500;
          background: #fcfcfc;
          border-radius: 16px;
          border: 2px dashed #eee;
        }

        .resource-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .resource-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 16px;
          border-bottom: 1px solid #f0f0f0;
        }

        .resource-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .res-name {
          display: block;
          font-size: 15px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 4px;
        }

        .res-meta {
          font-size: 13px;
          color: #888;
          font-weight: 500;
        }

        .res-status {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 700;
          color: #444;
          padding: 6px 12px;
          background: #f9fafb;
          border-radius: 10px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 0 4px rgba(0,0,0,0.03);
        }

        .status-dot.disponible     { background: #4CAF50; box-shadow: 0 0 0 4px rgba(76,175,80,0.1); }
        .status-dot.mantenimiento  { background: #FF9800; box-shadow: 0 0 0 4px rgba(255,152,0,0.1); }
      `}</style>
    </div>
  );
}
