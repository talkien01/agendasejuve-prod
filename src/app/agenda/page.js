'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { format, addDays } from 'date-fns';
import { useFilters } from '@/context/FilterContext';

// Components
import AgendaToolbar from '@/components/agenda/AgendaToolbar';
import CalendarGrid from '@/components/agenda/CalendarGrid';
import AppointmentModal from '@/components/agenda/AppointmentModal';

import './agenda.css';

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
  const [appointments, setAppointments] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [resources, setResources] = useState([]);
  const [patients, setPatients] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isNewPatient, setIsNewPatient] = useState(false);
  
  const [newPatientData, setNewPatientData] = useState({
    name: '', email: '', phone: '', identifier: ''
  });
  
  const [form, setForm] = useState({
    patientId: '', professionalId: '', resourceId: '', type: 'Cita',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00', endTime: '10:00', status: 'PENDIENTE', notes: '',
  });

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

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      let url = `/api/appointments?date=${dateStr}`;
      if (branchId) url += `&localId=${branchId}`;
      if (professionalId) url += `&professionalId=${professionalId}`;
      if (statusFilter) url += `&status=${statusFilter}`;

      const [appsRes, profsRes, resRes, patsRes, meRes] = await Promise.all([
        fetch(url),
        fetch('/api/professionals'),
        fetch('/api/resources'),
        fetch('/api/patients'),
        fetch('/api/auth/me'),
      ]);
      const [apps, profs, res, pats, meData] = await Promise.all([
        appsRes.json(), profsRes.json(), resRes.json(), patsRes.json(), meRes.json()
      ]);
      setAppointments(Array.isArray(apps) ? apps : []);
      setProfessionals(Array.isArray(profs) ? profs : []);
      setResources(Array.isArray(res) ? res : []);
      setPatients(Array.isArray(pats) ? pats : []);
      setUser(meData.user || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentDate, branchId, professionalId, statusFilter]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filteredResources = useMemo(() => {
    if (!user || user.role === 'ADMIN') return resources;
    if (user.role === 'PSICOLOGIA') return resources.filter(r => r.type === 'Consultorio');
    if (user.role === 'RECURSOS') return resources.filter(r => r.type !== 'Consultorio');
    return resources;
  }, [resources, user]);

  const columns = useMemo(() => {
    if (view === 'professionals') {
      if (user?.role === 'RECURSOS') return [];
      return professionals
        .filter(p => !branchId || p.localId === branchId)
        .filter(p => !professionalId || p.id === professionalId)
        .map(p => ({ id: p.id, name: p.name, key: `prof-${p.id}` }));
    }
    return filteredResources
      .filter(r => !branchId || r.localId === branchId)
      .map(r => ({ id: r.id, name: r.name, key: `res-${r.id}` }));
  }, [view, professionals, filteredResources, user, branchId, professionalId]);

  const getAppointmentsForSlot = (colId, hour) => {
    return appointments.filter(app => {
      const appHour = parseInt(app.startTime?.split(':')[0], 10);
      if (view === 'resources') return app.resourceId === colId && appHour === hour;
      if (view === 'professionals') return app.professionalId === colId && appHour === hour;
      return false;
    });
  };

  const handleFormChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

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

  const handleOpenModal = (type) => {
    setForm({
      ...form,
      type: type,
      date: format(currentDate, 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '10:00',
      patientId: '',
      notes: ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if ((!isNewPatient && !form.patientId) || !form.type || !form.startTime) {
      alert('Por favor completa los campos obligatorios (*)');
      return;
    }

    if (isNewPatient && !newPatientData.name) {
      alert('El nombre del usuario es obligatorio');
      return;
    }

    const appointmentDateTime = new Date(`${form.date}T${form.startTime}`);
    const nowCheck = new Date();
    if (appointmentDateTime < nowCheck) {
      alert('No es posible programar citas en el pasado. Por favor selecciona una fecha y hora futura.');
      return;
    }

    setSaving(true);
    try {
      let finalPatientId = form.patientId;

      if (isNewPatient) {
        const pRes = await fetch('/api/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPatientData),
        });
        if (!pRes.ok) {
          const err = await pRes.json();
          throw new Error(err.error || 'Error al crear el usuario');
        }
        const newPatient = await pRes.json();
        finalPatientId = newPatient.id;
      }

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          patientId: finalPatientId,
          date: form.date, // Pass raw string
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
          patientId: '', professionalId: '', resourceId: '', type: 'Cita',
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
      <AgendaToolbar 
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        view={view}
        onViewChange={setView}
        user={user}
        onOpenModal={handleOpenModal}
      />

      <CalendarGrid 
        loading={loading}
        columns={columns}
        isToday={isToday}
        now={now}
        timeLineTop={timeLineTop}
        hours={hours}
        getAppointmentsForSlot={getAppointmentsForSlot}
        openNewAppointment={openNewAppointment}
        handleDeleteAppointment={handleDeleteAppointment}
        view={view}
        STATUS_BG={STATUS_BG}
        STATUS_COLOR={STATUS_COLOR}
      />

      <AppointmentModal 
        showModal={showModal}
        setShowModal={setShowModal}
        form={form}
        handleFormChange={handleFormChange}
        isNewPatient={isNewPatient}
        setIsNewPatient={setIsNewPatient}
        newPatientData={newPatientData}
        setNewPatientData={setNewPatientData}
        patients={patients}
        professionals={professionals}
        resources={resources}
        handleSave={handleSave}
        saving={saving}
      />
    </div>
  );
}
