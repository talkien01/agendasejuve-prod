'use client';

import './settings-crud.css';

export default function GeneralSettingsPage() {
  return (
    <div className="settings-section">
      <h2>Ajustes Generales</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <label>Nombre de la Aplicación</label>
          <input type="text" defaultValue="SEJUVE Citas" placeholder="Nombre de tu negocio" />
        </div>
        <div className="form-group">
          <label>Idioma del Sistema</label>
          <select defaultValue="es">
            <option value="es">Español (México)</option>
            <option value="en">English</option>
          </select>
        </div>
        <div className="form-group">
          <label>Zona Horaria</label>
          <select defaultValue="gmt6">
            <option value="gmt6">(GMT-06:00) Ciudad de México</option>
          </select>
        </div>
        <div className="modal-footer" style={{ padding: 0, marginTop: '32px' }}>
          <button className="btn-primary">Guardar Cambios</button>
        </div>
      </form>
    </div>
  );
}
