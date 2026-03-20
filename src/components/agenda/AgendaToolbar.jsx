import { ChevronLeft, ChevronRight, ChevronDown, Plus, Users, LayoutGrid, X } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useRef, useEffect } from 'react';

export default function AgendaToolbar({ 
  currentDate, 
  onDateChange, 
  view, 
  onViewChange, 
  user,
  onOpenModal 
}) {
  const [showNewMenu, setShowNewMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowNewMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="agenda-toolbar">
      <div className="toolbar-left">
        <div className="date-nav">
          <button className="icon-btn-outline" onClick={() => onDateChange(addDays(currentDate, -1))}>
            <ChevronLeft size={18} />
          </button>
          <h3 className="current-date-text">
            {format(currentDate, "EEEE, d 'de' MMMM", { locale: es })}
          </h3>
          <button className="icon-btn-outline" onClick={() => onDateChange(addDays(currentDate, 1))}>
            <ChevronRight size={18} />
          </button>
        </div>
        <button className="btn-today" onClick={() => onDateChange(new Date())}>Hoy</button>
      </div>
      <div className="toolbar-right">
        <div className="view-toggle">
          <button className={`toggle-btn ${view === 'professionals' ? 'active' : ''}`} onClick={() => onViewChange('professionals')}>
            <Users size={16} /><span>Profesionales</span>
          </button>
          <button className={`toggle-btn ${view === 'resources' ? 'active' : ''}`} onClick={() => onViewChange('resources')}>
            <LayoutGrid size={16} /><span>Recursos</span>
          </button>
        </div>
        <div className="new-dropdown-container" ref={menuRef}>
          <button className="btn-new-dropdown" onClick={() => setShowNewMenu(!showNewMenu)}>
            <span>Nuevo</span>
            <ChevronDown size={14} />
          </button>
          {showNewMenu && (
            <div className="new-menu-box card">
              {(user?.role === 'ADMIN' || user?.role === 'PSICOLOGIA') && (
                <button className="menu-item" onClick={() => { 
                  onOpenModal('Cita');
                  setShowNewMenu(false); 
                }}>
                  <Plus size={14} /> <span>Cita</span>
                </button>
              )}
              {(user?.role === 'ADMIN' || user?.role === 'RECURSOS') && (
                <button className="menu-item" onClick={() => { 
                  onOpenModal('Reserva');
                  setShowNewMenu(false); 
                }}>
                  <Plus size={14} /> <span>Reserva</span>
                </button>
              )}
              <button className="menu-item" onClick={() => setShowNewMenu(false)}>
                <X size={14} /> <span>Bloquear horario</span>
              </button>
              <button className="menu-item" onClick={() => { setShowNewMenu(false); }}>
                <LayoutGrid size={14} /> <span>Nueva venta</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
