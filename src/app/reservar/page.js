'use client';

import { useState } from 'react';
import { MapPin, Phone, MessageCircle, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ReservarPage() {
  const [selectedService, setSelectedService] = useState(null);

  const services = [
    { id: 1, name: 'Terapia online', duration: '1 hr', price: 'Gratis', category: 'General' },
    { id: 2, name: 'Terapia presencial', duration: '1 hr', price: 'Gratis', category: 'General' },
    { id: 3, name: 'Valoración Inicial', duration: '1 hr', price: 'Gratis', category: 'General' },
  ];

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
        <div className="landing-grid">
          
          {/* Information Card (Left Side) */}
          <div className="info-area">
            <div className="cover-image"></div>
            <div className="brand-info">
              <div className="brand-logo">
                <img src="/logo-sejuve.png" alt="Ser Sejuve Logo" style={{ width: '120px', objectFit: 'contain', display: 'block' }} />
              </div>
              <div className="brand-details">
                <h2>Secretaría de la Juventud</h2>
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
                <p>Blvd. Bernardo Quintana Arrioja, Arboledas, Santiago de Querétaro, Qro., México</p>
              </div>
              <div className="location-item">
                <Phone size={16} />
                <p>524422242254 - 524423854866</p>
              </div>
              <div className="location-item success-text">
                <MessageCircle size={16} />
                <p>¡Contáctanos por Whatsapp!</p>
              </div>
              <div className="location-item">
                <Clock size={16} />
                <p>Ver horario</p>
              </div>
            </div>
            
            <div className="professionals-preview">
              <h3>Profesionales</h3>
              <div className="avatars">
                <div className="avatar"><span>J</span><small>Juan</small></div>
                <div className="avatar"><span>JL</span><small>Jose Luis</small></div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="services-section">
          <h3>General</h3>
          <div className="services-grid">
            {services.map(service => (
              <div key={service.id} className="service-card">
                <div className="service-info">
                  <h4>{service.name}</h4>
                  <p>{service.duration}</p>
                  <span>{service.price}</span>
                </div>
                <button 
                  className="agendar-btn"
                  onClick={() => setSelectedService(service)}
                >
                  Agendar servicio
                </button>
              </div>
            ))}
          </div>
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

        .services-section {
          background: #f7f9fc;
        }

        .services-section h3 {
          font-size: 16px;
          color: #333;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid #eaeaea;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .service-card {
          background: white;
          border: 1px solid #eaeaea;
          border-radius: 8px;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          transition: box-shadow 0.2s;
        }

        .service-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border-color: #d0d0d0;
        }

        .service-info h4 {
          font-size: 15px;
          color: #333;
          margin-bottom: 8px;
        }

        .service-info p {
          font-size: 13px;
          color: #666;
          margin-bottom: 8px;
        }

        .service-info span {
          font-size: 13px;
          font-weight: 600;
          color: #333;
        }

        .agendar-btn {
          background-color: #272c33;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .agendar-btn:hover {
          background-color: #1a1d22;
        }

        @media (max-width: 900px) {
          .landing-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
