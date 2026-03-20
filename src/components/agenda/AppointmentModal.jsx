import { X, Loader2, Plus } from 'lucide-react';

export default function AppointmentModal({
  showModal,
  setShowModal,
  form,
  handleFormChange,
  isNewPatient,
  setIsNewPatient,
  newPatientData,
  setNewPatientData,
  patients,
  professionals,
  resources,
  handleSave,
  saving
}) {
  if (!showModal) return null;

  return (
    <div className="modal-overlay" onClick={() => setShowModal(false)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{form.type === 'Cita' ? 'Nueva Cita' : 'Nueva Reserva'}</h2>
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
            {saving ? 'Guardando...' : `Guardar ${form.type === 'Cita' ? 'Cita' : 'Reserva'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
