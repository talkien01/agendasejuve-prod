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
  Clock
} from 'lucide-react';
import './patient-details.css';

export default function PatientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [newRecord, setNewRecord] = useState({
    diagnosis: '',
    content: '',
    treatment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, hRes] = await Promise.all([
        fetch(`/api/patients/${params.id}`),
        fetch(`/api/patients/${params.id}/history`)
      ]);
      
      if (pRes.ok) setPatient(await pRes.json());
      if (hRes.ok) setHistory(await hRes.json());
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
      const res = await fetch(`/api/patients/${params.id}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord)
      });
      
      if (res.ok) {
        setIsAdding(false);
        setNewRecord({ diagnosis: '', content: '', treatment: '' });
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
                <div className="form-group">
                  <label>Diagnóstico / Motivo</label>
                  <input 
                    type="text" 
                    value={newRecord.diagnosis}
                    onChange={(e) => setNewRecord({...newRecord, diagnosis: e.target.value})}
                    placeholder="Ej. Valoración inicial, Seguimiento ansiedad..."
                    required
                  />
                </div>
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
                      <p className="record-content">{record.content}</p>
                      {record.treatment && (
                        <div className="record-treatment">
                          <strong>Tratamiento:</strong>
                          <p>{record.treatment}</p>
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
