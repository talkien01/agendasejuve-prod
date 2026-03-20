'use client';

import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Calendar, 
  Users, 
  ChevronDown,
  Download,
  Filter,
  Loader2
} from 'lucide-react';

import { useState, useEffect } from 'react';

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        const res = await fetch('/api/dashboard/reports');
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '100px' }}>
        <Loader2 className="animate-spin" size={32} color="#0070f3" />
      </div>
    );
  }

  if (!data) return <div>Error al cargar reportes.</div>;

  const { kpis, monthlyBookings, serviceDist, spaceDist } = data;

  // Helper to generate conic gradient from distribution
  const getGradient = (dist, colors) => {
    let current = 0;
    const parts = dist.map((item, i) => {
      const start = current;
      current += item.value;
      return `${colors[i]} ${start}% ${current}%`;
    }).join(', ');
    return `conic-gradient(${parts})`;
  };

  const handleDownload = () => {
    try {
      if (!data) return;
      console.log("Iniciando descarga de reporte CSV...");

      let csvContent = "\ufeffINDICADOR,VALOR\n";
      kpis.forEach(kpi => {
        csvContent += `${kpi.name},"${kpi.value}"\n`;
      });
      
      csvContent += "\nDISTRIBUCION DE SERVICIOS,%\n";
      serviceDist.forEach(item => {
        csvContent += `${item.name},${item.value}\n`;
      });

      csvContent += "\nDISTRIBUCION DE ESPACIOS,%\n";
      spaceDist.forEach(item => {
        csvContent += `${item.name},${item.value}\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `reporte_sejuve_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      console.log("Simulando clic en enlace de descarga...");
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log("Limpieza de URL de descarga completada.");
      }, 500);
    } catch (err) {
      console.error("Error al descargar reporte:", err);
      alert("No se pudo descargar el reporte. Intente de nuevo.");
    }
  };

  return (
    <div className="reports-container">
      <div className="page-header">
        <div className="header-info">
          <h1>Reportes y Analítica</h1>
          <p>Visualiza el crecimiento y rendimiento de tu centro</p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-outline" onClick={handleDownload}>
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
            </div>
            <div className="kpi-progress-bg">
              <div className="kpi-progress-bar" style={{ width: '100%', backgroundColor: kpi.color }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="main-charts-row">
        <div className="card report-card full-width">
          <div className="card-header">
            <h3>Reservas Mensuales (Semestre Actual)</h3>
          </div>
          <div className="chart-container">
            <div className="bar-chart-sim">
              {monthlyBookings.map((m, i) => {
                const maxVal = Math.max(...monthlyBookings.map(x => x.value), 1);
                const height = (m.value / maxVal) * 100;
                return (
                  <div key={i} className="bar-group">
                    <div className="bar" style={{ height: `${height}%` }} title={`${m.label}: ${m.value}`}></div>
                    <span className="bar-label">{m.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="dist-charts-row">
        <div className="card report-card">
          <div className="card-header">
            <h3>Distribución de Servicios</h3>
          </div>
          <div className="chart-container pie-layout">
            <div className="pie-chart-sim" style={{ background: getGradient(serviceDist, ['#00BFFF', '#4CAF50', '#9C27B0']) }}>
              <div className="pie-center"></div>
            </div>
            <div className="chart-legend">
              {serviceDist.map((item, i) => (
                <div key={item.name} className="legend-item">
                  <span className="dot" style={{ backgroundColor: ['#00BFFF', '#4CAF50', '#9C27B0'][i] }}></span>
                  <span>{item.name} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card report-card">
          <div className="card-header">
            <h3>Distribución de Espacios</h3>
          </div>
          <div className="chart-container pie-layout">
            <div className="pie-chart-sim" style={{ background: getGradient(spaceDist, ['#FF9800', '#009688', '#607D8B']) }}>
              <div className="pie-center"></div>
            </div>
            <div className="chart-legend">
              {spaceDist.map((item, i) => (
                <div key={item.name} className="legend-item">
                  <span className="dot" style={{ backgroundColor: ['#FF9800', '#009688', '#607D8B'][i] }}></span>
                  <span>{item.name} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .reports-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding-bottom: 20px;
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
          gap: 8px;
        }

        .kpi-name { font-size: 13px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; }
        .kpi-value { font-size: 28px; font-weight: 800; color: var(--text-main); }
        .kpi-progress-bg { height: 4px; background: #f1f3f4; border-radius: 2px; }
        .kpi-progress-bar { height: 100%; border-radius: 2px; }

        .main-charts-row { width: 100%; }
        .dist-charts-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .report-card { padding: 20px; }
        .card-header h3 { margin: 0; font-size: 16px; font-weight: 700; color: var(--text-main); }

        .chart-container {
          height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 15px;
        }

        .pie-layout {
          justify-content: flex-start;
          gap: 40px;
        }

        .bar-chart-sim {
          display: flex;
          align-items: flex-end;
          gap: 15px;
          height: 100%;
          width: 100%;
        }

        .bar-group { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; height: 100%; }
        .bar { width: 100%; max-width: 60px; background: var(--brand-primary); border-radius: 4px 4px 0 0; }
        .bar-label { font-size: 11px; color: var(--text-secondary); font-weight: 700; }

        .pie-chart-sim { position: relative; width: 160px; height: 160px; border-radius: 50%; }
        .pie-center { position: absolute; top: 25px; left: 25px; width: 110px; height: 110px; background: white; border-radius: 50%; }

        .chart-legend { display: flex; flex-direction: column; gap: 10px; }
        .legend-item { display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 600; }
        .dot { width: 10px; height: 10px; border-radius: 2px; }

        @media print {
          .reports-container { gap: 30px; }
          .btn-outline, .period-picker { display: none; }
        }
      `}</style>
    </div>
  );
}
