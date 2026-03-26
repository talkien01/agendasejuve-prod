'use client';

import { useState, useEffect } from 'react';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCcw,
  Search,
  Filter
} from 'lucide-react';

export default function NotificationLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/notifications');
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching notification logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="notif-container">
      <div className="page-header">
        <div className="header-info">
          <h1>Log de Notificaciones</h1>
          <p>Monitorea el estado de los envíos por WhatsApp y Correo</p>
        </div>
        <button className="btn-outline" onClick={fetchLogs}>
          <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          <span>Actualizar</span>
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Buscar por destinatario o tipo..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card log-card">
        {loading ? (
          <div className="loading-state">Cargando logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="empty-state">No se encontraron notificaciones hoy.</div>
        ) : (
          <table className="log-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Destinatario</th>
                <th>Fecha/Hora</th>
                <th>Cita ID</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <div className="type-badge">
                      {log.type === 'WHATSAPP' ? <MessageSquare size={14} color="#25D366" /> : <Mail size={14} color="#9d00ff" />}
                      <span>{log.type}</span>
                    </div>
                  </td>
                  <td>
                    <div className={`status-pill ${log.status.toLowerCase()}`}>
                      {log.status === 'SENT' ? <CheckCircle2 size={12} /> : log.status === 'FAILED' ? <XCircle size={12} /> : <Clock size={12} />}
                      <span>{log.status}</span>
                    </div>
                  </td>
                  <td className="recipient-cell">{log.recipient}</td>
                  <td className="time-cell">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="id-cell">{log.appointmentId || '-'}</td>
                  <td className="error-cell">
                    {log.error ? (
                      <span className="error-text" title={log.error}>
                        {log.error.length > 50 ? `${log.error.substring(0, 50)}...` : log.error}
                      </span>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style jsx>{`
        .notif-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-info h1 { font-size: 24px; color: var(--text-main); }
        .header-info p { color: var(--text-secondary); }

        .btn-outline {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .filter-bar {
          display: flex;
          gap: 16px;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background: white;
          border: 1px solid var(--border-color);
          padding: 8px 16px;
          border-radius: 12px;
          width: 400px;
        }

        .search-box input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 14px;
        }

        .log-card {
          padding: 0;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(8px);
          border-radius: 16px;
        }

        .log-table {
          width: 100%;
          border-collapse: collapse;
        }

        .log-table th {
          text-align: left;
          padding: 16px 20px;
          background: rgba(0,0,0,0.02);
          font-size: 12px;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
        }

        .log-table td {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(0,0,0,0.03);
          font-size: 14px;
        }

        .type-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }

        .status-pill.sent { background: #e8f5e9; color: #2e7d32; }
        .status-pill.failed { background: #ffebee; color: #c62828; }
        .status-pill.pending { background: #fff3e0; color: #e65100; }

        .recipient-cell { font-weight: 500; font-family: monospace; }
        .time-cell { color: var(--text-secondary); font-size: 13px; }
        .id-cell { color: var(--text-secondary); font-size: 12px; }
        .error-cell { max-width: 250px; }
        .error-text { color: #dc2626; font-size: 11px; font-weight: 500; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .loading-state, .empty-state {
          padding: 60px;
          text-align: center;
          color: var(--text-secondary);
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
