'use client';

import { 
  Settings, 
  Globe, 
  Bell, 
  Lock, 
  Building2,
  Users,
  Box,
  ChevronRight,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SettingsLayout({ children }) {
  const pathname = usePathname();

  const categories = [
    { title: 'Ajustes de Sistema', items: [
      { id: 'settings', name: 'General', icon: Globe, path: '/settings' },
      { id: 'notifications', name: 'Log Notificaciones', icon: Bell, path: '/settings/notificaciones' },
      { id: 'security', name: 'Seguridad', icon: Lock, path: '/settings/seguridad' },
    ]},
    { title: 'Administración', items: [
      { id: 'templates', name: 'Plantillas Clínicas', icon: FileText, path: '/settings/templates' },
      { id: 'locales', name: 'Sucursales (Locales)', icon: Building2, path: '/settings/locales' },
      { id: 'profesionales', name: 'Profesionales', icon: Users, path: '/settings/profesionales' },
      { id: 'servicios', name: 'Servicios', icon: Box, path: '/settings/servicios' },
      { id: 'recursos', name: 'Recursos', icon: Box, path: '/settings/recursos' },
    ]}
  ];

  return (
    <div className="settings-page">
      <header className="page-header">
        <div className="header-title">
          <h1>Configuración y Administración</h1>
          <p>Gestiona la plataforma y el catálogo de SEJUVE Citas</p>
        </div>
      </header>

      <div className="settings-container">
        <aside className="settings-sidebar">
          {categories.map((group, idx) => (
            <div key={idx} className="sidebar-group">
              <h4 className="group-title">{group.title}</h4>
              <div className="group-items">
                {group.items.map((cat) => (
                  <Link
                    href={cat.path}
                    key={cat.id}
                    className={`category-item ${pathname === cat.path || pathname.startsWith(cat.path + '/') ? 'active' : ''}`}
                  >
                    <cat.icon size={18} />
                    <span>{cat.name}</span>
                    <ChevronRight size={16} className="arrow" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </aside>

        <main className="settings-content">
          {children}
        </main>
      </div>

      <style jsx global>{`
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
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .sidebar-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .group-title {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #9ca3af;
          padding: 0 12px;
          font-weight: 600;
        }

        .group-items {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .category-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          text-decoration: none;
          color: var(--text-secondary);
          transition: all 0.2s;
          font-size: 14px;
        }

        .category-item:hover {
          background: var(--bg-surface);
          color: var(--brand-primary);
        }

        .category-item.active {
          background: rgba(157, 0, 255, 0.1);
          color: var(--brand-primary);
          font-weight: 600;
        }

        .category-item .arrow {
          margin-left: auto;
          opacity: 0.3;
        }

        .settings-content {
          padding: 32px 32px 32px 0;
        }

        .settings-section h2 {
          font-size: 20px;
          margin-bottom: 24px;
          color: var(--text-main);
        }

        /* Generic forms for settings */
        .settings-content .form-group {
          margin-bottom: 20px;
          max-width: 500px;
        }

        .settings-content .form-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .settings-content .form-group input, 
        .settings-content .form-group select,
        .settings-content .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 14px;
          outline: none;
        }
        
        .settings-content .form-group input:focus,
        .settings-content .form-group select:focus {
          border-color: var(--brand-primary);
        }

        .btn-primary {
          background: var(--brand-primary);
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-primary:hover {
          background: var(--brand-secondary);
        }
          
        .btn-outline {
          background: none;
          border: 1px solid var(--border-color);
          padding: 6px 16px;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
        }

        /* Generic list view (CRUD tables) */
        .crud-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .crud-header h2 {
          margin-bottom: 0;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #eaeaea;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .data-table th, .data-table td {
          padding: 14px 16px;
          text-align: left;
          border-bottom: 1px solid #eaeaea;
        }

        .data-table th {
          background-color: #f9fafb;
          font-weight: 600;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .data-table td {
          font-size: 14px;
        }

        .data-table tbody tr:hover {
          background-color: #fcfcfc;
        }

        .action-btn {
          background: none;
          border: none;
          color: #9d00ff;
          cursor: pointer;
          font-weight: 500;
          padding: 4px 8px;
        }
        .action-btn.danger {
          color: #ef4444;
        }
      `}</style>
    </div>
  );
}
