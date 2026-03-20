import { Loader2, Eye, Edit2, Trash2 } from 'lucide-react';

export default function PatientTable({ 
  loading, 
  patients, 
  onEdit, 
  onDelete,
  getStatusStyle 
}) {
  if (loading) {
    return (
      <div className="loading-state">
        <Loader2 className="animate-spin" size={24} />
        <span>Cargando usuarios...</span>
      </div>
    );
  }

  return (
    <div className="data-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>NOMBRE</th>
            <th>CORREO</th>
            <th>TELÉFONO</th>
            <th>IDENTIFICACIÓN</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {patients.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                No se encontraron usuarios
              </td>
            </tr>
          ) : (
            patients.map((patient) => (
              <tr key={patient.id}>
                <td>
                  <div className="patient-info">
                    <div className="patient-avatar">
                      {patient.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="patient-name">{patient.name}</div>
                      <div className="patient-id">ID: {patient.id.slice(0, 8)}</div>
                    </div>
                  </div>
                </td>
                <td>{patient.email || '-'}</td>
                <td>{patient.phone || '-'}</td>
                <td>
                  <span className="identifier-text">{patient.identifier || '-'}</span>
                </td>
                <td>
                  <span 
                    className="status-badge"
                    style={{
                      backgroundColor: getStatusStyle(patient.status).bg,
                      color: getStatusStyle(patient.status).color
                    }}
                  >
                    {patient.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button title="Ver" className="action-btn"><Eye size={16} /></button>
                    <button title="Editar" className="action-btn" onClick={() => onEdit(patient)}><Edit2 size={16} /></button>
                    <button title="Eliminar" className="action-btn danger" onClick={() => onDelete(patient.id)}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
