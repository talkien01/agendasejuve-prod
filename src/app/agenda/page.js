'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Users,
  LayoutGrid,
  X,
  Loader2,
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

const STATUS_COLOR = {
  CONFIRMADA: '#1976d2',
  PENDIENTE:  '#f57c00',
  ASISTIDA:   '#388e3c',
  CANCELADA:  '#c62828',
};
const STATUS_BG = {
  CONFIRMADA: '#e3f2fd',
  PENDIENTE:  '#fff8e1',
  ASISTIDA:   '#e8f5e9',
  CANCELADA:  '#ffebee',
};

export default function AgendaPage() {
  const [view, setView]               = useState('resources');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [resources, setResources]     = useState([]);
  const [patients, setPatients]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [saving, setSaving]           = useState(false);
  const [form, setForm]               = useState({
    patientId: '', resourceId: '', type: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00', endTime: '10:00', status: 'PENDIENTE', notes: '',
  });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const [appsRes, profsRes, resRes, patsRes] = await Promise.all([
        fetch(`/api/appointments?date=${dateStr}`),
        fetch('/api/professionals'),
        fetch('/api/resources'),
        fetch('/api/patients'),
      ]);
      const [apps, profs, res, pats] = await Promise.all([
        appsRes.json(), profsRes.json(), resRes.json(), patsRes.json(),
      ]);
      setAppointments(Array.isArray(apps) ? apps : []);
      setProfessionals(Array.isArray(profs) ? profs : []);
      setResources(Array.isArray(res) ? res : []);
      setPatients(Array.isArray(pats) ? pats : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const columns = view === 'professionals'
    ? professionals.map(p => ({ id: p.id, name: p.name, key: `prof-${p.id}` }))
    : resources.map(r => ({ id: r.id, name: r.name, key: `res-${r.id}` }));

  const getAppointmentsForSlot = (colId, hour) => {
    return appointments.filter(app => {
      const appHour = parseInt(app.startTime?.split(':')[0], 10);
      if (view === 'resources') return app.resourceId === colId && appHour === hour;
      return false; // professionals view would need professionalId on appointment
    });
  };

  const handleFormChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!form.patientId || !form.type || !form.startTime) return;
    setSaving(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          date: new Date(form.date).toISOString(),
          resourceId: form.resourceId || null,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({
          patientId: '', resourceId: '', type: '',
          date: format(currentDate, 'yyyy-MM-dd'),
          startTime: '09:00', endTime: '10:00', status: 'PENDIENTE', notes: '',
        });
        fetchAll();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!confirm('¿Eliminar esta cita?')) return;
    await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  return (
    <div className="agenda-container">
      {/* Toolbar */}
      <div className="agenda-toolbar">
        <div className="toolbar-left">
          <div className="date-nav">
            <button className="icon-btn-outline" onClick={() => setCurrentDate(d => addDays(d, -1))}>
              <ChevronLeft size={18} />
            </button>
            <h3 className="current-date-text">
              {format(currentDate, "EEEE, d 'de' MMMM", { locale: es })}
            </h3>
            <button className="icon-btn-outline" onClick={() => setCurrentDate(d => addDays(d, 1))}>
              <ChevronRight size={18} />
            </button>
          </div>
          <button className="btn-today" onClick={() => setCurrentDate(new Date())}>Hoy</button>
        </div>
        <div className="toolbar-right">
          <div className="view-toggle">
            <button className={`toggle-btn ${view === 'professionals' ? 'active' : ''}`} onClick={() => setView('professionals')}>
              <Users size={16} /><span>Profesionales</span>
            </button>
            <button className={`toggle-btn ${view === 'resources' ? 'active' : ''}`} onClick={() => setView('resources')}>
              <LayoutGrid size={16} /><span>Recursos</span>
            </button>
          </div>
          <button className="btn-primary-small" onClick={() => setShowModal(true)}>
            <Plus size={16} /><span>Nueva Cita</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid-wrapper card">
        {loading ? (
          <div className="loading-grid">Cargando agenda...</div>
        ) : columns.length === 0 ? (
          <div className="loading-grid">
            No hay {view === 'resources' ? 'recursos' : 'profesionales'} registrados.
          </div>
        ) : (
          <table className="calendar-table">
            <thead>
              <tr>
                <th className="time-col" />
                {columns.map(col => (
                  <th key={col.key} className="column-header">
                    <div className="col-avatar">{col.name[0]}</div>
                    <span>{col.name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hours.map(hour => (
                <tr key={hour}>
                  <td className="time-label">{hour}:00</td>
                  {columns.map(col => {
                    const slotApps = getAppointmentsForSlot(col.id, hour);
                    return (
                      <td key={`${col.key}-${hour}`} className="calendar-slot">
                        {slotApps.map(app => (
                          <div
                            key={app.id}
                            className="appointment-block"
                            style={{
                              background: STATUS_BG[app.status] || '#e3f2fd',
                              borderLeftColor: STATUS_COLOR[app.status] || '#1976d2',
                            }}
                            title={`${app.patient?.name} — ${app.type}`}
                          >
                            <span className="app-title">{app.patient?.name}</span>
                            <span className="app-meta">{app.type}</span>
                            <button
                              className="app-delete"
                              onClick={() => handleDeleteAppointment(app.id)}
                              title="Eliminar"
                            >×</button>
                          </div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal: Nueva Cita */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nueva Cita</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Paciente *</label>
                <select name="patientId" value={form.patientId} onChange={handleFormChange}>
                  <option value="">Seleccionar paciente...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Tipo / Servicio *</label>
                <input name="type" placeholder="Ej: Valoración, Terapia" value={form.type} onChange={handleFormChange} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Fecha *</label>
                  <input type="date" name="date" value={form.date} onChange={handleFormChange} />
                </div>
                <div className="form-group">
                  <label>Hora inicio *</label>
                  <input type="time" name="startTime" value={form.startTime} onChange={handleFormChange} />
                </div>
                <div className="form-group">
                  <label>Hora fin</label>
                  <input type="time" name="endTime" value={form.endTime} onChange={handleFormChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Recurso</label>
                  <select name="resourceId" value={form.resourceId} onChange={handleFormChange}>
                    <option value="">Sin recurso</option>
                    {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Estado</label>
                  <select name="status" value={form.status} onChange={handleFormChange}>
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="CONFIRMADA">Confirmada</option>
                    <option value="ASISTIDA">Asistida</option>
                    <option value="CANCELADA">Cancelada</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Notas</label>
                <textarea name="notes" rows={3} placeholder="Observaciones..." value={form.notes} onChange={handleFormChange} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-save" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 size={16} className="spin" /> : <Plus size={16} />}
                {saving ? 'Guardando...' : 'Guardar Cita'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .agenda-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          height: calc(100vh - 80px);
          padding: 24px;
          padding-bottom: 0;
        }

        .agenda-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          padding: 12px 20px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          flex-shrink: 0;
        }

        .toolbar-left, .toolbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .date-nav { display: flex; align-items: center; gap: 8px; }

        .current-date-text {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-main);
          min-width: 220px;
          text-align: center;
          text-transform: capitalize;
        }

        .icon-btn-outline {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .btn-today {
          padding: 6px 16px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
        }

        .view-toggle {
          background: #f1f3f4;
          padding: 4px;
          border-radius: 8px;
          display: flex;
        }

        .toggle-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          border: none;
          background: none;
        }

        .toggle-btn.active {
          background: white;
          color: var(--brand-primary);
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .btn-primary-small {
          background: var(--brand-primary);
          color: white;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border: none;
        }

        .calendar-grid-wrapper {
          flex: 1;
          overflow: auto;
          background: white;
          padding: 0;
          border-radius: 10px;
          margin-bottom: 24px;
        }

        .loading-grid {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 300px;
          color: var(--text-secondary);
          font-size: 15px;
        }

        .calendar-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .time-col { width: 72px; }

        .column-header {
          padding: 14px;
          border-bottom: 2px solid #f0f0f0;
          position: sticky;
          top: 0;
          background: white;
          z-index: 10;
          text-align: center;
          font-size: 13px;
          font-weight: 600;
        }

        .col-avatar {
          width: 32px;
          height: 32px;
          background: #e8eaf6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 6px;
          font-size: 13px;
          font-weight: 700;
          color: var(--brand-primary);
        }

        .time-label {
          padding: 0 8px;
          font-size: 11px;
          color: var(--text-secondary);
          text-align: right;
          border-bottom: 1px solid #f8f9fa;
          vertical-align: top;
          padding-top: 8px;
        }

        .calendar-slot {
          border-right: 1px solid #f0f0f0;
          border-bottom: 1px solid #f0f0f0;
          height: 60px;
          position: relative;
          padding: 4px;
          vertical-align: top;
        }

        .appointment-block {
          border-radius: 4px;
          padding: 4px 6px;
          display: flex;
          flex-direction: column;
          font-size: 11px;
          border-left: 4px solid;
          position: relative;
          cursor: pointer;
          height: 100%;
          overflow: hidden;
        }

        .app-title {
          font-weight: 700;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .app-meta { color: #555; font-size: 10px; }

        .app-delete {
          position: absolute;
          top: 2px;
          right: 2px;
          background: rgba(0,0,0,0.1);
          border: none;
          border-radius: 2px;
          font-size: 12px;
          cursor: pointer;
          line-height: 1;
          padding: 0 3px;
          display: none;
        }

        .appointment-block:hover .app-delete { display: block; }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          border-radius: 16px;
          width: 540px;
          max-width: 95vw;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-color);
        }

        .modal-header h2 {
          font-size: 18px;
          font-weight: 700;
        }

        .modal-close {
          color: var(--text-secondary);
          cursor: pointer;
          border: none;
          background: none;
          display: flex;
        }

        .modal-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }

        .form-row {
          display: flex;
          gap: 12px;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 9px 12px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
          width: 100%;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: var(--brand-primary);
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid var(--border-color);
        }

        .btn-cancel {
          padding: 9px 20px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          background: white;
        }

        .btn-save {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 24px;
          background: var(--brand-primary);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-save:disabled { opacity: 0.7; cursor: not-allowed; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>
    </div>
  );
}
