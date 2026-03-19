'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const FilterContext = createContext();

export function FilterProvider({ children }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [branchId, setBranchId] = useState('');
  const [viewMode, setViewMode] = useState('resources'); // professionals or resources
  const [professionalId, setProfessionalId] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVAS'); // ACTIVAS, TODAS, etc.

  // Helper to sync with AgendaPage needs if necessary
  const value = {
    selectedDate, setSelectedDate,
    branchId, setBranchId,
    viewMode, setViewMode,
    professionalId, setProfessionalId,
    statusFilter, setStatusFilter
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}
