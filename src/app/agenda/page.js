'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Users,
  LayoutGrid,
  X,
  Loader2,
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useFilters } from '@/context/FilterContext';

const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

const STATUS_COLOR = {
  CONFIRMADA: '#1976d2',
  PENDIENTE: '#f57c00',
  ASISTIDA: '#388e3c',
  CANCELADA: '#c62828',
};
const STATUS_BG = {
  CONFIRMADA: '#e3f2fd',
  PENDIENTE: '#fff8e1',
  ASISTIDA: '#e8f5e9',
  CANCELADA: '#ffebee',
};

export default function AgendaPage() {
  const {
    selectedDate: currentDate, setSelectedDate: setCurrentDate,
    viewMode: view, setViewMode: setView,
    branchId, professionalId, statusFilter
  } = useFilters();

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const isToday = useMemo(() => {
    return format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  }, [currentDate]);

  const timeLineTop = useMemo(() => {
    const h = now.getHours();
    const m = now.getMinutes();
    if (h < 8 || h >= 21) return -1;
    return (h - 8) * 60 + (m / 60) * 60;
  }, [now]);

  const [appointments, setAppointments] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [resources, setResources] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [newPatientData, setNewPatientData] = useState({
    name: '',
    email: '',
    phone: '',
    identifier: ''
  });
  const [form, setForm] = useState({
    patientId: '', professionalId: '', resourceId: '', type: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00', endTime: '10:00', status: 'PENDIENTE', notes: '',
  });

  const openNewAppointment = (colId, hour) => {
    let defaultType = 'Cita';
    if (view === 'resources') {
      const res = resources.find(r => r.id === colId);
      if (res && (res.type === 'Auditorio' || res.type === 'Sala' || res.type === 'Cabina')) {
        defaultType = 'Reserva';
      }
    }
    
    setForm({
      ...form,
      date: format(currentDate, 'yyyy-MM-dd'),
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
      type: defaultType,
      professionalId: view === 'professionals' ? colId : '',
      resourceId: view === 'resources' ? colId : '',
    });
    setShowModal(true);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      let url = `/api/appointments?date=${dateStr}`;
      if (branchId) url += `&localId=${branchId}`;
      if (professionalId) url += `&professionalId=${professionalId}`;
      if (statusFilter) url += `&status=${statusFilter}`;

      const [appsRes, profsRes, resRes, patsRes] = await Promise.all([
        fetch(url),
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
  }, [currentDate, branchId, professionalId, statusFilter]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const columns = view === 'professionals'
    ? professionals
      .filter(p => !branchId || p.localId === branchId)
      .filter(p => !professionalId || p.id === professionalId)
      .map(p => ({ id: p.id, name: p.name, key: `prof-${p.id}` }))
    : resources
      .filter(r => !branchId || r.localId === branchId)
      .map(r => ({ id: r.id, name: r.name, key: `res-${r.id}` }));

  const getAppointmentsForSlot = (colId, hour) => {
    return appointments.filter(app => {
      const appHour = parseInt(app.startTime?.split(':')[0], 10);
      if (view === 'resources') return app.resourceId === colId && appHour === hour;
      if (view === 'professionals') return app.professionalId === colId && appHour === hour;
      return false;
    });
  };

  const handleFormChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if ((!isNewPatient && !form.patientId) || !form.type || !form.startTime) {
      alert('Por favor completa los campos obligatorios (*)');
      return;
    }

    if (isNewPatient && !newPatientData.name) {
      alert('El nombre del paciente es obligatorio');
      return;
    }

    // 0. Validation: Prevent past appointments
    const appointmentDateTime = new Date(`${form.date}T${form.startTime}`);
    const now = new Date();
    if (appointmentDateTime < now) {
      alert('No es posible programar citas en el pasado. Por favor selecciona una fecha y hora futura.');
      return;
    }

    setSaving(true);
    try {
      let finalPatientId = form.patientId;

      // 1. Create patient if new
      if (isNewPatient) {
        const pRes = await fetch('/api/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPatientData),
        });
        if (!pRes.ok) {
          const err = await pRes.json();
          throw new Error(err.error || 'Error al crear el paciente');
        }
        const newPatient = await pRes.json();
        finalPatientId = newPatient.id;
      }

      // 2. Create appointment
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          patientId: finalPatientId,
          date: new Date(form.date).toISOString(),
          professionalId: form.professionalId || null,
          resourceId: form.resourceId || null,
          localId: branchId || null,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setIsNewPatient(false);
        setNewPatientData({ name: '', email: '', phone: '', identifier: '' });
        setForm({
          patientId: '', professionalId: '', resourceId: '', type: '',
          date: format(currentDate, 'yyyy-MM-dd'),
          startTime: '09:00', endTime: '10:00', status: 'PENDIENTE', notes: '',
        });
        fetchAll();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Error al crear la cita');
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
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
          <div className="new-dropdown-container">
            <button className="btn-new-dropdown" onClick={() => setShowNewMenu(!showNewMenu)}>
              <span>Nuevo</span>
              <ChevronDown size={14} />
            </button>
            {showNewMenu && (
              <div className="new-menu-box card">
                <button className="menu-item" onClick={() => { setShowModal(true); setShowNewMenu(false); }}>
                  <Plus size={14} /> <span>Reserva</span>
                </button>
                <button className="menu-item" onClick={() => setShowNewMenu(false)}>
                  <X size={14} /> <span>Bloquear horario</span>
                </button>
                <button className="menu-item" onClick={() => { setShowNewMenu(false); }}>
                  <LayoutGrid size={14} /> <span>Nueva venta</span>
                </button>
              </div>
            )}
          </div>
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
              {/* Current Time Line */}
              {isToday && timeLineTop !== -1 && (
                <tr style={{ position: 'relative', height: 0 }}>
                  <td colSpan={100} style={{ padding: 0, position: 'absolute', top: timeLineTop, left: 0, right: 0, zIndex: 100, pointerEvents: 'none' }}>
                    <div className="current-time-line">
                      <div className="time-indicator-bubble">
                        {format(now, 'HH:mm')}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              {hours.map(hour => (
                <tr key={hour}>
                  <td className="time-label">{hour}:00</td>
                  {columns.map(col => {
                    const slotApps = getAppointmentsForSlot(col.id, hour);
                    return (
                      <td 
                        key={`${col.key}-${hour}`} 
                        className="calendar-slot"
                        onClick={() => openNewAppointment(col.id, hour)}
                      >
                        {slotApps.map(app => (
                          <div
                            key={app.id}
                            className="appointment-block"
                            onClick={(e) => e.stopPropagation()} // Prevent opening New Appointment modal
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAppointment(app.id);
                              }}
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
                <div className="label-with-action">
                  <label>Usuario *</label>
                  <button
                    className="text-btn-primary"
                    onClick={() => setIsNewPatient(!isNewPatient)}
                  >
                    {isNewPatient ? 'Seleccionar existente' : '+ Agregar usuario'}
                  </button>
                </div>

                {isNewPatient ? (
                  <div className="new-patient-fields">
                    <input
                      placeholder="Nombre Completo *"
                      value={newPatientData.name}
                      onChange={(e) => setNewPatientData({ ...newPatientData, name: e.target.value })}
                    />
                    <div className="form-row mt-8">
                      <input
                        placeholder="Email"
                        value={newPatientData.email}
                        onChange={(e) => setNewPatientData({ ...newPatientData, email: e.target.value })}
                      />
                      <input
                        placeholder="Teléfono"
                        value={newPatientData.phone}
                        onChange={(e) => setNewPatientData({ ...newPatientData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                ) : (
                  <select name="patientId" value={form.patientId} onChange={handleFormChange}>
                    <option value="">Seleccionar usuario...</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                )}
              </div>
              <div className="form-group">
                <label>Tipo / Servicio *</label>
                <select name="type" value={form.type} onChange={handleFormChange}>
                  <option value="Cita">Cita (Atención Psicológica)</option>
                  <option value="Reserva">Reserva (Espacios/Recursos)</option>
                </select>
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
                {form.type === 'Cita' && (
                  <div className="form-group">
                    <label>Profesional</label>
                    <select name="professionalId" value={form.professionalId} onChange={handleFormChange}>
                      <option value="">Sin profesional</option>
                      {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label>Recurso ({form.type === 'Cita' ? 'Consultorio' : 'Sala/Auditorio'})</label>
                  <select name="resourceId" value={form.resourceId} onChange={handleFormChange}>
                    <option value="">Sin recurso</option>
                    {resources
                      .filter(r => {
                        if (form.type === 'Cita') return r.type === 'Consultorio';
                        return r.type !== 'Consultorio';
                      })
                      .map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
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

        .current-time-line {
          position: absolute;
          left: 72px; /* After time column */
          right: 0;
          height: 2px;
          background: #ff5252;
          box-shadow: 0 0 4px rgba(255,82,82,0.5);
        }

        .time-indicator-bubble {
          position: absolute;
          left: -48px;
          top: -9px;
          background: #ff5252;
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 10px;
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

        .new-dropdown-container {
          position: relative;
        }

        .btn-new-dropdown {
          background: #6200ee;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px 0 0 8px;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .btn-new-dropdown:after {
          content: '';
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 32px;
          background: rgba(255,255,255,0.1);
          border-radius: 0 8px 8px 0;
        }

        /* Simplified "Nuevo" button to match the user screenshot better */
        .btn-new-dropdown {
          background: #6200ee;
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .new-menu-box {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          min-width: 180px;
          z-index: 100;
          display: flex;
          flex-direction: column;
          padding: 8px 0;
          border: 1px solid var(--border-color);
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          font-size: 14px;
          color: var(--text-main);
          transition: background 0.2s;
        }

        .menu-item:hover {
          background: #f5f5f5;
        }

        .label-with-action {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2px;
        }

        .text-btn-primary {
          background: none;
          border: none;
          color: var(--brand-primary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }

        .new-patient-fields {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px dashed var(--border-color);
        }

        .mt-8 { margin-top: 8px; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>
    </div>
  );
}
