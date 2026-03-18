'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Globe, ChevronDown, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {}
    }
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {}
  };

  const navLinks = [
    { name: 'Agenda', href: '/agenda' },
    { name: 'Ventas', href: '/ventas' },
    { name: 'Pacientes', href: '/pacientes' },
    { name: 'Reportes', href: '/reportes' },
  ];

  return (
    <header className="top-header">
      <div className="header-left">
        <Link href="/" className="logo-area">
          <img src="/logo-sejuve.png" alt="SEJUVE Logo" className="header-logo" />
        </Link>
      </div>

      <nav className="header-center top-nav">
        {navLinks.map((link) => (
          <Link 
            key={link.name} 
            href={link.href} 
            className={`nav-link ${pathname.startsWith(link.href) ? 'active' : ''}`}
          >
            {link.name}
            {link.name === 'Ventas' || link.name === 'Pacientes' || link.name === 'Reportes' ? <ChevronDown size={14} className="ml-1" /> : null}
          </Link>
        ))}
        <Link 
          href="/settings" 
          className={`nav-link ${pathname.startsWith('/settings') ? 'active' : ''}`}
        >
          Administración <ChevronDown size={14} className="ml-1" />
        </Link>
      </nav>
      
      <div className="header-right">
        <button className="icon-btn search-btn">
          <Search size={18} />
        </button>
        <Link href="/reservar" target="_blank" className="website-btn">
          <Globe size={16} />
          <span>Sitio web</span>
        </Link>
        
        {user ? (
          <div className="user-menu" title="Cerrar sesión" onClick={handleLogout}>
            <div className="avatar">
              {user.name ? user.name.slice(0, 2).toUpperCase() : 'JL'}
            </div>
          </div>
        ) : (
          <div className="user-menu">
            <div className="avatar">
              <UserIcon size={16} />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .top-header {
          height: var(--header-height);
          background-color: #272c33;
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
        }

        .header-left {
          display: flex;
          align-items: center;
          flex: 1; /* Take up space to help centering */
        }

        .logo-area {
          text-decoration: none;
          color: white;
          display: flex;
          align-items: center;
        }

        .header-logo {
          height: 32px;
          object-fit: contain;
          background-color: white; /* Optional: if the logo needs a white background to contrast against the dark header */
          padding: 2px 8px;
          border-radius: 4px;
        }

        .header-center {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          flex: 2; /* Main focus area */
        }

        .top-nav {
          display: flex;
          align-items: center;
          height: 100%;
          gap: 12px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          height: 100%;
          padding: 0 20px;
          color: #a0aab5;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s;
          border-bottom: 3px solid transparent;
        }

        .nav-link:hover {
          color: white;
        }

        .nav-link.active {
          color: white;
          border-bottom-color: #00bfff;
        }

        .nav-link .ml-1 {
          margin-left: 4px;
        }

        .header-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 16px;
          flex: 1; /* Balance the left side */
        }

        .icon-btn {
          color: #a0aab5;
          transition: color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-btn:hover {
          color: white;
        }

        .website-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background-color: rgba(255, 255, 255, 0.1);
          color: white;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 13px;
          font-weight: 500;
          transition: background 0.2s;
        }

        .website-btn:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }

        .user-menu {
          cursor: pointer;
        }

        .avatar {
          width: 30px;
          height: 30px;
          background-color: #e0e0e0;
          color: #333;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          transition: transform 0.2s;
        }
        
        .user-menu:hover .avatar {
          transform: scale(1.05);
        }
      `}</style>
    </header>
  );
}
