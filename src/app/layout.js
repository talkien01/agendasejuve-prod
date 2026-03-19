import "./globals.css";
import MainLayout from "@/components/layout/MainLayout";
import { FilterProvider } from "@/context/FilterContext";

export const metadata = {
  title: "SEJUVE Citas",
  description: "Sistema de gestión de citas y recursos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <FilterProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </FilterProvider>
      </body>
    </html>
  );
}
