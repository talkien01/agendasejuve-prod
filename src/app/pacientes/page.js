'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Components
import PatientHeader from '@/components/patients/PatientHeader';
import PatientFilterBar from '@/components/patients/PatientFilterBar';
import PatientTable from '@/components/patients/PatientTable';
import PatientModal from '@/components/patients/PatientModal';

import './patients.css';

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', identifier: '', status: 'Activo'
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/patients');
      if (res.ok) {
        const data = await res.json();
        setPatients(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (patient = null) => {
    if (patient) {
      setEditingPatient(patient);
      setFormData({
        name: patient.name || '',
        email: patient.email || '',
        phone: patient.phone || '',
        identifier: patient.identifier || '',
        status: patient.status || 'Activo'
      });
    } else {
      setEditingPatient(null);
      setFormData({
        name: '', email: '', phone: '', identifier: '', status: 'Activo'
      });
    }
    setIsModalOpen(true);
  };
  
  const handleView = (id) => {
    router.push(`/pacientes/${id}`);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPatient(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const url = editingPatient 
      ? `/api/patients/${editingPatient.id}` 
      : '/api/patients';
    
    const method = editingPatient ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        handleCloseModal();
        fetchPatients();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error || 'No se pudo guardar el usuario'}`);
      }
    } catch (err) {
      console.error('Error saving patient:', err);
      alert('Error de red al guardar el usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;

    try {
      const res = await fetch(`/api/patients/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchPatients();
      } else {
        alert('Error al eliminar el usuario');
      }
    } catch (err) {
      console.error('Error deleting patient:', err);
      alert('Error de red al eliminar el usuario');
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.identifier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    const dataToExport = filteredPatients.map(p => ({
      Nombre: p.name,
      Email: p.email || '',
      Telefono: p.phone || '',
      Identificacion: p.identifier || '',
      Estado: p.status,
      'Fecha Creacion': new Date(p.createdAt).toLocaleDateString()
    }));
    
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `pacientes_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    const dataToExport = filteredPatients.map(p => ({
      Nombre: p.name,
      Email: p.email || '',
      Telefono: p.phone || '',
      Identificacion: p.identifier || '',
      Estado: p.status,
      'Fecha Creacion': new Date(p.createdAt).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pacientes");
    XLSX.writeFile(wb, `pacientes_${new Date().getTime()}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Base de Pacientes", 14, 15);
    
    const tableColumn = ["Nombre", "Email", "Telefono", "Identificacion", "Estado"];
    const tableRows = filteredPatients.map(p => [
      p.name,
      p.email || '-',
      p.phone || '-',
      p.identifier || '-',
      p.status
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    
    doc.save(`pacientes_${new Date().getTime()}.pdf`);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Activo': return { bg: '#E8F5E9', color: '#2E7D32' };
      case 'Inactivo': return { bg: '#FFEBEE', color: '#C62828' };
      case 'Pendiente': return { bg: '#FFF3E0', color: '#EF6C00' };
      default: return { bg: '#F5F5F5', color: '#616161' };
    }
  };

  return (
    <div className="patients-page">
      <PatientHeader 
        onOpenModal={handleOpenModal} 
        exportToExcel={exportToExcel}
        exportToCSV={exportToCSV}
        exportToPDF={exportToPDF}
      />

      <PatientFilterBar 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />

      <PatientTable 
        loading={loading}
        patients={filteredPatients}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        onView={handleView}
        getStatusStyle={getStatusStyle}
      />

      <PatientModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingPatient={editingPatient}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
