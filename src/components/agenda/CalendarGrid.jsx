import { format } from 'date-fns';

export default function CalendarGrid({
  loading,
  columns,
  isToday,
  now,
  timeLineTop,
  hours,
  getAppointmentsForSlot,
  openNewAppointment,
  handleDeleteAppointment,
  view,
  STATUS_BG,
  STATUS_COLOR
}) {
  return (
    <div className="calendar-grid-wrapper card">
      {loading ? (
        <div className="loading-grid">Cargando agenda...</div>
      ) : columns.length === 0 ? (
        <div className="loading-grid">
          No hay {view === 'resources' ? 'recursos' : 'profesionales'} registrados.
        </div>
      ) : (
        <table className="calendar-table">
          <thead>
            <tr>
              <th className="time-col" />
              {columns.map(col => (
                <th key={col.key} className="column-header">
                  <div className="col-avatar">{col.name[0]}</div>
                  <span>{col.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Current Time Line */}
            {isToday && timeLineTop !== -1 && (
              <tr style={{ position: 'relative', height: 0 }}>
                <td colSpan={100} style={{ padding: 0, position: 'absolute', top: timeLineTop, left: 0, right: 0, zIndex: 100, pointerEvents: 'none' }}>
                  <div className="current-time-line">
                    <div className="time-indicator-bubble">
                      {format(now, 'HH:mm')}
                    </div>
                  </div>
                </td>
              </tr>
            )}
            {hours.map(hour => (
              <tr key={hour}>
                <td className="time-label">{hour}:00</td>
                {columns.map(col => {
                  const slotApps = getAppointmentsForSlot(col.id, hour);
                  return (
                    <td 
                      key={`${col.key}-${hour}`} 
                      className="calendar-slot"
                      onClick={() => openNewAppointment(col.id, hour)}
                    >
                      {slotApps.map(app => (
                        <div
                          key={app.id}
                          className="appointment-block"
                          onClick={(e) => e.stopPropagation()} 
                          style={{
                            background: STATUS_BG[app.status] || '#e3f2fd',
                            borderLeftColor: STATUS_COLOR[app.status] || '#1976d2',
                          }}
                          title={`${app.patient?.name} — ${app.type}`}
                        >
                          <span className="app-title">{app.patient?.name}</span>
                          <span className="app-meta">{app.type}</span>
                          <button
                            className="app-delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAppointment(app.id);
                            }}
                            title="Eliminar"
                          >×</button>
                        </div>
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
