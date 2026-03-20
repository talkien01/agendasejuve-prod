'use client';

import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Calendar, 
  Users, 
  ChevronDown,
  Download,
  Filter
} from 'lucide-react';

const kpis = [
  { name: 'Tasa de Asistencia', value: '92.4%', sub: '+2.1% vs mes pas.', color: '#4CAF50' },
  { name: 'Reservas Nuevas', value: '482', sub: '-5% vs mes pas.', color: '#00BFFF' },
  { name: 'Nuevos Pacientes', value: '64', sub: '+8% vs mes pas.', color: '#E91E63' },
];

export default function ReportsPage() {
  return (
    <div className="reports-container">
      <div className="page-header">
        <div className="header-info">
          <h1>Reportes y Analítica</h1>
          <p>Visualiza el crecimiento y rendimiento de tu centro</p>
        </div>
        <div className="header-actions">
          <button className="btn-outline">
            <Download size={18} />
            <span>Descargar Reporte</span>
          </button>
          <div className="period-picker">
            <Calendar size={16} />
            <span>Últimos 30 días</span>
            <ChevronDown size={14} />
          </div>
        </div>
      </div>

      <div className="kpi-grid">
        {kpis.map((kpi) => (
          <div key={kpi.name} className="card kpi-card">
            <span className="kpi-name">{kpi.name}</span>
            <div className="kpi-body">
              <span className="kpi-value">{kpi.value}</span>
              <span className="kpi-sub" style={{ color: kpi.sub.includes('+') ? '#4CAF50' : '#F44336' }}>
                {kpi.sub}
              </span>
            </div>
            <div className="kpi-progress-bg">
              <div className="kpi-progress-bar" style={{ width: '70%', backgroundColor: kpi.color }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="reports-grid">
        <div className="card report-card large">
          <div className="card-header">
            <h3>Reservas Mensuales</h3>
            <button className="icon-btn-gray"><Filter size={16} /></button>
          </div>
          <div className="chart-placeholder">
            {/* Visual representation of a bar chart */}
            <div className="bar-chart-sim">
              {[40, 60, 45, 90, 65, 80, 55, 70, 85, 95, 75, 88].map((h, i) => (
                <div key={i} className="bar-group">
                  <div className="bar" style={{ height: `${h}%` }}></div>
                  <span className="bar-label">{['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card report-card">
          <div className="card-header">
            <h3>Distribución de Servicios</h3>
          </div>
          <div className="chart-placeholder">
            <div className="pie-chart-sim">
              <div className="pie-segment s1"></div>
              <div className="pie-segment s2"></div>
              <div className="pie-segment s3"></div>
              <div className="pie-center"></div>
            </div>
            <div className="chart-legend">
              <div className="legend-item"><span className="dot s1"></span><span>Consulta (45%)</span></div>
              <div className="legend-item"><span className="dot s2"></span><span>Terapia (30%)</span></div>
              <div className="legend-item"><span className="dot s3"></span><span>Otros (25%)</span></div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .reports-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .period-picker {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .kpi-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .kpi-name {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
        }

        .kpi-body {
          display: flex;
          flex-direction: column;
        }

        .kpi-value {
          font-size: 28px;
          font-weight: 800;
          color: var(--text-main);
        }

        .kpi-sub {
          font-size: 12px;
          font-weight: 600;
        }

        .kpi-progress-bg {
          height: 4px;
          background: #f1f3f4;
          border-radius: 2px;
          margin-top: 8px;
        }

        .kpi-progress-bar {
          height: 100%;
          border-radius: 2px;
        }

        .reports-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .chart-placeholder {
          height: 300px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .bar-chart-sim {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          height: 100%;
          width: 100%;
          padding-top: 20px;
        }

        .bar-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          height: 100%;
        }

        .bar {
          width: 100%;
          min-width: 20px;
          background: var(--brand-primary);
          border-radius: 4px 4px 0 0;
          transition: opacity 0.2s;
        }

        .bar:hover { opacity: 0.8; }

        .bar-label {
          font-size: 11px;
          color: var(--text-secondary);
          font-weight: 700;
        }

        .pie-chart-sim {
          position: relative;
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background: conic-gradient(
            #00BFFF 0% 45%, 
            #4CAF50 45% 75%, 
            #FF9800 75% 100%
          );
          margin-bottom: 24px;
        }

        .pie-center {
          position: absolute;
          top: 30px;
          left: 30px;
          width: 120px;
          height: 120px;
          background: white;
          border-radius: 50%;
        }

        .chart-legend {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 500;
        }

        .dot { width: 10px; height: 10px; border-radius: 2px; }
        .dot.s1 { background: #00BFFF; }
        .dot.s2 { background: #4CAF50; }
        .dot.s3 { background: #FF9800; }
      `}</style>
    </div>
  );
}
