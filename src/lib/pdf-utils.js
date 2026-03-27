import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates a professional PDF for a clinical record.
 * @param {Object} patient - The patient object
 * @param {Object} record - The clinical record object
 * @param {Object} professional - The professional who created the record
 */
export const generateClinicalRecordPDF = (patient, record, professional) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // --- Header ---
  doc.setFillColor(124, 58, 237); // Violet-600
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text('SEJUVE - HISTORIAL CLÍNICO', 15, 25);
  
  doc.setFontSize(10);
  doc.text(new Date().toLocaleDateString('es-MX'), pageWidth - 45, 25);
  
  // --- Patient Info Section ---
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(14);
  doc.text('Información del Paciente', 15, 55);
  doc.setLineWidth(0.5);
  doc.setDrawColor(200, 200, 200);
  doc.line(15, 58, 100, 58);
  
  doc.setFontSize(11);
  doc.text(`Nombre: ${patient?.name || 'N/A'}`, 15, 68);
  doc.text(`Email: ${patient?.email || 'N/A'}`, 15, 75);
  doc.text(`Teléfono: ${patient?.phone || 'N/A'}`, 15, 82);
  doc.text(`CURP/ID: ${patient?.identifier || 'N/A'}`, 15, 89);
  
  // --- Professional Info Section ---
  doc.text('Atendido por:', 120, 68);
  doc.setFont(undefined, 'bold');
  doc.text(professional?.name || 'Administrador', 120, 75);
  doc.setFont(undefined, 'normal');
  doc.text(professional?.specialty || 'Especialista', 120, 82);

  // --- Record Content ---
  doc.setFontSize(14);
  doc.text('Detalles de la Consulta', 15, 105);
  doc.line(15, 108, pageWidth - 15, 108);
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(`Diagnóstico / Motivo: ${record.diagnosis || 'Nota General'}`, 15, 118);
  doc.setFont(undefined, 'normal');
  doc.text(`Fecha: ${new Date(record.date).toLocaleDateString('es-MX', { 
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  })}`, 15, 125);

  // Content Table
  const contentBody = [];
  
  if (record.templateData) {
    Object.entries(record.templateData).forEach(([label, value]) => {
      contentBody.push([label, typeof value === 'boolean' ? (value ? 'Sí' : 'No') : (value || '-')]);
    });
  } else {
    contentBody.push(['Nota Clínica', record.content || 'Sin contenido']);
    if (record.treatment) {
      contentBody.push(['Tratamiento', record.treatment]);
    }
  }

  autoTable(doc, {
    startY: 135,
    head: [['Campo', 'Información']],
    body: contentBody,
    theme: 'striped',
    headStyles: { fillColor: [157, 0, 255] },
    margin: { left: 15, right: 15 },
    styles: { overflow: 'linebreak', cellPadding: 5 }
  });

  // --- Footer ---
  const finalY = doc.lastAutoTable?.finalY || 150;
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('Este documento es confidencial y para uso exclusivo del profesional de la salud.', 15, 280);
  doc.text(`Generado por el Sistema de Citas SEJUVE`, pageWidth - 70, 280);

  // Save/Download
  const fileName = `historial_${patient?.name?.replace(/\s+/g, '_')}_${record.id.slice(-5)}.pdf`;
  doc.save(fileName);
};
