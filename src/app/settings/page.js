'use client';

import { useState } from 'react';
import { 
  Settings, 
  Globe, 
  Bell, 
  Lock, 
  Smartphone,
  CreditCard,
  Link as LinkIcon,
  ChevronRight
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const categories = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'notifications', name: 'Notificaciones', icon: Bell },
    { id: 'security', name: 'Seguridad', icon: Lock },
    { id: 'integrations', name: 'Integraciones', icon: LinkIcon },
  ];

  return (
    <div className="settings-page">
      <header className="page-header">
        <div className="header-title">
          <h1>Configuración del Sistema</h1>
          <p>Gestiona las preferencias y personalización de SEJUVE Citas</p>
        </div>
      </header>

      <div className="settings-container">
        <aside className="settings-sidebar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`category-item ${activeTab === cat.id ? 'active' : ''}`}
              onClick={() => setActiveTab(cat.id)}
            >
              <cat.icon size={18} />
              <span>{cat.name}</span>
              <ChevronRight size={16} className="arrow" />
            </button>
          ))}
        </aside>

        <main className="settings-content">
          {activeTab === 'general' && (
            <div className="settings-section">
              <h2>Ajustes Generales</h2>
              <div className="form-group">
                <label>Nombre de la Aplicación</label>
                <input type="text" defaultValue="SEJUVE Citas" />
              </div>
              <div className="form-group">
                <label>Idioma del Sistema</label>
                <select>
                  <option>Español (México)</option>
                  <option>English</option>
                </select>
              </div>
              <div className="form-group">
                <label>Zona Horaria</label>
                <select>
                  <option>(GMT-06:00) Ciudad de México</option>
                </select>
              </div>
              <button className="btn-primary">Guardar Cambios</button>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="settings-section">
              <h2>Integraciones Disponibles</h2>
              <div className="integration-grid">
                <div className="integration-card">
                  <div className="integration-info">
                    <Smartphone size={32} color="#25D366" />
                    <div>
                      <h3>WhatsApp Business</h3>
                      <p>Envío de recordatorios automáticos</p>
                    </div>
                  </div>
                  <button className="btn-outline">Configurar</button>
                </div>
                <div className="integration-card">
                  <div className="integration-info">
                    <Globe size={32} color="#4285F4" />
                    <div>
                      <h3>Google Calendar</h3>
                      <p>Sincronización bidireccional de citas</p>
                    </div>
                  </div>
                  <button className="btn-outline">Conectar</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Seguridad de la Cuenta</h2>
              <div className="security-form-container">
                <form className="password-form" onSubmit={async (e) => {
                  e.preventDefault();
                  const currentPassword = e.target.currentPassword.value;
                  const newPassword = e.target.newPassword.value;
                  const confirmPassword = e.target.confirmPassword.value;

                  if (newPassword !== confirmPassword) {
                    alert('Las contraseñas nuevas no coinciden');
                    return;
                  }

                  try {
                    const res = await fetch('/api/user/change-password', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ currentPassword, newPassword }),
                    });
                    const data = await res.json();
                    if (res.ok) {
                      alert('Contraseña actualizada correctamente');
                      e.target.reset();
                    } else {
                      alert(data.error || 'Error al actualizar contraseña');
                    }
                  } catch (err) {
                    alert('Error de conexión');
                  }
                }}>
                  <div className="form-group">
                    <label>Contraseña Actual</label>
                    <input type="password" name="currentPassword" required />
                  </div>
                  <div className="form-group">
                    <label>Nueva Contraseña</label>
                    <input type="password" name="newPassword" required />
                  </div>
                  <div className="form-group">
                    <label>Confirmar Nueva Contraseña</label>
                    <input type="password" name="confirmPassword" required />
                  </div>
                  <button type="submit" className="btn-primary">Actualizar Contraseña</button>
                </form>
              </div>
            </div>
          )}

          {activeTab !== 'general' && activeTab !== 'integrations' && activeTab !== 'security' && (
            <div className="empty-state">
              <Settings size={48} />
              <p>Módulo de {activeTab} en desarrollo</p>
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        .settings-page {
          padding: 24px;
        }

        .page-header {
          margin-bottom: 32px;
        }

        .header-title h1 {
          font-size: 24px;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .header-title p {
          color: var(--text-secondary);
          font-size: 14px;
        }

        .settings-container {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 32px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
          min-height: 600px;
        }

        .settings-sidebar {
          border-right: 1px solid var(--border-color);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .category-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          width: 100%;
        }

        .category-item:hover {
          background: var(--bg-secondary);
          color: var(--primary-color);
        }

        .category-item.active {
          background: rgba(0, 191, 255, 0.1);
          color: var(--primary-color);
          font-weight: 600;
        }

        .category-item .arrow {
          margin-left: auto;
          opacity: 0.5;
        }

        .settings-content {
          padding: 32px;
        }

        .settings-section h2 {
          font-size: 20px;
          margin-bottom: 24px;
          color: var(--text-primary);
        }

        .form-group {
          margin-bottom: 20px;
          max-width: 400px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .form-group input, .form-group select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 14px;
        }

        .btn-primary {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 12px;
        }

        .integration-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .integration-card {
          padding: 20px;
          border: 1px solid var(--border-color);
          border-radius: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .integration-info {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .integration-info h3 {
          font-size: 16px;
          margin-bottom: 2px;
        }

        .integration-info p {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .btn-outline {
          background: none;
          border: 1px solid var(--border-color);
          padding: 6px 16px;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          color: var(--text-secondary);
          gap: 16px;
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
}
