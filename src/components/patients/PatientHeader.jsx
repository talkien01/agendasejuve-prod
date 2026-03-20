import { Download, ChevronDown, Plus } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function PatientHeader({ 
  onOpenModal, 
  exportToExcel, 
  exportToCSV, 
  exportToPDF 
}) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="page-header">
      <div className="header-title">
        <h1>Base de Usuarios</h1>
        <p>Gestiona la información y el historial de tus clientes</p>
      </div>
      <div className="header-actions">
        <div className="export-container" ref={menuRef}>
          <button className="btn-secondary" onClick={() => setShowExportMenu(!showExportMenu)}>
            <Download size={18} />
            <span>Exportar</span>
            <ChevronDown size={14} />
          </button>
          {showExportMenu && (
            <div className="export-menu">
              <button onClick={() => { exportToExcel(); setShowExportMenu(false); }}>Excel (.xlsx)</button>
              <button onClick={() => { exportToCSV(); setShowExportMenu(false); }}>CSV (.csv)</button>
              <button onClick={() => { exportToPDF(); setShowExportMenu(false); }}>PDF (.pdf)</button>
            </div>
          )}
        </div>
        <button className="btn-primary" onClick={() => onOpenModal()}>
          <Plus size={18} />
          <span>Nuevo Usuario</span>
        </button>
      </div>
    </header>
  );
}
