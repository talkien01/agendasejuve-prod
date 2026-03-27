'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  FileText, 
  Type, 
  AlignLeft, 
  CheckSquare, 
  ChevronDown,
  X,
  AlertCircle
} from 'lucide-react';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [servicesData, setServicesData] = useState([]);
  const [showArchived, setShowArchived] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);

  useEffect(() => {
    fetchTemplates();
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/booking-data');
      if (res.ok) {
        const data = await res.json();
        setServicesData(data.services || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTemplates = async (includeArchived = false) => {
    try {
      const url = includeArchived ? '/api/settings/templates?all=true' : '/api/settings/templates';
      const res = await fetch(url);
      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = (type) => {
    const newField = {
      id: Math.random().toString(36).substr(2, 9),
      name: `field_${fields.length + 1}`,
      label: '',
      type: type, // 'text', 'textarea', 'select', 'checkbox'
      required: false,
      options: type === 'select' ? ['Opción 1', 'Opción 2'] : []
    };
    setFields([...fields, newField]);
  };

  const handleUpdateField = (id, updates) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleRemoveField = (id) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || fields.length === 0) {
      setMessage({ type: 'error', text: 'El nombre y al menos un campo son requeridos' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/settings/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingTemplate?.id,
          name,
          description,
          fields,
          serviceIds: selectedServices
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Plantilla guardada correctamente' });
        setShowForm(false);
        resetForm();
        fetchTemplates();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Error al guardar');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleArchive = () => {
    const next = !showArchived;
    setShowArchived(next);
    fetchTemplates(next);
  };

  const handleRestore = async (id) => {
    try {
      const res = await fetch(`/api/settings/templates?id=${id}`, { method: 'PATCH' });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Plantilla restaurada correctamente.' });
        fetchTemplates(showArchived);
      } else {
        throw new Error('Error al restaurar la plantilla');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de que deseas archivar esta plantilla? No se borrarán los expedientes antiguos pero no podrá usarse para nuevos.')) return;
    
    try {
      const res = await fetch(`/api/settings/templates?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Plantilla archivada.' });
        fetchTemplates(showArchived);
      } else {
        throw new Error('Error al archivar la plantilla');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setName(template.name);
    setDescription(template.description || '');
    setFields(template.fields);
    setSelectedServices(template.services?.map(s => s.id) || []);
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingTemplate(null);
    setName('');
    setDescription('');
    setFields([]);
    setSelectedServices([]);
  };

  const getIcon = (type) => {
    switch(type) {
      case 'text': return <Type size={16} />;
      case 'textarea': return <AlignLeft size={16} />;
      case 'select': return <ChevronDown size={16} />;
      case 'checkbox': return <CheckSquare size={16} />;
      default: return <FileText size={16} />;
    }
  };

  if (loading) return <div className="p-8">Cargando plantillas...</div>;

  return (
    <div className="settings-section">
      <div className="crud-header">
        <div>
          <h2>Plantillas de Historia Clínica</h2>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
            Diseña formularios personalizados para tus notas de evolución
          </p>
        </div>
        {!showForm && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              className="btn-outline"
              onClick={handleToggleArchive}
              style={{ fontSize: '13px', padding: '8px 14px', borderRadius: '8px', border: '1px solid #ddd6fe', color: showArchived ? '#7c3aed' : '#5b5376', background: showArchived ? '#ede9fe' : 'white', cursor: 'pointer' }}
            >
              {showArchived ? '📂 Ver activas' : '🗄️ Ver archivadas'}
            </button>
            <button className="btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
              <Plus size={18} /> Nueva Plantilla
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
          <AlertCircle size={18} />
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="alert-close"><X size={14} /></button>
        </div>
      )}

      {showForm ? (
        <div className="card template-builder animate-slide-up">
          <div className="builder-header">
            <h3>{editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}</h3>
            <button className="btn-icon" onClick={() => setShowForm(false)}><X size={20} /></button>
          </div>

          <form onSubmit={handleSave} className="builder-form">
            <div className="form-row">
              <div className="form-group flex-2">
                <label>Nombre de la Plantilla</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Ej. Valoración Inicial de Psicología" 
                  required 
                />
              </div>
              <div className="form-group flex-3">
                <label>Descripción (Opcional)</label>
                <input 
                  type="text" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Pequeña referencia sobre cuándo usar esta plantilla" 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>Vincular a Servicios (Por defecto)</label>
                <div className="services-checkbox-grid">
                  {servicesData.map(service => (
                    <label key={service.id} className="service-checkbox-item">
                      <input 
                        type="checkbox" 
                        checked={selectedServices.includes(service.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedServices([...selectedServices, service.id]);
                          else setSelectedServices(selectedServices.filter(id => id !== service.id));
                        }}
                      />
                      <span>{service.name}</span>
                    </label>
                  ))}
                </div>
                <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Si vinculas esta plantilla a un servicio, se cargará automáticamente cuando el paciente asista a dicha cita.</p>
              </div>
            </div>

            <div className="builder-layout">
              <div className="builder-content">
                <div className="fields-container">
                  <h4 className="section-subtitle">Campos del Formulario ({fields.length})</h4>
                  {fields.length === 0 ? (
                    <div className="empty-fields">
                      <FileText size={48} color="#eee" />
                      <p>No has añadido campos todavía. Usa el panel de la derecha.</p>
                    </div>
                  ) : (
                    <div className="fields-list">
                      {fields.map((field, idx) => (
                        <div key={field.id} className="field-item card">
                          <div className="field-header">
                            <span className="field-badge">Campo {idx + 1}: {field.type.toUpperCase()}</span>
                            <button type="button" className="btn-delete" onClick={() => handleRemoveField(field.id)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div className="field-body">
                            <div className="form-group">
                              <label>Etiqueta / Pregunta</label>
                              <input 
                                type="text" 
                                value={field.label} 
                                onChange={(e) => handleUpdateField(field.id, { label: e.target.value })} 
                                placeholder="Ej. Motivo de consulta, Antecedentes..."
                                required
                              />
                            </div>
                            
                            {field.type === 'select' && (
                              <div className="form-group">
                                <label>Opciones (separadas por comas)</label>
                                <input 
                                  type="text" 
                                  value={field.options.join(', ')} 
                                  onChange={(e) => handleUpdateField(field.id, { options: e.target.value.split(',').map(s => s.trim()) })} 
                                  placeholder="Opción 1, Opción 2, Opción 3"
                                />
                              </div>
                            )}

                            <div className="field-footer">
                              <label className="checkbox-label">
                                <input 
                                  type="checkbox" 
                                  checked={field.required} 
                                  onChange={(e) => handleUpdateField(field.id, { required: e.target.checked })} 
                                />
                                <span>Es obligatorio</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="builder-sidebar">
                <h4 className="section-subtitle">Añadir Campo</h4>
                <div className="add-buttons">
                  <button type="button" className="btn-add-field" onClick={() => handleAddField('text')}>
                    <Type size={18} /> Texto Corto
                  </button>
                  <button type="button" className="btn-add-field" onClick={() => handleAddField('textarea')}>
                    <AlignLeft size={18} /> Párrafo / Nota
                  </button>
                  <button type="button" className="btn-add-field" onClick={() => handleAddField('select')}>
                    <ChevronDown size={18} /> Lista Desplegable
                  </button>
                  <button type="button" className="btn-add-field" onClick={() => handleAddField('checkbox')}>
                    <CheckSquare size={18} /> Casilla de Verificación
                  </button>
                </div>

                <div className="builder-actions">
                  <button type="submit" className="btn-primary full-width" disabled={saving}>
                    <Save size={18} /> {saving ? 'Guardando...' : 'Guardar Plantilla'}
                  </button>
                  <button type="button" className="btn-outline full-width" onClick={() => setShowForm(false)}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="templates-grid">
          {templates.length === 0 ? (
            <div className="empty-state">
              <FileText size={64} color="#ddd" />
              <p>No hay plantillas creadas. Comienza creando una para estandarizar tus notas.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Campos</th>
                  <th>Fecha de Creación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {templates.map(t => (
                  <tr key={t.id}>
                    <td><strong>{t.name}</strong></td>
                    <td><span className="text-muted">{t.description || '-'}</span></td>
                    <td><span className="badge-gray">{t.fields.length} campos</span></td>
                    <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    {t.isActive ? (
                      <>
                        <button className="btn-outline-small" onClick={() => handleEdit(t)}>Editar</button>
                        <button className="btn-icon-danger" onClick={() => handleDelete(t.id)} title="Archivar">
                          <Trash2 size={16} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleRestore(t.id)}
                        style={{ background: '#ede9fe', color: '#7c3aed', border: '1px solid #ddd6fe', borderRadius: '6px', padding: '4px 12px', fontSize: '13px', cursor: 'pointer' }}
                      >
                        Restaurar
                      </button>
                    )}
                  </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <style jsx>{`
        .builder-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #eee;
        }

        .form-row {
          display: flex;
          gap: 20px;
          margin-bottom: 24px;
        }

        .flex-2 { flex: 2; }
        .flex-3 { flex: 3; }

        .builder-layout {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 32px;
          align-items: start;
        }

        .section-subtitle {
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #999;
          margin-bottom: 16px;
          font-weight: 700;
        }

        .fields-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .field-item {
          padding: 16px;
          border: 1px solid #eee;
          background: #fafafa;
        }

        .field-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .field-badge {
          font-size: 10px;
          font-weight: 800;
          color: #9d00ff;
          background: rgba(157, 0, 255, 0.1);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .field-footer {
          margin-top: 12px;
          display: flex;
          gap: 16px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          cursor: pointer;
        }

        .add-buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 32px;
        }

        .btn-add-field {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: white;
          border: 1px solid #eee;
          border-radius: 10px;
          font-size: 14px;
          color: #444;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .btn-add-field:hover {
          border-color: #7c3aed;
          color: #7c3aed;
          background: #f5f3ff;
          transform: translateX(4px);
        }

        .builder-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-top: 24px;
          border-top: 1px solid #eee;
        }

        .full-width { width: 100%; }

        .empty-fields {
          padding: 60px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          color: #ccc;
          background: #fdfdfd;
          border: 2px dashed #eee;
          border-radius: 16px;
        }

        .badge-gray {
          background: #f3f4f6;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          color: #4b5563;
        }

        .btn-delete:hover { opacity: 1; }

        .actions-cell {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .btn-outline-small {
          background: transparent;
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 4px 10px;
          font-size: 13px;
          color: #444;
          cursor: pointer;
        }

        .btn-outline-small:hover {
          border-color: #9d00ff;
          color: #9d00ff;
        }

        .btn-icon-danger {
          background: #ffeeee;
          color: #ff4d4d;
          border: none;
          padding: 6px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .btn-icon-danger:hover {
          background: #ffcccc;
        }

        .services-checkbox-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
          margin-top: 8px;
        }

        .service-checkbox-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          cursor: pointer;
          padding: 8px 12px;
          background: #f9f9f9;
          border: 1px solid #eee;
          border-radius: 8px;
        }

        .service-checkbox-item:hover {
          background: #f0f0f0;
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          font-size: 14px;
        }

        .alert-success { background: #E8F5E9; color: #2E7D32; }
        .alert-danger { background: #FFEBEE; color: #C62828; }
        .alert-close { margin-left: auto; background: none; border: none; cursor: pointer; opacity: 0.5; }

        .animate-slide-up {
          animation: slideUp 0.4s ease-out;
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .empty-state {
          padding: 100px 0;
          text-align: center;
          color: #aaa;
        }
      `}</style>
    </div>
  );
}
