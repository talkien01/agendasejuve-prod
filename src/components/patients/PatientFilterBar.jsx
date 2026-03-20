import { Search, Filter } from 'lucide-react';

export default function PatientFilterBar({ searchTerm, onSearchChange }) {
  return (
    <div className="filter-bar">
      <div className="search-box">
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          placeholder="Buscar por nombre, correo o identificación..." 
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <button className="btn-filter">
        <Filter size={18} />
        <span>Filtros Avanzados</span>
      </button>
    </div>
  );
}
