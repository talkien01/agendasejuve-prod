'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, LogOut, User as UserIcon } from 'lucide-react';

export default function Header() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="header">
      <div className="header-left">
        <h2 className="page-title">Bienvenido</h2>
      </div>
      
      <div className="header-right">
        <button className="icon-btn">
          <Search size={20} />
        </button>
        <button className="icon-btn">
          <Bell size={20} />
        </button>
        
        {user && (
          <div className="user-profile">
            <div className="avatar">{getInitials(user.name)}</div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .header {
          height: var(--header-height);
          background-color: var(--bg-surface);
          border-bottom: 1px solid var(--border-color);
          position: fixed;
          top: 0;
          left: var(--sidebar-width);
          right: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          z-index: 90;
        }

        .page-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-main);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .icon-btn {
          color: var(--text-secondary);
          transition: color 0.2s;
        }

        .icon-btn:hover {
          color: var(--text-main);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          border-left: 1px solid var(--border-color);
          padding-left: 16px;
          margin-left: 8px;
        }

        .avatar {
          width: 32px;
          height: 32px;
          background-color: var(--brand-primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-main);
        }

        .logout-btn {
          margin-left: 8px;
          color: var(--text-secondary);
          transition: color 0.2s;
          display: flex;
          align-items: center;
        }

        .logout-btn:hover {
          color: #d32f2f;
        }
      `}</style>
    </header>
  );
}
