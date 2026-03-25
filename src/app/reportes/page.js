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

const COLORS = ['#00BFFF', '#4CAF50', '#9C27B0', '#FF9800', '#009688', '#607D8B'];

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
    if (name.includes('Asistencia')) return 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
    if (name.includes('Reservas')) return 'linear-gradient(135deg, #00BFFF 0%, #4facfe 100%)';
    if (name.includes('Usuarios')) return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
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
              <span className="kpi-name">{kpi.name}</span>
              <TrendingUp size={16} color={kpi.color} />
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

      <div className="main-charts-row">
        <div className="card report-card full-width">
          <div className="card-header">
            <h3>Reservas Mensuales (Semestre Actual)</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyBookings} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00BFFF" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0070f3" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="label" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#666' }} 
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: '1px solid rgba(255,255,255,0.5)', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(8px)',
                    padding: '12px'
                  }}
                  itemStyle={{ fontWeight: 700, color: '#333' }}
                />
                <Bar 
                  dataKey="value" 
                  fill="url(#barGradient)" 
                  radius={[10, 10, 0, 0]} 
                  barSize={40} 
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="dist-charts-row">
        <div className="card report-card">
          <div className="card-header">
            <h3>Distribución de Servicios</h3>
          </div>
          <div className="chart-container">
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
                    border: '1px solid rgba(255,255,255,0.5)', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(8px)'
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card report-card">
          <div className="card-header">
            <h3>Distribución de Espacios</h3>
          </div>
          <div className="chart-container">
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
                    border: '1px solid rgba(255,255,255,0.5)', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(8px)'
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
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
          border-color: var(--brand-primary);
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
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .kpi-card-glass {
          padding: 24px;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
          overflow: hidden;
        }

        .kpi-card-glass:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
        }

        .kpi-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .kpi-name { 
          font-size: 12px; 
          font-weight: 700; 
          color: var(--text-secondary); 
          text-transform: uppercase; 
          letter-spacing: 1px;
        }

        .kpi-value { 
          font-size: 32px; 
          font-weight: 900; 
          color: var(--text-main);
          font-variant-numeric: tabular-nums;
        }

        .kpi-visual {
          height: 6px;
          background: rgba(0,0,0,0.03);
          border-radius: 10px;
          margin-top: 8px;
          overflow: hidden;
        }

        .kpi-gradient-bar {
          height: 100%;
          width: 70%; /* Representing value visually */
          border-radius: 10px;
        }

        .main-charts-row { width: 100%; }

        .report-card { 
          padding: 28px; 
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 15px 35px rgba(0,0,0,0.05);
          min-height: 400px;
          display: flex; 
          flex-direction: column; 
          transition: all 0.4s ease;
        }

        .report-card:hover {
          box-shadow: 0 20px 45px rgba(0,0,0,0.07);
        }

        .card-header h3 { 
          margin: 0; 
          font-size: 18px; 
          font-weight: 800; 
          color: var(--text-main); 
          letter-spacing: -0.3px;
        }

        .dist-charts-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .chart-container {
          flex: 1;
          margin-top: 25px;
          width: 100%;
          min-height: 280px;
        }

        @media (max-width: 1024px) {
          .kpi-grid { grid-template-columns: 1fr; }
          .dist-charts-row { grid-template-columns: 1fr; }
        }

        @media print {
          .reports-container { gap: 30px; }
          .btn-outline, .period-picker { display: none; }
        }
      `}</style>
    </div>
  );
}
