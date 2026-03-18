"use client";

import { useState, useEffect } from 'react';
import { MapPin, Phone, MessageCircle, Clock, ChevronRight, ArrowLeft, Calendar as CalendarIcon, User, Mail } from 'lucide-react';
import Link from 'next/link';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';
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

  // Step 3 state
  const today = startOfToday();
  const [selectedDate, setSelectedDate] = useState(today);
  const availableDates = Array.from({ length: 14 }).map((_, i) => addDays(today, i));
  const availableTimes = ['09:00', '10:00', '11:00', '12:00', '16:00', '17:00', '18:00'];

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
              <div className="cover-image"></div>
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
              <div className="static-map">M A P A</div>
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
                        <span>{service.price === 0 ? 'Gratis' : `$${service.price}`}</span>
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
                  <CalendarIcon size={16} /> {format(selectedDate, 'MMMM yyyy', { locale: es }).toUpperCase()}
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
                  <strong>Costo:</strong> {selectedService?.price === 0 ? 'Gratis' : `$${selectedService?.price}`}
                </div>
              </div>

              <form className="user-form" onSubmit={(e) => {
                e.preventDefault();
                alert('¡Reservación creada con éxito! (Esta es una prueba, los datos no se guardaron)');
                setStep(1);
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
                <button type="submit" className="agendar-btn full-width">
                  Confirmar Reservación
                </button>
              </form>
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
          background-color: white;
          border-bottom: 1px solid #eaeaea;
          padding: 16px 0;
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
          max-width: 1200px;
          margin: 40px auto;
          padding: 0 24px;
        }

        .landing-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
          margin-bottom: 40px;
        }

        .info-area {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .cover-image {
          height: 300px;
          background: linear-gradient(135deg, #e0eafc, #cfdef3);
        }

        .brand-info {
          display: flex;
          padding: 24px;
          gap: 24px;
        }

        .brand-logo {
          font-size: 24px;
          line-height: 1.1;
        }

        .text-primary { color: #00bfff; }
        .text-purple-600 { color: #8a2be2; }
        .font-bold { font-weight: bold; }

        .brand-details h2 {
          font-size: 24px;
          color: #333;
          margin-bottom: 8px;
        }

        .brand-details p {
          color: #666;
          font-size: 14px;
        }

        .location-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .static-map {
          height: 150px;
          background-color: #e5e3df;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
          font-weight: bold;
          letter-spacing: 2px;
        }

        .location-details {
          padding: 20px;
          border-bottom: 1px solid #f0f0f0;
        }

        .location-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
          font-size: 13px;
          color: #555;
        }

        .location-item:last-child {
          margin-bottom: 0;
        }

        .success-text {
          color: #10b981;
          font-weight: 500;
        }

        .professionals-preview {
          padding: 20px;
        }

        .professionals-preview h3 {
          font-size: 14px;
          margin-bottom: 16px;
          color: #333;
        }

        .avatars {
          display: flex;
          gap: 16px;
        }

        .avatar {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .avatar span {
          width: 48px;
          height: 48px;
          background-color: #e0e0e0;
          color: #555;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 18px;
        }

        .avatar small {
          font-size: 12px;
          color: #666;
        }

        .wizard-container {
          background: white;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #666;
          font-size: 14px;
          margin-bottom: 24px;
          cursor: pointer;
        }

        .section-header {
          margin-bottom: 24px;
        }

        .section-header h3 {
          font-size: 20px;
          color: #333;
          margin-bottom: 4px;
        }

        .section-header p {
          color: #666;
          font-size: 14px;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 16px;
        }

        .service-card {
          background: white;
          border: 1px solid #eaeaea;
          border-radius: 8px;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .service-card:hover {
          border-color: #272c33;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .professionals-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .pro-select-card {
          display: flex;
          align-items: center;
          padding: 16px;
          border: 1px solid #eaeaea;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pro-select-card:hover {
          border-color: #272c33;
          background-color: #fcfcfc;
        }

        .pro-avatar {
          width: 48px;
          height: 48px;
          background-color: #f0f2f5;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-right: 16px;
          color: #272c33;
        }

        .pro-info {
          flex: 1;
        }

        .pro-info h4 {
          font-size: 16px;
          margin-bottom: 2px;
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
          min-width: 64px;
          height: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          background: white;
          border: 1px solid #eaeaea;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .day-card.selected {
          background-color: #272c33;
          color: white;
          border-color: #272c33;
        }

        .day-card:hover:not(.selected) {
          border-color: #ccc;
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
          border: 1px solid #eaeaea;
          border-radius: 8px;
          padding: 12px;
          font-size: 14px;
          font-weight: 500;
          color: #333;
          cursor: pointer;
          transition: all 0.2s;
        }

        .time-btn:hover {
          border-color: #272c33;
          background-color: #fcfcfc;
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
          padding: 8px 0;
          border-bottom: 1px dashed #e5e5e5;
          font-size: 14px;
          color: #444;
        }

        .summary-item:last-child {
          border-bottom: none;
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
          padding: 12px 12px 12px 40px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        .input-with-icon input:focus {
          border-color: #272c33;
        }

        .agendar-btn {
          background-color: #272c33;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .agendar-btn:hover {
          background-color: #1a1d22;
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
