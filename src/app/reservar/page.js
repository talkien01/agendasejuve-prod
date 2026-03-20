"use client";

import { useState, useEffect } from 'react';
import { MapPin, Phone, MessageCircle, Clock, ChevronRight, ArrowLeft, Calendar as CalendarIcon, User, Mail } from 'lucide-react';
import Link from 'next/link';
import { format, addDays, startOfToday, isSameDay, isWeekend } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ReservarPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ locales: [], services: [], professionals: [] });
  const [step, setStep] = useState(1); // 1: Select Service, 2: Select Professional, 3: Select Date/Time, 4: Confirm/UserData
  const [booking, setBooking] = useState({
    localId: null,
    serviceId: null,
    professionalId: null,
    date: null,
    time: null,
  });

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  // Step 3 state
  const [selectedDate, setSelectedDate] = useState(null);
  const [today, setToday] = useState(null);
  
  useEffect(() => {
    const now = startOfToday();
    setToday(now);
    setSelectedDate(now);
  }, []);
  
  // Generate next 14 absolute days, filter out weekends, and take the first 10 working days
  const availableDates = today ? Array.from({ length: 21 }) // Generate enough buffer
    .map((_, i) => addDays(today, i))
    .filter(date => !isWeekend(date))
    .slice(0, 14) : []; // Keep next 14 working days

  const availableTimes = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];


  // Step 4 state
  const [userData, setUserData] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/booking-data');
        if (res.ok) {
          const json = await res.json();
          setData(json);
          if (json.locales.length > 0) {
            setBooking(prev => ({ ...prev, localId: json.locales[0].id }));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const selectedLocal = data.locales.find(l => l.id === booking.localId) || data.locales[0];
  const selectedService = data.services.find(s => s.id === booking.serviceId);

  const handleServiceSelect = (serviceId) => {
    setBooking(prev => ({ ...prev, serviceId }));
    setStep(2);
  };

  return (
    <div className="landing-container">
      {/* Header */}
      <header className="landing-header">
        <div className="header-content">
          <img src="/logo-sejuve.png" alt="SEJUVE Logo" style={{ height: '32px', objectFit: 'contain' }} />
          <Link href="/login" className="login-link">Iniciar sesión</Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="landing-main">
        {step === 1 && (
          <div className="landing-grid">
            {/* Information Card (Left Side) */}
            <div className="info-area">
              <div className="cover-image" style={{ backgroundImage: 'url("/hero-reservar.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
              <div className="brand-info">
                <div className="brand-logo">
                  <img src="/logo-sejuve.png" alt="Ser Sejuve Logo" style={{ width: '120px', objectFit: 'contain', display: 'block' }} />
                </div>
                <div className="brand-details">
                  <h2>{selectedLocal?.name || 'Secretaría de la Juventud'}</h2>
                  <p>Atención psicológica gratuita a jóvenes entre 12 y 29 años de edad.</p>
                </div>
              </div>
            </div>

            {/* Location Card (Right Side) */}
            <div className="location-card">
              <div className="static-map" style={{ backgroundImage: 'url("/map-placeholder.png")', backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent' }}>M A P A</div>
              <div className="location-details">
                <div className="location-item">
                  <MapPin size={16} />
                  <p>{selectedLocal?.address || 'Blvd. Bernardo Quintana Arrioja, Arboledas'}</p>
                </div>
                <div className="location-item">
                  <Phone size={16} />
                  <p>{selectedLocal?.phone || '524422242254'}</p>
                </div>
                <div className="location-item success-text">
                  <MessageCircle size={16} />
                  <p>¡Contáctanos por Whatsapp!</p>
                </div>
              </div>
              
              <div className="professionals-preview">
                <h3>Profesionales</h3>
                <div className="avatars">
                  {data.professionals.slice(0, 3).map(p => (
                    <div key={p.id} className="avatar">
                      <span>{p.name[0]}</span>
                      <small>{p.name.split(' ')[1] || p.name}</small>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Step Content */}
        <div className="wizard-container">
          {step > 1 && (
            <button className="back-btn" onClick={() => setStep(step - 1)}>
              <ArrowLeft size={16} /> Volver
            </button>
          )}

          {step === 1 && (
            <div className="services-section">
              <div className="section-header">
                <h3>Servicios disponibles</h3>
              </div>
              {loading ? (
                <div className="loading-state">Cargando servicios...</div>
              ) : (
                <div className="services-grid">
                  {data.services.map(service => (
                    <div key={service.id} className="service-card" onClick={() => handleServiceSelect(service.id)}>
                      <div className="service-info">
                        <h4>{service.name}</h4>
                        <p>{service.duration} min</p>
                        <span>{service.price === 0 ? 'SIN COSTO' : `$${service.price}`}</span>
                      </div>
                      <ChevronRight size={20} className="text-gray-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="professionals-section">
              <div className="section-header">
                <h3>Selecciona un profesional</h3>
                <p>Para: <strong>{selectedService?.name}</strong></p>
              </div>
              <div className="professionals-list">
                <div 
                  className="pro-select-card" 
                  onClick={() => {
                    setBooking(prev => ({ ...prev, professionalId: null }));
                    setStep(3);
                  }}
                >
                  <div className="pro-avatar">?</div>
                  <div className="pro-info">
                    <h4>Cualquier profesional</h4>
                    <p>Asignación automática según disponibilidad</p>
                  </div>
                  <ChevronRight size={20} />
                </div>

                {data.professionals.map(pro => (
                  <div 
                    key={pro.id} 
                    className="pro-select-card"
                    onClick={() => {
                      setBooking(prev => ({ ...prev, professionalId: pro.id }));
                      setStep(3);
                    }}
                  >
                    <div className="pro-avatar">{pro.name[0]}</div>
                    <div className="pro-info">
                      <h4>{pro.name}</h4>
                      <p>{pro.specialty}</p>
                    </div>
                    <ChevronRight size={20} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="datetime-section">
              <div className="section-header">
                <h3>Selecciona fecha y hora</h3>
                <p>Servicio: {selectedService?.name}</p>
              </div>
              
              <div className="date-picker-container">
                <div className="month-label">
                  <CalendarIcon size={16} /> {selectedDate ? format(selectedDate, 'MMMM yyyy', { locale: es }).toUpperCase() : ''}
                </div>
                <div className="days-scroll">
                  {availableDates.map(date => {
                    const isSelected = isSameDay(date, selectedDate);
                    return (
                      <div 
                        key={date.toString()} 
                        className={`day-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedDate(date)}
                      >
                        <span className="day-name">{format(date, 'eee', { locale: es }).substring(0, 3)}</span>
                        <span className="day-number">{format(date, 'd')}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="times-container">
                <h4>Horarios disponibles</h4>
                <div className="times-grid">
                  {availableTimes.map(time => (
                    <button 
                      key={time} 
                      className="time-btn"
                      onClick={() => {
                        setBooking(prev => ({ ...prev, date: selectedDate, time }));
                        setStep(4);
                      }}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="confirmation-section">
              <div className="section-header">
                <h3>Confirma tu reservación</h3>
                <p>Ingresa tus datos para finalizar</p>
              </div>
              
              <div className="booking-summary">
                <div className="summary-item">
                  <strong>Servicio:</strong> {selectedService?.name}
                </div>
                <div className="summary-item">
                  <strong>Fecha:</strong> {format(booking.date, "EEEE d 'de' MMMM, yyyy", { locale: es })}
                </div>
                <div className="summary-item">
                  <strong>Hora:</strong> {booking.time}
                </div>
                <div className="summary-item">
                  <strong>Costo:</strong> {selectedService?.price === 0 ? 'SIN COSTO' : `$${selectedService?.price}`}
                </div>
              </div>

              <form className="user-form" onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);
                try {
                  const res = await fetch('/api/reservar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      ...booking,
                      userData
                    })
                  });
                  
                  if (res.ok) {
                    const result = await res.json();
                    setBookingResult(result.appointment);
                    setStep(5);
                  } else {
                    const err = await res.json();
                    alert(err.error || 'Error al crear la reserva');
                  }
                } catch (err) {
                  console.error(err);
                  alert('Error de conexión. Intente más tarde.');
                } finally {
                  setIsSubmitting(false);
                }
              }}>
                <div className="form-group">
                  <label>Nombre completo</label>
                  <div className="input-with-icon">
                    <User size={18} className="input-icon" />
                    <input type="text" placeholder="Ej. Juan Pérez" required value={userData.name} onChange={e => setUserData({...userData, name: e.target.value})} />
                  </div>
                </div>
                <div className="form-group flex-row">
                  <div className="flex-1">
                    <label>Correo electrónico</label>
                    <div className="input-with-icon">
                      <Mail size={18} className="input-icon" />
                      <input type="email" placeholder="tucorreo@ejemplo.com" required value={userData.email} onChange={e => setUserData({...userData, email: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label>Teléfono (WhatsApp)</label>
                    <div className="input-with-icon">
                      <Phone size={18} className="input-icon" />
                      <input type="tel" placeholder="10 dígitos" required value={userData.phone} onChange={e => setUserData({...userData, phone: e.target.value})} />
                    </div>
                  </div>
                </div>
                <button type="submit" className="agendar-btn full-width" disabled={isSubmitting}>
                  {isSubmitting ? 'Procesando...' : 'Confirmar Reservación'}
                </button>
              </form>
            </div>
          )}

          {step === 5 && bookingResult && (
            <div className="success-section text-center">
              <div className="success-icon">✓</div>
              <h3>¡Reservación Confirmada!</h3>
              <p>Tu cita ha sido agendada exitosamente.</p>
              
              <div className="booking-details-card">
                <div className="detail-row">
                  <span>Folio:</span> <strong>#{bookingResult.id.substring(0, 8).toUpperCase()}</strong>
                </div>
                <div className="detail-row">
                  <span>Servicio:</span> <strong>{selectedService?.name}</strong>
                </div>
                <div className="detail-row">
                  <span>Profesional:</span> <strong>{bookingResult.professional?.name || 'Asignación automática'}</strong>
                </div>
                <div className="detail-row">
                  <span>Fecha:</span> <strong>{format(new Date(bookingResult.date), "EEEE d 'de' MMMM", { locale: es })}</strong>
                </div>
                <div className="detail-row">
                  <span>Hora:</span> <strong>{bookingResult.startTime}</strong>
                </div>
              </div>

              <div className="success-actions">
                <Link href="/" className="btn-primary">Volver al inicio</Link>
                <button className="btn-outline" onClick={() => {
                  setStep(1);
                  setBookingResult(null);
                  setBooking({ 
                    localId: data.locales[0]?.id || null, 
                    serviceId: null, 
                    professionalId: null, 
                    date: null, 
                    time: null 
                  });
                }}>Hacer otra reserva</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Shared Styles */}
      <style jsx>{`
        .landing-container {
          min-height: 100vh;
          background-color: #f7f9fc;
          font-family: var(--font-family);
        }

        .landing-header {
          background-color: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          padding: 16px 0;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }

        .login-link {
          font-size: 14px;
          color: #666;
          text-decoration: none;
        }

        .landing-main {
          max-width: 1100px;
          margin: 60px auto;
          padding: 0 24px;
        }

        .landing-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 32px;
          margin-bottom: 60px;
        }

        .info-area {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,0.04);
          border: 1px solid #f0f0f0;
        }

        .cover-image {
          height: 380px;
          background-color: #f1f3f5;
        }

        .brand-info {
          display: flex;
          padding: 32px;
          gap: 32px;
          align-items: center;
        }

        .brand-logo {
          font-size: 24px;
          line-height: 1.1;
        }
        
        .brand-logo img {
          border-radius: 12px;
          padding: 8px;
          background: #fcfcfc;
          border: 1px solid #eee;
        }

        .text-primary { color: #00bfff; }
        .text-purple-600 { color: #8a2be2; }
        .font-bold { font-weight: bold; }

        .brand-details h2 {
          font-size: 28px;
          font-weight: 800;
          color: #1a1a1a;
          margin-bottom: 12px;
          letter-spacing: -0.5px;
        }

        .brand-details p {
          color: #666;
          font-size: 16px;
          line-height: 1.6;
          max-width: 500px;
        }

        .location-card {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,0.04);
          border: 1px solid #f0f0f0;
          display: flex;
          flex-direction: column;
        }

        .static-map {
          height: 200px;
          background-color: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          letter-spacing: 2px;
          position: relative;
        }

        .static-map::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 40px;
          background: linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0));
        }

        .location-details {
          padding: 28px;
          border-bottom: 1px solid #f5f5f5;
        }

        .location-item {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
          font-size: 14px;
          color: #444;
          font-weight: 500;
        }

        .location-item:last-child {
          margin-bottom: 0;
        }

        .location-item :global(svg) {
          color: #00BFFF;
        }

        .success-text {
          color: #10b981;
          font-weight: 700;
        }

        .professionals-preview {
          padding: 28px;
          background: #fafafa;
        }

        .professionals-preview h3 {
          font-size: 15px;
          font-weight: 700;
          margin-bottom: 20px;
          color: #1a1a1a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .avatars {
          display: flex;
          gap: 20px;
        }

        .avatar {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .avatar span {
          width: 56px;
          height: 56px;
          background: white;
          color: #1a1a1a;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border: 1px solid #eee;
        }

        .avatar small {
          font-size: 13px;
          font-weight: 600;
          color: #666;
        }

        .wizard-container {
          background: white;
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.05);
          border: 1px solid #f0f0f0;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #888;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 32px;
          cursor: pointer;
          transition: color 0.2s;
        }

        .back-btn:hover {
          color: #1a1a1a;
        }

        .section-header h3 {
          font-size: 24px;
          font-weight: 800;
          color: #1a1a1a;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .section-header p {
          color: #666;
          font-size: 15px;
          font-weight: 500;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .service-card {
          background: white;
          border: 1px solid #f0f0f0;
          border-radius: 16px;
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }

        .service-card:hover {
          border-color: #00BFFF;
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,191,255,0.08);
        }

        .service-info h4 {
          font-size: 18px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 4px;
        }

        .service-info p {
          font-size: 14px;
          color: #777;
          font-weight: 500;
        }

        .service-info span {
          display: block;
          margin-top: 12px;
          font-weight: 800;
          color: #00BFFF;
          font-size: 16px;
        }

        .professionals-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .pro-select-card {
          display: flex;
          align-items: center;
          padding: 20px;
          border: 1px solid #f0f0f0;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: #fcfcfc;
        }

        .pro-select-card:hover {
          border-color: #00BFFF;
          background-color: white;
          transform: translateX(8px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.04);
        }

        .pro-avatar {
          width: 56px;
          height: 56px;
          background-color: white;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          margin-right: 20px;
          color: #1a1a1a;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border: 1px solid #eee;
          font-size: 20px;
        }

        .pro-info h4 {
          font-size: 17px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .pro-info p {
          font-size: 13px;
          color: #666;
        }

        .date-picker-container {
          margin-bottom: 32px;
        }

        .month-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #333;
          margin-bottom: 16px;
        }

        .days-scroll {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 8px;
          scrollbar-width: thin;
        }

        .days-scroll::-webkit-scrollbar {
          height: 6px;
        }

        .days-scroll::-webkit-scrollbar-thumb {
          background-color: #ddd;
          border-radius: 4px;
        }

        .day-card {
          min-width: 72px;
          height: 90px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: white;
          border: 1px solid #f0f0f0;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }

        .day-card.selected {
          background-color: #00BFFF;
          color: white;
          border-color: #00BFFF;
          box-shadow: 0 8px 20px rgba(0,191,255,0.3);
          transform: scale(1.05);
        }

        .day-card:hover:not(.selected) {
          border-color: #00BFFF;
          background-color: rgba(0,191,255,0.02);
        }

        .day-name {
          font-size: 12px;
          text-transform: capitalize;
          color: inherit;
          opacity: 0.8;
        }

        .day-number {
          font-size: 20px;
          font-weight: bold;
          color: inherit;
        }

        .times-container h4 {
          font-size: 16px;
          margin-bottom: 16px;
          color: #333;
        }

        .times-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 12px;
        }

        .time-btn {
          background: white;
          border: 1px solid #f0f0f0;
          border-radius: 12px;
          padding: 14px;
          font-size: 15px;
          font-weight: 700;
          color: #444;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 6px rgba(0,0,0,0.02);
        }

        .time-btn:hover {
          border-color: #00BFFF;
          color: #00BFFF;
          background-color: rgba(0,191,255,0.02);
          transform: translateY(-2px);
        }

        .confirmation-section {
          max-width: 500px;
        }

        .booking-summary {
          background-color: #f9fafb;
          border: 1px solid #eaeaea;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #eee;
          font-size: 15px;
        }

        .summary-item strong {
          color: #666;
          font-weight: 600;
        }

        .summary-item:last-child {
          border-bottom: none;
        }

        /* Success Step Styles */
        .text-center { text-align: center; }
        .success-icon {
          width: 80px;
          height: 80px;
          background: #10b981;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          margin: 0 auto 24px;
          box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
        }

        .success-section h3 { font-size: 28px; margin-bottom: 8px; color: #1a1a1a; }
        .success-section p { color: #666; margin-bottom: 32px; font-size: 16px; }

        .booking-details-card {
          background: #f8fafc;
          border-radius: 20px;
          padding: 24px;
          max-width: 400px;
          margin: 0 auto 32px;
          border: 1px solid #edf2f7;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px dashed #e2e8f0;
        }

        .detail-row:last-child { border-bottom: none; }
        .detail-row span { color: #718096; font-size: 14px; }
        .detail-row strong { color: #2d3748; font-size: 15px; }

        .success-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 300px;
          margin: 0 auto;
        }

        .btn-primary {
          background: #00BFFF;
          color: white;
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          text-decoration: none;
        }

        .agendar-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group.flex-row {
          display: flex;
          gap: 16px;
        }

        .flex-1 {
          flex: 1;
        }

        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #555;
          margin-bottom: 6px;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          color: #9ca3af;
        }

        .input-with-icon input {
          width: 100%;
          padding: 14px 14px 14px 48px;
          border: 1px solid #e0e0e0;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 500;
          outline: none;
          transition: all 0.2s;
          background: #f9fafb;
        }

        .input-with-icon input:focus {
          border-color: #00BFFF;
          background: white;
          box-shadow: 0 0 0 4px rgba(0,191,255,0.1);
        }

        .agendar-btn {
          background: #00BFFF;
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 24px rgba(0,191,255,0.2);
        }

        .agendar-btn:hover {
          background: #00a0d9;
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(0,191,255,0.3);
        }

        .full-width {
          width: 100%;
          margin-top: 16px;
        }

        @media (max-width: 900px) {
          .landing-grid {
            grid-template-columns: 1fr;
          }
          .services-grid {
            grid-template-columns: 1fr;
          }
          .form-group.flex-row {
            flex-direction: column;
            gap: 0;
          }
        }
      `}</style>
    </div>
  );
}
