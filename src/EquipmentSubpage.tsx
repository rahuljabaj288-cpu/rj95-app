/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Package, Tag, UserCheck, Shield, ChevronRight, Check } from 'lucide-react';
import { Tender, Language } from '../types';
import InstantSearchBar from './InstantSearchBar';
import HighlightText from './HighlightText';
import { getDepartmentIcon } from './DepartmentDropdown';

interface EquipmentSubpageProps {
  tenders: Tender[];
  lang: Language;
  onEditTender: (tender: Tender) => void;
  role: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectTender?: (t: Tender) => void;
}

export default function EquipmentSubpage({
  tenders,
  lang,
  onEditTender,
  role,
  searchQuery,
  onSearchChange,
  onSelectTender
}: EquipmentSubpageProps) {
  const [deptFilter, setDeptFilter] = useState('all');

  const filtered = tenders.filter(t => {
    // Extensive multi-column match
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || Object.entries(t).some(([key, val]) => {
      if (key === 'id') return false;
      if (val === undefined || val === null) return false;
      return String(val).toLowerCase().includes(q);
    });

    const matchDept = deptFilter === 'all' || t.department === deptFilter;
    return matchSearch && matchDept;
  });

  const uniqueDepts = Array.from(new Set(tenders.map(t => t.department).filter(Boolean)));

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 sm:p-2 animate-fadeIn select-none">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-50 uppercase tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-500" />
            <span>{lang === 'en' ? 'BMSICL Equipment Registry' : 'चिकित्सा उपकरण विवरण'}</span>
          </h2>
          <p className="text-3xs text-slate-500">
            {lang === 'en' ? 'Review all medical machinery, technical department owners, and procurement managers in charge.' : 'सभी चिकित्सा उपकरणों, तकनीकी विभागों और वित्तीय निविदा प्रबंधकों की समीक्षा करें।'}
          </p>
        </div>

        {/* Live Counters */}
        <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 px-3.5 py-1.5 rounded-xl text-3xs font-semibold text-indigo-700 dark:text-indigo-400">
          Total Registered Machinery Types: <strong className="font-bold text-xs">{tenders.length}</strong>
        </div>
      </div>

      {/* Mini Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1">
          <InstantSearchBar
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            tenders={tenders}
            lang={lang}
            onSelectTender={onSelectTender}
            placeholder={lang === 'en' ? 'Search equipment instantly across all columns...' : 'चिकित्सा उपकरण को तुरंत सभी कॉलम में खोजें...'}
          />
        </div>

        {/* Department Filter */}
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3.5 py-2 text-xs rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
        >
          <option value="all">{lang === 'en' ? 'All Departments' : 'सभी विभाग'}</option>
          {uniqueDepts.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((tender) => (
          <div
            key={tender.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-850 shadow-sm flex flex-col justify-between hover:border-indigo-500 dark:hover:border-indigo-500/80 hover:shadow-md transition-all group duration-300"
          >
            <div>
              {/* Header Metadata */}
              <div className="flex justify-between items-center text-5xs font-mono font-bold uppercase tracking-widest text-slate-400">
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-sky-505 text-indigo-400" />
                  <HighlightText text={tender.tenderNo} highlight={searchQuery} />
                </span>

                <span className="px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-950/60 border border-slate-150/50 text-slate-500">
                  Sl No {tender.slNo}
                </span>
              </div>

              {/* Equipment Title */}
              <h3 className="text-sm font-black text-slate-850 dark:text-slate-100 mt-2.5 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                <HighlightText text={tender.equipmentName} highlight={searchQuery} />
              </h3>

              {/* Department Block */}
              <p className="text-[10px] text-slate-505 dark:text-slate-400 mt-1.5 font-bold bg-slate-50 dark:bg-slate-950/50 px-2 py-1 rounded inline-flex items-center gap-1.5 max-w-full truncate border border-slate-100 dark:border-slate-850/50" title={tender.department}>
                <span className="select-none text-xs">{getDepartmentIcon(tender.department || 'General Procurement')}</span>
                <HighlightText text={tender.department || 'General Procurement'} highlight={searchQuery} />
              </p>

              {/* Status details summary */}
              <p className="text-3xs text-slate-505 dark:text-slate-400 mt-3.5 bg-indigo-50/20 dark:bg-slate-950/40 p-2.5 rounded-xl border border-indigo-100/10 italic text-[10px] leading-relaxed line-clamp-3">
                "<HighlightText text={tender.statusText || 'No current stage ledger update description logged.'} highlight={searchQuery} />"
              </p>
            </div>

            {/* Footer Items */}
            <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-2xs">
              <span className="inline-flex items-center gap-1 font-bold text-slate-600 dark:text-slate-350">
                <UserCheck className="w-3.5 h-3.5 text-emerald-505 text-indigo-400" />
                <span>Manager: <strong className="text-slate-800 dark:text-slate-200 font-mono"><HighlightText text={tender.manager || 'Girish'} highlight={searchQuery} /></strong></span>
              </span>

              {role !== 'Guest' && (
                <button
                  onClick={() => onEditTender(tender)}
                  className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-600 hover:text-white rounded-lg transition-colors cursor-pointer text-3xs uppercase tracking-wider inline-flex items-center gap-0.5"
                >
                  Edit Milestones
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold">No registered machinery matching the search filter was cataloged.</p>
          </div>
        )}
      </div>

    </div>
  );
}
