'use client';

import { usePathname } from "next/navigation";
import Sidebar from "@/components/shared/Sidebar";
import Header from "@/components/shared/Header";

export default function MainLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <main>{children}</main>;
  }

  return (
    <div className="app-container">
      <Header />
      <Sidebar />
      <main className="main-content">
        {children}
      </main>

      <style jsx global>{`
        .main-content {
          margin-left: var(--sidebar-width);
          margin-top: var(--header-height);
          padding: 24px;
          min-height: calc(100vh - var(--header-height));
          width: calc(100% - var(--sidebar-width));
        }
      `}</style>
    </div>
  );
}
