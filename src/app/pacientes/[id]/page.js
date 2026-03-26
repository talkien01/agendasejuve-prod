'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  IdCard, 
  Plus, 
  FileText, 
  Stethoscope, 
  ClipboardList,
  Loader2,
  Save,
  Clock,
  Paperclip,
  FileIcon,
  Download
} from 'lucide-react';
import './patient-details.css';

export default function PatientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [dynamicData, setDynamicData] = useState({});
  
  // Form State
  const [newRecord, setNewRecord] = useState({
    diagnosis: '',
    content: '',
    treatment: ''
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Drag & Drop Handlers
  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, hRes, tRes] = await Promise.all([
        fetch(`/api/patients/${params.id}`),
        fetch(`/api/patients/${params.id}/history`),
        fetch('/api/settings/templates')
      ]);
      
      if (pRes.ok) setPatient(await pRes.json());
      if (hRes.ok) setHistory(await hRes.json());
      if (tRes.ok) setTemplates(await tRes.json());
    } catch (error) {
      console.error('Error fetching patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('diagnosis', newRecord.diagnosis);
      formData.append('content', newRecord.content);
      formData.append('treatment', newRecord.treatment);
      
      if (selectedTemplate) {
        formData.append('templateId', selectedTemplate.id);
        formData.append('templateData', JSON.stringify(dynamicData));
      }
      
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      const res = await fetch(`/api/patients/${params.id}/history`, {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        setIsAdding(false);
        setNewRecord({ diagnosis: '', content: '', treatment: '' });
        setSelectedFiles([]);
        fetchData();
      }
    } catch (error) {
      console.error('Error creating record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center h-full p-20">
        <Loader2 className="animate-spin" size={32} color="#00BFFF" />
      </div>
    );
  }

  if (!patient) return <div className="p-20 text-center">Paciente no encontrado</div>;

  return (
    <div className="patient-details-container">
      <button className="back-btn" onClick={() => router.back()}>
        <ArrowLeft size={18} />
        <span>Regresar a Usuarios</span>
      </button>

      <div className="details-layout">
        <aside className="patient-sidebar">
          <div className="card patient-card-main">
            <div className="card-avatar">
              {patient.name.charAt(0).toUpperCase()}
            </div>
            <h2>{patient.name}</h2>
            <span className="status-pill active">{patient.status}</span>
            
            <div className="info-list">
              <div className="info-item">
                <Mail size={16} />
                <span>{patient.email || 'Sin correo'}</span>
              </div>
              <div className="info-item">
                <Phone size={16} />
                <span>{patient.phone || 'Sin teléfono'}</span>
              </div>
              <div className="info-item">
                <IdCard size={16} />
                <span>{patient.identifier || 'Sin CURP/ID'}</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="history-content">
          <div className="section-header">
            <div className="title-group">
              <FileText size={20} />
              <h3>Historial Clínico / Notas</h3>
            </div>
            {!isAdding && (
              <button className="btn-primary" onClick={() => setIsAdding(true)}>
                <Plus size={18} />
                <span>Nueva Nota</span>
              </button>
            )}
          </div>

          {isAdding && (
            <div className="card form-card animate-slide-down">
              <h4>Agregar Nueva Nota de Evolución</h4>
              <form onSubmit={handleAddRecord}>
                {templates.length > 0 && (
                  <div className="form-group">
                    <label>Elegir Plantilla (Opcional)</label>
                    <select 
                      onChange={(e) => {
                        const t = templates.find(temp => temp.id === e.target.value);
                        setSelectedTemplate(t || null);
                        setDynamicData({});
                      }}
                      className="template-select"
                    >
                      <option value="">Nota de texto libre (Sin plantilla)</option>
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label>{selectedTemplate ? 'Título de la Nota / Diagnóstico' : 'Diagnóstico / Motivo'}</label>
                  <input 
                    type="text" 
                    value={newRecord.diagnosis}
                    onChange={(e) => setNewRecord({...newRecord, diagnosis: e.target.value})}
                    placeholder="Ej. Valoración inicial, Seguimiento ansiedad..."
                    required
                  />
                </div>

                {selectedTemplate ? (
                  <div className="dynamic-fields-container animate-fade-in">
                    {selectedTemplate.fields.map(field => (
                      <div key={field.id} className="form-group">
                        <label>{field.label} {field.required && <span className="required">*</span>}</label>
                        {field.type === 'text' && (
                          <input 
                            type="text" 
                            required={field.required}
                            onChange={(e) => setDynamicData({...dynamicData, [field.label]: e.target.value})}
                          />
                        )}
                        {field.type === 'textarea' && (
                          <textarea 
                            rows="3"
                            required={field.required}
                            onChange={(e) => setDynamicData({...dynamicData, [field.label]: e.target.value})}
                          ></textarea>
                        )}
                        {field.type === 'select' && (
                          <select 
                            required={field.required}
                            onChange={(e) => setDynamicData({...dynamicData, [field.label]: e.target.value})}
                          >
                            <option value="">Seleccione una opción...</option>
                            {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        )}
                        {field.type === 'checkbox' && (
                          <label className="checkbox-container">
                            <input 
                              type="checkbox" 
                              onChange={(e) => setDynamicData({...dynamicData, [field.label]: e.target.checked})}
                            />
                            <span>Confirmar / Sí</span>
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label>Nota Clínica (Desarrollo)</label>
                      <textarea 
                        rows="4"
                        value={newRecord.content}
                        onChange={(e) => setNewRecord({...newRecord, content: e.target.value})}
                        placeholder="Describe los puntos clave observados en la sesión..."
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Exploración / Tratamiento sugerido</label>
                      <textarea 
                        rows="2"
                        value={newRecord.treatment}
                        onChange={(e) => setNewRecord({...newRecord, treatment: e.target.value})}
                        placeholder="Opcional: Próximos pasos o tareas para el paciente..."
                      />
                    </div>
                  </>
                )}
                
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Paperclip size={16} />
                    <span>Adjuntar archivos (Imágenes, PDFs...)</span>
                  </label>
                  <div 
                    className={`dropzone ${isDragging ? 'dragging' : ''}`}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => document.getElementById('file-upload').click()}
                  >
                    <input 
                      id="file-upload"
                      type="file" 
                      multiple 
                      onChange={(e) => setSelectedFiles(prev => [...prev, ...Array.from(e.target.files)])}
                      style={{ display: 'none' }}
                    />
                    <div className="dropzone-content">
                      <Paperclip size={24} color={isDragging ? '#00BFFF' : '#aaa'} />
                      <p>{isDragging ? 'Suelta los archivos aquí' : 'Arrastra y suelta archivos aquí, o haz clic para examinar'}</p>
                    </div>
                  </div>
                  {selectedFiles.length > 0 && (
                    <div className="selected-files-list">
                      {selectedFiles.map((file, i) => (
                        <div key={i} className="selected-file-item">
                           {file.type ? (file.type.startsWith('image/') ? <FileIcon size={14} /> : <FileText size={14} />) : <FileText size={14} />}
                           <span>{file.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-ghost" onClick={() => setIsAdding(false)}>Cancelar</button>
                  <button type="submit" className="btn-save" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    <span>Guardar Nota</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="timeline">
            {history.length === 0 ? (
              <div className="empty-history">
                <ClipboardList size={48} color="#ddd" />
                <p>No hay registros clínicos para este paciente aún.</p>
              </div>
            ) : (
              history.map((record, index) => (
                <div key={record.id} className="timeline-item">
                  <div className="timeline-marker">
                    <div className="marker-dot"></div>
                  </div>
                  <div className="card record-card">
                    <div className="record-header">
                      <div className="record-meta">
                        <Clock size={14} />
                        <span>{new Date(record.date).toLocaleDateString('es-MX', { 
                          day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}</span>
                      </div>
                      <div className="record-prof">
                        <Stethoscope size={14} />
                        <span>{record.professional?.name || 'Administrador'}</span>
                      </div>
                    </div>
                    <div className="record-body">
                      <h4 className="record-diagnosis">{record.diagnosis || 'Nota General'}</h4>
                      
                      {record.templateData ? (
                        <div className="record-dynamic-data">
                          <div className="template-badge">
                            <FileText size={12} />
                            <span>Usa plantilla: {record.template?.name || 'Personalizada'}</span>
                          </div>
                          <div className="data-grid">
                            {Object.entries(record.templateData).map(([label, value]) => (
                              <div key={label} className="data-item">
                                <span className="data-label">{label}:</span>
                                <span className="data-value">
                                  {typeof value === 'boolean' ? (value ? '✅ Sí' : '❌ No') : (value || '-')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="record-content">{record.content}</p>
                          {record.treatment && (
                            <div className="record-treatment">
                              <strong>Tratamiento:</strong>
                              <p>{record.treatment}</p>
                            </div>
                          )}
                        </>
                      )}
                      
                      {record.attachments && record.attachments.length > 0 && (
                        <div className="record-attachments" style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #f0f0f0' }}>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#888', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                            Archivos adjuntos:
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {record.attachments.map(att => (
                              <a 
                                key={att.id} 
                                href={att.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="attachment-link"
                                style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '8px', 
                                  padding: '6px 12px', 
                                  background: '#f8f9fa', 
                                  border: '1px solid #eee', 
                                  borderRadius: '8px',
                                  fontSize: '13px',
                                  textDecoration: 'none',
                                  color: '#0070f3'
                                }}
                              >
                                {att.type.startsWith('image/') ? <FileIcon size={14} /> : <FileText size={14} />}
                                <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {att.name}
                                </span>
                                <Download size={12} />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
