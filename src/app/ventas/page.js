'use client';

import { useState } from 'react';
import { 
  CreditCard, 
  Package, 
  Search, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreHorizontal
} from 'lucide-react';

const salesItems = [
  { id: 1, type: 'Facturado', client: 'Juan Pérez', item: 'Terapia Física', amount: '$450.00', date: '12:30 PM', status: 'Pagado' },
  { id: 2, type: 'Abono', client: 'María García', item: 'Plan 10 Sesiones', amount: '$1,200.00', date: '01:00 PM', status: 'Pagado' },
  { id: 3, type: 'Interna', client: 'Dr. Jose Luis', item: 'Insumos Médicos', amount: '-$150.00', date: '02:15 PM', status: 'Egreso' },
];

const inventory = [
  { id: 1, name: 'Aceite de Masaje Relajante', category: 'Masoterapia', brand: 'Nature', stock: 12, price: '$220.00' },
  { id: 2, name: 'Vendaje Elástico 5cm', category: 'Insumos', brand: 'MediWrap', stock: 45, price: '$45.00' },
  { id: 3, name: 'Crema Hidratante Facial', category: 'Estética', brand: 'GlowUp', stock: 8, price: '$380.00' },
];

export default function SalesPage() {
  const [activeTab, setActiveTab] = useState('caja');

  return (
    <div className="sales-container">
      <div className="page-header">
        <div className="header-info">
          <h1>Ventas y Productos</h1>
          <p>Gestiona el flujo de caja diario y el inventario de productos</p>
        </div>
        <div className="tab-switcher">
          <button 
            className={`tab-btn ${activeTab === 'caja' ? 'active' : ''}`}
            onClick={() => setActiveTab('caja')}
          >
            <CreditCard size={18} />
            <span>Caja Diaria</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'productos' ? 'active' : ''}`}
            onClick={() => setActiveTab('productos')}
          >
            <Package size={18} />
            <span>Inventario</span>
          </button>
        </div>
      </div>

      <div className="stats-strip">
        <div className="mini-stat">
          <span className="label">Ingresos del día</span>
          <div className="value-group">
            <span className="value">$5,820.00</span>
            <span className="change positive"><ArrowUpRight size={14} /> +12%</span>
          </div>
        </div>
        <div className="mini-stat">
          <span className="label">Egresos</span>
          <div className="value-group">
            <span className="value">$450.00</span>
          </div>
        </div>
        <div className="mini-stat">
          <span className="label">Saldo Neto</span>
          <div className="value-group">
            <span className="value standout">$5,370.00</span>
          </div>
        </div>
      </div>

      {activeTab === 'caja' ? (
        <div className="card table-container">
          <div className="card-header-actions">
            <h3>Flujo de Caja</h3>
            <div className="actions">
              <button className="btn-outline-small">Exportar</button>
              <button className="btn-primary-small">Nuevo Ingreso/Egreso</button>
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Operación</th>
                <th>Monto</th>
                <th>Hora</th>
                <th>Estado</th>
                <th className="actions-col"></th>
              </tr>
            </thead>
            <tbody>
              {salesItems.map(item => (
                <tr key={item.id}>
                  <td><span className={`type-pill ${item.type.toLowerCase()}`}>{item.type}</span></td>
                  <td>
                    <div className="op-info">
                      <span className="op-client">{item.client}</span>
                      <span className="op-item">{item.item}</span>
                    </div>
                  </td>
                  <td className={`amount-cell ${item.amount.startsWith('-') ? 'negative' : 'positive'}`}>
                    {item.amount}
                  </td>
                  <td>{item.date}</td>
                  <td><span className="status-dot-text"><span className="dot active"></span>{item.status}</span></td>
                  <td><button className="icon-btn-gray"><MoreHorizontal size={18} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card inventory-container">
          <div className="inventory-header">
            <div className="search-box-small">
              <Search size={16} />
              <input type="text" placeholder="Buscar productos..." />
            </div>
            <button className="btn-primary-small">Agregar Producto</button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Marca</th>
                <th>Stock</th>
                <th>Precio</th>
                <th className="actions-col"></th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(prod => (
                <tr key={prod.id}>
                  <td className="prod-name-cell">{prod.name}</td>
                  <td>{prod.category}</td>
                  <td>{prod.brand}</td>
                  <td>
                    <span className={`stock-level ${prod.stock < 10 ? 'low' : ''}`}>
                      {prod.stock} unidades
                    </span>
                  </td>
                  <td className="price-cell">{prod.price}</td>
                  <td><button className="icon-btn-gray"><MoreHorizontal size={18} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .sales-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-info h1 {
          font-size: 24px;
          margin-bottom: 4px;
        }

        .header-info p {
          color: var(--text-secondary);
          font-size: 14px;
        }

        .tab-switcher {
          background: #e9ecef;
          padding: 4px;
          border-radius: 10px;
          display: flex;
          gap: 4px;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .tab-btn.active {
          background: white;
          color: var(--brand-primary);
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .stats-strip {
          display: flex;
          gap: 24px;
        }

        .mini-stat {
          flex: 1;
          background: white;
          padding: 16px 20px;
          border-radius: 12px;
          box-shadow: var(--shadow-sm);
        }

        .mini-stat .label {
          font-size: 12px;
          color: var(--text-secondary);
          text-transform: uppercase;
          font-weight: 700;
          display: block;
          margin-bottom: 8px;
        }

        .mini-stat .value-group {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
        }

        .mini-stat .value {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-main);
        }

        .mini-stat .standout {
          color: var(--brand-primary);
        }

        .mini-stat .change {
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .mini-stat .change.positive { color: #4CAF50; }

        .card-header-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid var(--border-color);
        }

        .actions {
          display: flex;
          gap: 12px;
        }

        .inventory-header {
          display: flex;
          justify-content: space-between;
          padding: 20px;
          border-bottom: 1px solid var(--border-color);
        }

        .search-box-small {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 12px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          width: 280px;
        }

        .search-box-small input {
          border: none;
          outline: none;
          font-size: 14px;
          width: 100%;
        }

        .btn-outline-small {
          padding: 6px 14px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
        }

        .btn-primary-small {
          background: var(--brand-primary);
          color: white;
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          text-align: left;
          padding: 16px 20px;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-secondary);
          background: #f8f9fa;
        }

        .data-table td {
          padding: 16px 20px;
          font-size: 14px;
          border-bottom: 1px solid #f1f3f4;
        }

        .type-pill {
          font-size: 10px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .type-pill.facturado { background: #e3f2fd; color: #1976d2; }
        .type-pill.abono { background: #e8f5e9; color: #2e7d32; }
        .type-pill.interna { background: #feebe2; color: #e91e63; }

        .op-info { display: flex; flex-direction: column; }
        .op-client { font-weight: 600; color: var(--text-main); }
        .op-item { font-size: 12px; color: var(--text-secondary); }

        .amount-cell { font-weight: 700; font-family: monospace; }
        .amount-cell.positive { color: #2e7d32; }
        .amount-cell.negative { color: #c62828; }

        .status-dot-text { display: flex; align-items: center; gap: 8px; font-size: 13px; }
        .dot { width: 8px; height: 8px; border-radius: 50%; }
        .dot.active { background: #4CAF50; }

        .prod-name-cell { font-weight: 600; }
        .stock-level.low { color: #f44336; font-weight: 700; }
        .price-cell { font-family: monospace; font-weight: 700; }

        .icon-btn-gray { color: var(--text-secondary); border-radius: 4px; padding: 4px; }
      `}</style>
    </div>
  );
}
