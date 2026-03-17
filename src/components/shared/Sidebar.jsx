import Link from 'next/link';
import { Calendar, Users, Package, CreditCard, BarChart3, Settings, LayoutDashboard } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'Agenda', icon: Calendar, href: '/agenda' },
  { name: 'Pacientes', icon: Users, href: '/pacientes' },
  { name: 'Reportes', icon: BarChart3, href: '/reportes' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1 className="logo-text">SEJUVE<span> Citas</span></h1>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link key={item.name} href={item.href} className="nav-item">
            <item.icon size={20} />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <Link href="/settings" className="nav-item">
          <Settings size={20} />
          <span>Configuración</span>
        </Link>
      </div>

      <style jsx>{`
        .sidebar {
          width: var(--sidebar-width);
          background-color: var(--bg-dark);
          color: var(--text-light);
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          display: flex;
          flex-direction: column;
          z-index: 100;
        }

        .sidebar-logo {
          padding: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logo-text {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .logo-text span {
          color: var(--brand-primary);
        }

        .sidebar-nav {
          flex: 1;
          padding: 16px 0;
          display: flex;
          flex-direction: column;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 24px;
          color: rgba(255, 255, 255, 0.7);
          transition: all 0.2s;
          font-size: 14px;
          font-weight: 500;
          width: 100%;
        }

        .nav-item:hover {
          background-color: rgba(255, 255, 255, 0.05);
          color: var(--text-light);
        }

        .sidebar-footer {
          padding: 16px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </aside>
  );
}
