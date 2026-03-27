import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Link2, ChevronDown } from 'lucide-react';
import { useFilters } from '@/context/FilterContext';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Sidebar() {
  const { 
    selectedDate, setSelectedDate, 
    branchId, setBranchId, 
    viewMode, setViewMode, 
    professionalId, setProfessionalId, 
    statusFilter, setStatusFilter 
  } = useFilters();

  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [locales, setLocales] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [locRes, profRes, meRes] = await Promise.all([
          fetch('/api/admin/locales'),
          fetch('/api/professionals'),
          fetch('/api/auth/me')
        ]);
        const locData = await locRes.json();
        const profData = await profRes.json();
        const meData = await meRes.json();
        
        setLocales(locData.locales || []);
        setProfessionals(Array.isArray(profData) ? profData : []);
        const currentUser = meData.user || null;
        setUser(currentUser);

        // Auto-switch view if RECURSOS
        if (currentUser?.role === 'RECURSOS' && viewMode !== 'resources') {
          setViewMode('resources');
        }
      } catch (err) {
        console.error('Error fetching sidebar data:', err);
      }
    }
    fetchData();
  }, [viewMode, setViewMode]);

  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Calculate padding for start of month
  const firstDay = (monthStart.getDay() + 6) % 7; // Monday = 0
  const paddingDays = Array.from({ length: firstDay });

  return (
    <aside className="sidebar">
      <div className="sidebar-section calendar-section">
        <div className="mini-calendar">
          <div className="cal-header">
            <button onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}>&lt;</button>
            <span>{format(calendarMonth, 'MMMM yyyy', { locale: es })}</span>
            <button onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}>&gt;</button>
          </div>
          <div className="cal-grid">
            <span className="cal-day-name">Lu</span>
            <span className="cal-day-name">Ma</span>
            <span className="cal-day-name">Mi</span>
            <span className="cal-day-name">Ju</span>
            <span className="cal-day-name">Vi</span>
            <span className="cal-day-name">Sa</span>
            <span className="cal-day-name">Do</span>
            
            {paddingDays.map((_, i) => (
              <span key={`padding-${i}`} className="cal-day empty"></span>
            ))}
            
            {calendarDays.map((day) => {
              const isActive = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              return (
                <span 
                  key={day.toISOString()} 
                  className={`cal-day ${isActive ? 'active' : ''} ${isToday ? 'today' : ''}`}
                  onClick={() => setSelectedDate(day)}
                >
                  {format(day, 'd')}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="sidebar-section promo-section">
        <div className="promo-box">
          <div className="promo-icon"><Link2 size={16} /></div>
          <h4>¡Comparte tu link y recibe citas!</h4>
          <p>sejuve.agendasejuve.app</p>
        </div>
      </div>

      <div className="sidebar-section filter-section">
        <div className="filter-group">
          <label>Sucursal</label>
          <select 
            className="filter-select-input" 
            value={branchId} 
            onChange={(e) => setBranchId(e.target.value)}
          >
            <option value="">Todas las sucursales</option>
            {locales.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>

        {user?.role !== 'RECURSOS' && (
          <div className="filter-group">
            <label>Ver agenda por</label>
            <select 
              className="filter-select-input" 
              value={viewMode} 
              onChange={(e) => setViewMode(e.target.value)}
            >
              <option value="professionals">Profesional</option>
              <option value="resources">Recurso</option>
            </select>
          </div>
        )}

        {viewMode === 'professionals' && user?.role !== 'RECURSOS' && (
          <div className="filter-group">
            <label>Profesional</label>
            <select 
              className="filter-select-input" 
              value={professionalId} 
              onChange={(e) => setProfessionalId(e.target.value)}
            >
              <option value="">Todos</option>
              {professionals.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="filter-group">
          <label>Estado de la reserva</label>
          <select 
            className="filter-select-input" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ACTIVAS">Reservas activas</option>
            <option value="TODAS">Todas las reservas</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="CONFIRMADA">Confirmadas</option>
            <option value="ASISTIDA">Asistidas</option>
            <option value="CANCELADA">Canceladas</option>
          </select>
        </div>
      </div>

      <style jsx>{`
        .sidebar {
          width: var(--sidebar-width);
          background-color: var(--bg-surface);
          border-right: 1px solid var(--border-color);
          height: calc(100vh - var(--header-height));
          position: fixed;
          left: 0;
          top: var(--header-height);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          z-index: 90;
        }

        .sidebar-section {
          padding: 20px;
          border-bottom: 1px solid var(--border-color);
        }

        .cal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-size: 14px;
          font-weight: 600;
        }

        .cal-header button {
          color: var(--text-secondary);
          padding: 4px 8px;
        }

        .cal-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          text-align: center;
          font-size: 12px;
        }

        .cal-day-name {
          color: var(--text-secondary);
          font-weight: 500;
          margin-bottom: 8px;
        }

        .cal-day {
          padding: 6px 0;
          border-radius: 50%;
          cursor: pointer;
          color: var(--text-main);
        }

        .cal-day:hover {
          background-color: #f0f2f5;
        }

        .cal-day.active {
          background-color: var(--brand-primary);
          color: white;
          font-weight: bold;
        }

        .promo-box {
          background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
          padding: 16px;
          border-radius: 12px;
          text-align: center;
          border: 1px solid #ddd6fe;
        }

        .promo-icon {
          display: inline-flex;
          background: white;
          padding: 8px;
          border-radius: 50%;
          color: var(--brand-secondary);
          margin-bottom: 8px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }

        .promo-box h4 {
          font-size: 13px;
          margin-bottom: 6px;
          color: var(--text-main);
        }

        .promo-box p {
          font-size: 11px;
          color: var(--text-secondary);
        }

        .filter-group {
          margin-bottom: 16px;
        }

        .filter-group:last-child {
          margin-bottom: 0;
        }

        .filter-group label {
          display: block;
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 6px;
          font-weight: 500;
        }

        .filter-select-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 13px;
          color: var(--text-main);
          background-color: white;
          outline: none;
          cursor: pointer;
        }

        .filter-select-input:focus {
          border-color: var(--brand-primary);
        }

        .filter-select {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 13px;
          color: var(--text-main);
          cursor: pointer;
          background-color: white;
        }

        .filter-select:hover {
          border-color: #b0b5ba;
        }
      `}</style>
    </aside>
  );
}
