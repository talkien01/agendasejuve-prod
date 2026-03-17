'use client';

import { Search, Bell, User } from 'lucide-react';

export default function Header() {
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
        <div className="user-profile">
          <div className="avatar">JL</div>
          <span className="user-name">Jose Luis</span>
        </div>
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
          gap: 10px;
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

        .user-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-main);
        }
      `}</style>
    </header>
  );
}
