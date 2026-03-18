import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Link2, ChevronDown } from 'lucide-react';

export default function Sidebar() {
  const [currentDate, setCurrentDate] = useState(new Date('2026-03-18T12:00:00Z'));
  
  useEffect(() => {
    // Ensure we start with the current date based on user's timezone when hydrated
    setCurrentDate(new Date());
  }, []);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    let day = new Date(year, month, 1).getDay();
    // Convert Sunday (0) to 6, Monday (1) to 0, etc to make Monday the first day
    return day === 0 ? 6 : day - 1;
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date().getDate();
  const isCurrentMonth = new Date().getMonth() === month && new Date().getFullYear() === year;

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  return (
    <aside className="sidebar">
      <div className="sidebar-section calendar-section">
        <div className="mini-calendar">
          <div className="cal-header">
            <button>&lt;</button>
            <span>{monthNames[month]} {year}</span>
            <button>&gt;</button>
          </div>
          <div className="cal-grid">
            <span className="cal-day-name">Lu</span><span className="cal-day-name">Ma</span><span className="cal-day-name">Mi</span><span className="cal-day-name">Ju</span><span className="cal-day-name">Vi</span><span className="cal-day-name">Sa</span><span className="cal-day-name">Do</span>
            {/* Empty slots for days before the 1st */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <span key={`empty-${i}`} className="cal-day empty"></span>
            ))}
            {/* Actual days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
               const isActive = isCurrentMonth && (i + 1) === today;
               return <span key={`day-${i}`} className={`cal-day ${isActive ? 'active' : ''}`}>{i + 1}</span>;
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
          <div className="filter-select">
            <span>Secretaría de la Juventud</span>
            <ChevronDown size={16} />
          </div>
        </div>

        <div className="filter-group">
          <label>Ver agenda por</label>
          <div className="filter-select">
            <span>Profesional</span>
            <ChevronDown size={16} />
          </div>
        </div>

        <div className="filter-group">
          <label>Profesional</label>
          <div className="filter-select">
            <span>Todos</span>
            <ChevronDown size={16} />
          </div>
        </div>

        <div className="filter-group">
          <label>Estado de la reserva</label>
          <div className="filter-select">
            <span>Reservas activas</span>
            <ChevronDown size={16} />
          </div>
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
          background: linear-gradient(to right bottom, #fff0f5, #e0ffff);
          padding: 16px;
          border-radius: 8px;
          text-align: center;
          border: 1px solid rgba(0,0,0,0.05);
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
