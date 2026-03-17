import "./globals.css";
import MainLayout from "@/components/layout/MainLayout";

export const metadata = {
  title: "SEJUVE Citas",
  description: "Sistema de gestión de citas y recursos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <MainLayout>
          {children}
        </MainLayout>
      </body>
    </html>
  );
}
