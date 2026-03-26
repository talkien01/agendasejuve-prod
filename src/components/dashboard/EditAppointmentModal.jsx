import { useState, useEffect } from 'react';
import { X, Loader2, Save, Trash2 } from 'lucide-react';
import './EditAppointmentModal.css';

export default function EditAppointmentModal({ appointment, onClose, onSave, onDelete }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [patients, setPatients] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [resources, setResources] = useState([]);

  const [form, setForm] = useState({
    patientId: '',
    professionalId: '',
    resourceId: '',
    type: 'Cita',
    date: '',
    startTime: '',
    endTime: '',
    status: 'PENDIENTE',
    notes: ''
  });

  useEffect(() => {
    if (appointment) {
      setForm({
        patientId: appointment.patientId || '',
        professionalId: appointment.professionalId || '',
        resourceId: appointment.resourceId || '',
        localId: appointment.localId || '',
        type: appointment.type || 'Cita',
        date: appointment.date ? appointment.date.split('T')[0] : '', // Usually date string from DB
        startTime: appointment.startTime || '',
        endTime: appointment.endTime || '',
        status: appointment.status || 'PENDIENTE',
        notes: appointment.notes || ''
      });
    }
  }, [appointment]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, professionalsRes, resourcesRes] = await Promise.all([
          fetch('/api/patients'),
          fetch('/api/professionals'),
          fetch('/api/resources')
        ]);
        
        const [pats, profs, res] = await Promise.all([
          patientsRes.json(),
          professionalsRes.json(),
          resourcesRes.json()
        ]);
        
        setPatients(Array.isArray(pats) ? pats : []);
        setProfessionals(Array.isArray(profs) ? profs : []);
        setResources(Array.isArray(res) ? res : []);
      } catch (error) {
        console.error('Error fetching data for modal:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.details || data.error || 'Failed to update appointment');
      }

      const updatedAppointment = await res.json();
      onSave(updatedAppointment);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer.')) return;
    
    
    setSaving(true);
    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        let msg = 'Error al eliminar la cita';
        try {
          const data = await res.json();
          msg = data.details || data.error || msg;
        } catch(e) {}
        throw new Error(msg);
      }

      window.alert('Cita eliminada correctamente');
      onDelete(appointment.id);
    } catch (error) {
      console.error(error);
      window.alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!appointment) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Modificar Cita</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        {loading ? (
          <div className="modal-body flex-center" style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="spin" size={32} color="#00BFFF" />
          </div>
        ) : (
          <div className="modal-body">
            <div className="form-group">
              <label>Usuario *</label>
              <select name="patientId" value={form.patientId} onChange={handleFormChange} disabled>
                <option value="">Seleccionar usuario...</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <small style={{ color: '#888', marginTop: '4px', display: 'block' }}>El usuario no se puede cambiar al editar.</small>
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
        )}

        <div className="modal-footer">
          <button type="button" className="btn-delete" onClick={handleDelete} disabled={saving} title="Eliminar cita">
            <Trash2 size={16} />
            <span>Eliminar</span>
          </button>
          <div className="footer-right">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={saving}>Cancelar</button>
            <button type="button" className="btn-save" onClick={handleUpdate} disabled={loading || saving}>
              {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
