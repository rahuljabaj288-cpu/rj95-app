/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, Plus, X } from 'lucide-react';
import { Language } from '../types';
import {
  DepartmentItem,
  getManagedDepartments,
  saveManagedDepartments,
  getDepartmentIcon
} from '../utils/departmentDb';

interface DepartmentDropdownProps {
  value: string;
  onChange: (value: string) => void;
  lang: Language;
}

export { getDepartmentIcon };

export default function DepartmentDropdown({
  value,
  onChange,
  lang
}: DepartmentDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [managedDepts, setManagedDepts] = useState<DepartmentItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load departments from local storage database on mount/open
  useEffect(() => {
    if (isOpen || managedDepts.length === 0) {
      const list = getManagedDepartments();
      setManagedDepts(list);
    }
  }, [isOpen]);

  // Sync click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Only show departments that are NOT deleted and NOT hidden
  const visibleDepartments = managedDepts.filter(d => !d.isDeleted && !d.isHidden);

  // Search filter
  const filtered = visibleDepartments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (name: string) => {
    onChange(name);
    setSearch('');
    setIsOpen(false);
  };

  // Create custom department inline
  const handleCreateCustom = () => {
    const trimmed = search.trim();
    if (!trimmed) return;

    // Check if it already exists in the FULL database (even if deleted or hidden, we can restore or make active)
    const lowerName = trimmed.toLowerCase();
    const existingIndex = managedDepts.findIndex(d => d.name.toLowerCase() === lowerName);

    let updatedList = [...managedDepts];

    if (existingIndex > -1) {
      const existing = updatedList[existingIndex];
      // If deleted or hidden, restore it to visibilty
      updatedList[existingIndex] = {
        ...existing,
        isDeleted: false,
        isHidden: false
      };
    } else {
      // Create a brand new custom department
      const newCustom: DepartmentItem = {
        id: `custom_${Date.now()}`,
        name: trimmed,
        icon: '🏛️',
        isDefault: false,
        isHidden: false,
        isDeleted: false,
        order: managedDepts.length
      };
      updatedList.push(newCustom);
    }

    setManagedDepts(updatedList);
    saveManagedDepartments(updatedList);
    handleSelect(trimmed);

    // Call custom event to notify external windows to refresh if any
    window.dispatchEvent(new Event('bmsicl_departments_refreshed'));
  };

  const isExactMatch = visibleDepartments.some(
    d => d.name.toLowerCase() === search.trim().toLowerCase()
  );

  return (
    <div ref={containerRef} className="relative w-full text-slate-800 dark:text-slate-100">
      {/* Trigger Button */}
      <button
        type="button"
        id="department-select-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-left transition-all active:scale-[0.99] select-none cursor-pointer"
      >
        <div className="flex items-center gap-2 truncate">
          <span className="text-base shrink-0 select-none">
            {getDepartmentIcon(value || '', managedDepts)}
          </span>
          <span className="truncate">
            {value || (lang === 'en' ? 'Select Department' : 'विभाग चुनें')}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Overlay Pane */}
      {isOpen && (
        <div className="absolute top-all left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-fadeIn max-h-80 flex flex-col">
          {/* Dropdown Search Box */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1.5" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === 'en' ? 'Search medical departments...' : 'चिकित्सा विभाग खोजें...'}
              className="flex-1 text-xs bg-transparent border-none outline-none focus:ring-0 text-slate-800 dark:text-slate-150 font-medium placeholder:text-slate-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-105 dark:hover:bg-slate-800"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Department Items list */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-1 space-y-0.5 max-h-56">
            {filtered.length > 0 ? (
              filtered.map((dept) => {
                const isSelected = value.toLowerCase() === dept.name.toLowerCase();
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => handleSelect(dept.name)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-650 dark:text-blue-400 font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-950/70 text-slate-700 dark:text-slate-300 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-sm select-none shrink-0">{dept.icon}</span>
                      <span className="truncate">{dept.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-550 dark:text-blue-400 shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-4xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {lang === 'en' ? 'No departments found' : 'कोई विभाग नहीं मिला'}
              </div>
            )}
          </div>

          {/* Manual / Custom department adding capability */}
          {search.trim() && !isExactMatch && (
            <div className="p-2 border-t border-slate-100 dark:border-slate-850 bg-indigo-50/10 dark:bg-indigo-950/10 shrink-0">
              <button
                type="button"
                onClick={handleCreateCustom}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-650 dark:text-indigo-400 rounded-xl text-2xs font-bold transition-all border border-indigo-100 dark:border-indigo-900/40 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>
                  {lang === 'en' ? `Create Custom: "${search.trim()}"` : `कस्टम विभाग बनाएं: "${search.trim()}"`}
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
