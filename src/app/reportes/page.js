'use client';

import { 
  BarChart3, 
  PieChart as LucidePieChart, 
  TrendingUp, 
  Calendar, 
  Users, 
  ChevronDown,
  Download,
  Filter,
  Loader2
} from 'lucide-react';

import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

const COLORS = ['#9d00ff', '#d946ef', '#f472b6', '#a855f7', '#ec4899', '#c084fc'];

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
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 500);
    } catch (err) {
      console.error("Error al descargar reporte:", err);
      alert("No se pudo descargar el reporte. Intente de nuevo.");
    }
  };

  const getKpiGradient = (name) => {
    if (name.includes('Asistencia')) return 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)';
    if (name.includes('Reservas')) return 'linear-gradient(135deg, #8b5cf6 0%, #c084fc 100%)';
    if (name.includes('Usuarios')) return 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)';
    return 'linear-gradient(135deg, #9d00ff 0%, #d946ef 100%)';
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
          <div key={kpi.name} className="card kpi-card-glass" style={{ borderLeft: `4px solid ${kpi.color}` }}>
            <div className="kpi-header">
              <TrendingUp size={24} color={kpi.color || '#9d00ff'} />
              <span className="kpi-name">{kpi.name}</span>
            </div>
            <div className="kpi-body">
              <span className="kpi-value">{kpi.value}</span>
            </div>
            <div className="kpi-visual">
               <div className="kpi-gradient-bar" style={{ background: getKpiGradient(kpi.name) }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="card report-card tech-card">
          <div className="card-header">
            <h3>Reservas Mensuales</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyBookings} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="barTechGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor="#9d00ff" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#d946ef" stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(157, 0, 255, 0.1)" />
                <XAxis type="number" hide />
                <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#666' }} width={80} />
                <Tooltip 
                  cursor={{ fill: 'rgba(157,0,255,0.05)' }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: '1px solid rgba(157, 0, 255, 0.2)', 
                    boxShadow: '0 10px 30px rgba(157,0,255,0.1)',
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(8px)',
                    padding: '12px'
                  }}
                  itemStyle={{ fontWeight: 700, color: '#9d00ff' }}
                />
                <Bar 
                  dataKey="value" 
                  fill="url(#barTechGradient)" 
                  radius={[0, 10, 10, 0]} 
                  barSize={20} 
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card report-card tech-card">
          <div className="card-header">
            <h3>Distribución de Servicios</h3>
          </div>
          <div className="chart-container">
            {serviceDist.reduce((a, b) => a + b.value, 0) === 0 ? (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                Sin datos suficientes
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    animationDuration={1000}
                  >
                    {serviceDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: '1px solid rgba(157, 0, 255, 0.2)', 
                      boxShadow: '0 10px 30px rgba(157,0,255,0.1)',
                      background: 'rgba(255,255,255,0.9)'
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card report-card tech-card">
          <div className="card-header">
            <h3>Distribución de Espacios</h3>
          </div>
          <div className="chart-container">
            {spaceDist.reduce((a, b) => a + b.value, 0) === 0 ? (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                Aún no hay reservas
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spaceDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    animationDuration={1000}
                  >
                    {spaceDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: '1px solid rgba(157, 0, 255, 0.2)', 
                      boxShadow: '0 10px 30px rgba(157,0,255,0.1)',
                      background: 'rgba(255,255,255,0.9)'
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .reports-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding-bottom: 40px;
          animation: fadeIn 0.8s ease-out;
          background: radial-gradient(circle at top left, rgba(217, 70, 239, 0.05), transparent 40%),
                      radial-gradient(circle at bottom right, rgba(157, 0, 255, 0.05), transparent 40%);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .header-info h1 {
          font-size: 28px;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.5px;
        }

        .header-info p {
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .btn-outline {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(8px);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          font-weight: 600;
          color: var(--text-main);
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }

        .btn-outline:hover {
          background: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(0,0,0,0.1);
          border-color: #9d00ff;
          color: #9d00ff;
        }

        .period-picker {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .kpi-card-glass {
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(16px);
          border-radius: 20px;
          border: 1px solid rgba(74, 20, 140, 0.1);
          box-shadow: 0 4px 15px rgba(74, 20, 140, 0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          gap: 10px;
          position: relative;
          overflow: hidden;
        }

        .kpi-card-glass::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 100%;
          background: linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 100%);
          z-index: 0;
          pointer-events: none;
        }

        .kpi-card-glass:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow: 0 8px 25px rgba(74, 20, 140, 0.12);
          border-color: rgba(74, 20, 140, 0.25);
        }

        .kpi-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          z-index: 1;
        }

        .kpi-name { 
          font-size: 13px; 
          font-weight: 700; 
          color: #6b7280; 
          text-transform: uppercase; 
          letter-spacing: 1.5px;
        }

        .kpi-body {
          z-index: 1;
        }

        .kpi-value { 
          font-size: 36px; 
          font-weight: 900; 
          color: #4a148c;
          font-variant-numeric: tabular-nums;
        }

        .kpi-visual {
          width: 50%;
          height: 4px;
          background: rgba(157, 0, 255, 0.1);
          border-radius: 10px;
          margin-top: auto;
          overflow: hidden;
          z-index: 1;
        }

        .kpi-gradient-bar {
          height: 100%;
          width: 100%; 
          border-radius: 10px;
          animation: slideRight 1s ease-out forwards;
        }
        
        @keyframes slideRight {
          from { width: 0; }
          to { width: 100%; }
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .tech-card { 
          padding: 24px; 
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(16px);
          border-radius: 24px;
          border: 1px solid rgba(74, 20, 140, 0.1);
          box-shadow: 0 6px 20px rgba(74, 20, 140, 0.05);
          min-height: 380px;
          display: flex; 
          flex-direction: column; 
          transition: all 0.4s ease;
        }

        .tech-card:hover {
          box-shadow: 0 12px 30px rgba(74, 20, 140, 0.1);
          border-color: rgba(74, 20, 140, 0.2);
        }

        .card-header h3 { 
          margin: 0; 
          font-size: 17px; 
          font-weight: 800; 
          color: #1f2937; 
          letter-spacing: -0.2px;
          text-align: center;
          margin-bottom: 10px;
        }

        .chart-container {
          flex: 1;
          width: 100%;
          border-radius: 12px;
          overflow: hidden;
        }

        @media (max-width: 1200px) {
          .charts-grid { grid-template-columns: repeat(2, 1fr); }
          .kpi-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .charts-grid { grid-template-columns: 1fr; }
          .kpi-grid { grid-template-columns: 1fr; }
        }

        @media print {
          .reports-container { gap: 30px; }
          .btn-outline, .period-picker { display: none; }
        }
      `}</style>
    </div>
  );
}
