import { X } from 'lucide-react';

export default function PatientModal({
  isOpen,
  onClose,
  editingPatient,
  formData,
  setFormData,
  onSubmit,
  isSubmitting
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{editingPatient ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={onSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Nombre Completo</label>
              <input 
                type="text" 
                required 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ej. Juan Pérez"
              />
            </div>
            
            <div className="form-group">
              <label>Correo Electrónico</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="correo@ejemplo.com"
              />
            </div>
            
            <div className="form-group">
              <label>Teléfono</label>
              <input 
                type="tel" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+52 ..."
              />
            </div>
            
            <div className="form-group">
              <label>Identificación (CURP/ID)</label>
              <input 
                type="text" 
                value={formData.identifier}
                onChange={(e) => setFormData({...formData, identifier: e.target.value})}
                placeholder="CURP o ID de identidad"
              />
            </div>
            
            <div className="form-group">
              <label>Estado</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="Pendiente">Pendiente</option>
              </select>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
