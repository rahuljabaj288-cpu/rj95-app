/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Tender, Language } from '../types';
import { getTranslation } from '../localization';
import { Edit2, Trash2, Eye, EyeOff, Check, X, Pencil, SlidersHorizontal, ArrowUpDown, FileText } from 'lucide-react';
import DateTimePicker from './DateTimePicker';
import HighlightText from './HighlightText';
import { getDepartmentIcon } from './DepartmentDropdown';

interface TenderTableProps {
  tenders: Tender[];
  lang: Language;
  onEditTender: (tender: Tender) => void;
  onDeleteTender: (id: string) => void;
  onUpdateField: (id: string, field: keyof Tender, value: any) => void;
  searchQuery: string;
  stageFilter: string;
  googleToken?: string | null;
  onExportGoogleDoc?: (tender: Tender) => void;
}

export default function TenderTable({
  tenders,
  lang,
  onEditTender,
  onDeleteTender,
  onUpdateField,
  searchQuery,
  stageFilter,
  googleToken,
  onExportGoogleDoc
}: TenderTableProps) {
  const [quickEditId, setQuickEditId] = useState<string | null>(null);
  const [showColSettings, setShowColSettings] = useState(false);
  const [sortField, setSortField] = useState<keyof Tender>('tenderNo');
  const [sortAsc, setSortAsc] = useState(true);

  // Column definitions list
  const allColumns: { key: keyof Tender; labelKey: any; isNumber?: boolean }[] = [
    { key: 'slNo', labelKey: 'slNo', isNumber: true },
    { key: 'department', labelKey: 'department' },
    { key: 'tenderNo', labelKey: 'tenderNo' },
    { key: 'equipmentName', labelKey: 'equipmentName' },
    { key: 'openedDate', labelKey: 'openedDate' },
    { key: 'endDate', labelKey: 'endDate' },
    { key: 'statusText', labelKey: 'statusText' },
    { key: 'manager', labelKey: 'manager' },
    { key: 'preBidMeeting', labelKey: 'preBidMeeting' },
    { key: 'tscMeeting', labelKey: 'tscMeeting' },
    { key: 'technicalOpening', labelKey: 'technicalOpening' },
    { key: 'bidderName', labelKey: 'bidderName' },
    { key: 'noOfBidders', labelKey: 'noOfBidders', isNumber: true },
    { key: 'tecMeeting', labelKey: 'tecMeeting' },
    { key: 'postTecMeeting', labelKey: 'postTecMeeting' },
    { key: 'tec2Meeting', labelKey: 'tec2Meeting' },
    { key: 'demoMeeting', labelKey: 'demoMeeting' },
    { key: 'postDemoMeeting', labelKey: 'postDemoMeeting' },
    { key: 'financialOpening', labelKey: 'financialOpening' },
    { key: 'priceJustificationMeeting', labelKey: 'priceJustificationMeeting' },
    { key: 'awardOfContract', labelKey: 'awardOfContract' },
    { key: 'agreement', labelKey: 'agreement' },
  ];

  // Columns visibility state
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    slNo: true,
    department: true,
    tenderNo: true,
    equipmentName: true,
    openedDate: true,
    endDate: true,
    statusText: true,
    manager: true,
    preBidMeeting: false, 
    tscMeeting: false,
    technicalOpening: false,
    bidderName: false,
    noOfBidders: false,
    tecMeeting: false,
    postTecMeeting: false,
    tec2Meeting: false,
    demoMeeting: false,
    postDemoMeeting: false,
    financialOpening: false,
    priceJustificationMeeting: false,
    awardOfContract: false,
    agreement: false,
  });

  const handleToggleCol = (colKey: string) => {
    setVisibleColumns(prev => ({ ...prev, [colKey]: !prev[colKey] }));
  };

  const toggleSort = (field: keyof Tender) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Helper to render customized badge styles based on cell content
  const renderCellStatus = (field: keyof Tender, value: any, recordId: string) => {
    const textVal = String(value || '').trim();
    const lval = textVal.toLowerCase();

    // If we're inline editing this specific row
    if (quickEditId === recordId) {
      if (field === 'noOfBidders' || field === 'slNo') {
        return (
          <input
            id={`cell-${recordId}-${field}`}
            type="number"
            value={value || ''}
            onChange={(e) => onUpdateField(recordId, field, Math.max(0, parseInt(e.target.value) || 0))}
            className="w-16 px-1.5 py-0.5 text-xs border border-blue-500 rounded bg-white dark:bg-slate-900 focus:outline-none"
          />
        );
      }
      
      if (field === 'openedDate' || field === 'endDate') {
        return (
          <div className="min-w-[130px] inline-block">
            <DateTimePicker
              type="date"
              value={value || ''}
              onChange={(val) => onUpdateField(recordId, field, val)}
              lang={lang}
              placeholder="DD-MM-YYYY"
            />
          </div>
        );
      }

      const isMilestone = [
        'preBidMeeting', 'tscMeeting', 'technicalOpening', 'tecMeeting',
        'postTecMeeting', 'tec2Meeting', 'demoMeeting', 'postDemoMeeting',
        'financialOpening', 'priceJustificationMeeting', 'awardOfContract', 'agreement'
      ].includes(String(field));

      if (isMilestone) {
        return (
          <div className="flex gap-1 items-center min-w-[195px] select-none">
            <input
              id={`cell-${recordId}-${field}`}
              type="text"
              value={value || ''}
              onChange={(e) => onUpdateField(recordId, field, e.target.value)}
              className="flex-1 px-1.5 py-1 text-2xs border border-blue-500 rounded bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            />
            <div className="flex gap-0.5 shrink-0">
              <DateTimePicker
                type="date"
                value=""
                onChange={(val) => onUpdateField(recordId, field, val)}
                lang={lang}
                placeholder="📅"
                className="!p-1 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-lg text-2xs"
              />
              <DateTimePicker
                type="time"
                value=""
                onChange={(val) => {
                  const currentVal = value || '';
                  if (currentVal && currentVal !== 'Pending' && currentVal !== 'N/A') {
                     onUpdateField(recordId, field, `${currentVal} ${val}`);
                  } else {
                     onUpdateField(recordId, field, val);
                  }
                }}
                lang={lang}
                placeholder="🕒"
                className="!p-1 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-lg text-2xs"
              />
            </div>
          </div>
        );
      }

      return (
        <input
          id={`cell-${recordId}-${field}`}
          type="text"
          value={value || ''}
          onChange={(e) => onUpdateField(recordId, field, e.target.value)}
          className="min-w-[120px] px-1.5 py-0.5 text-xs border border-blue-500 rounded bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      );
    }

    if (field === 'slNo') {
      return <span className="font-mono text-center font-bold text-slate-500 dark:text-slate-400 block pb-0.5 pr-2">{value || ''}</span>;
    }
    if (field === 'department') {
      const deptName = textVal || 'General';
      const icon = getDepartmentIcon(deptName);
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 font-bold text-2xs uppercase tracking-tight truncate max-w-[170px]" title={deptName}>
          <span className="text-xs select-none">{icon}</span>
          <HighlightText text={deptName} highlight={searchQuery} />
        </span>
      );
    }
    if (field === 'openedDate' || field === 'endDate') {
      return <span className="font-mono text-xs text-slate-600 dark:text-slate-400 font-semibold"><HighlightText text={textVal || '—'} highlight={searchQuery} /></span>;
    }
    if (field === 'manager') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-2xs font-bold bg-indigo-50/70 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/30">
          👨‍💼 <HighlightText text={textVal || 'Girish'} highlight={searchQuery} />
        </span>
      );
    }
    if (field === 'statusText') {
      return (
        <span className="block text-slate-700 dark:text-slate-300 text-xs font-normal whitespace-normal break-words min-w-[300px] max-w-[450px] leading-relaxed py-1">
          <HighlightText text={textVal || 'Awaiting Progress'} highlight={searchQuery} />
        </span>
      );
    }

    if (field === 'tenderNo') {
      return <span className="font-mono text-[11px] font-semibold text-blue-800 dark:text-blue-400 select-all"><HighlightText text={textVal} highlight={searchQuery} /></span>;
    }
    if (field === 'equipmentName') {
      return <span className="font-medium text-slate-850 dark:text-slate-100 block text-xs whitespace-normal break-words underline-offset-2 min-w-[220px] max-w-[300px] leading-tight"><HighlightText text={textVal} highlight={searchQuery} /></span>;
    }
    if (field === 'noOfBidders') {
      return <span className="font-mono text-center block text-sm font-semibold">{textVal}</span>;
    }

    if (!lval || lval === 'pending' || lval === 'scheduled(pending)' || lval.includes('awaiting')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          <HighlightText text={textVal || 'Pending'} highlight={searchQuery} />
        </span>
      );
    }

    if (lval.includes('complete') || lval.includes('signed') || lval === 'approved' || lval === 'yes' || lval.includes('opened')) {
      let label = textVal;
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/40">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <HighlightText text={label} highlight={searchQuery} />
        </span>
      );
    }

    if (lval.includes('schedule')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-305 border border-sky-200/40 dark:border-sky-900/30">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
          <HighlightText text={textVal} highlight={searchQuery} />
        </span>
      );
    }

    if (lval === 'n/a' || lval === 'no' || lval === 'not applicable') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-550 border border-slate-200 dark:border-slate-800">
          N/A
        </span>
      );
    }

    if (lval.includes('progress') || lval.includes('drafting')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold bg-indigo-50 dark:bg-indigo-950/45 text-indigo-700 dark:text-indigo-400 border border-indigo-200/40 dark:border-indigo-900/20">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          <HighlightText text={textVal} highlight={searchQuery} />
        </span>
      );
    }

    // Default text fallback
    return <span className="text-2xs text-slate-600 dark:text-slate-350"><HighlightText text={textVal} highlight={searchQuery} /></span>;
  };

  // Filter and Search logic applied
  const processedTenders = tenders
    .filter(t => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || Object.entries(t).some(([key, val]) => {
        if (key === 'id') return false;
        if (val === undefined || val === null) return false;
        return String(val).toLowerCase().includes(q);
      });

      if (!matchSearch) return false;

      // Apply quick stageFilter
      if (stageFilter === 'active_agreements') {
        const agL = t.agreement.toLowerCase();
        return agL.includes('signed') || agL.includes('completed') || agL.includes('in progress');
      }

      if (stageFilter === 'upcoming_stages') {
        // Pre-Bid or TSC pending or in progress
        return t.preBidMeeting.toLowerCase().includes('schedule') || t.tscMeeting.toLowerCase().includes('pending');
      }

      return true;
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();

      return sortAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm overflow-hidden flex flex-col">
      
      {/* Table Action Controls Toolbar */}
      <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between flex-wrap gap-2 select-none">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowColSettings(!showColSettings)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${showColSettings ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Columns Viz ({Object.values(visibleColumns).filter(Boolean).length}/16)</span>
          </button>
        </div>

        <div className="text-2xs font-semibold text-slate-500 dark:text-slate-400">
          {processedTenders.length === tenders.length 
            ? getTranslation(lang, 'entriesCount').replace('{count}', String(tenders.length))
            : `Filtered: ${processedTenders.length} / ${tenders.length}`
          }
        </div>
      </div>

      {/* Column Display Management Panel */}
      {showColSettings && (
        <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-850 grid grid-cols-2 md:grid-cols-4 gap-2 select-none">
          {allColumns.map((col) => (
            <label
              key={col.key}
              className="flex items-center gap-2 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/20"
            >
              <input
                id={`vis-col-${col.key}`}
                type="checkbox"
                checked={visibleColumns[col.key]}
                onChange={() => handleToggleCol(col.key)}
                className="rounded border-slate-300 dark:border-slate-800 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                {getTranslation(lang, col.labelKey)}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* Main horizontally and vertically scrollable table box */}
      <div className="overflow-x-auto w-full">
        <table id="tender-table-main" className="w-full text-left border-collapse min-w-[1200px]">
          
          {/* Table Header Row */}
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 select-none text-2xs uppercase tracking-wider font-bold border-b border-slate-100 dark:border-slate-850">
            <tr>
              {/* Dynamic Columns */}
              {allColumns.map(col => {
                if (!visibleColumns[col.key]) return null;
                return (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className="p-3 text-left hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer transition-all border-r border-slate-150/40 dark:border-slate-900/50"
                  >
                    <div className="flex items-center gap-1">
                      <span>{getTranslation(lang, col.labelKey)}</span>
                      <ArrowUpDown className={`w-3 h-3 ${sortField === col.key ? 'text-blue-500' : 'text-slate-300 dark:text-slate-750'}`} />
                    </div>
                  </th>
                );
              })}
              
              {/* Actions Column fixed on right */}
              <th className="p-3 text-center sticky right-0 bg-slate-100 dark:bg-slate-950 z-10 w-32 border-l border-slate-200 dark:border-slate-800">
                <span>Actions</span>
              </th>
            </tr>
          </thead>

          {/* Table Body Content Loop */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
            {processedTenders.length === 0 ? (
              <tr>
                <td colSpan={17} className="p-12 text-center text-slate-400 text-xs">
                  No records found matching the active filters or search terms.
                </td>
              </tr>
            ) : (
              processedTenders.map(tender => {
                const isQuickEditing = quickEditId === tender.id;
                
                return (
                  <tr
                    key={tender.id}
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors text-xs ${isQuickEditing ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''}`}
                  >
                    {/* Render fields according to column visibility */}
                    {allColumns.map(col => {
                      if (!visibleColumns[col.key]) return null;
                      return (
                        <td
                          key={col.key}
                          className="p-3 border-r border-slate-100/45 dark:border-slate-850/30 font-medium max-w-[220px] truncate"
                        >
                          {renderCellStatus(col.key, tender[col.key], tender.id)}
                        </td>
                      );
                    })}

                    {/* Actions controls column */}
                    <td className="p-2 text-center bg-white dark:bg-slate-900 sticky right-0 z-10 w-32 border-l border-slate-100 dark:border-slate-850 shadow-[-4px_0_8px_rgba(0,0,0,0.03)] dark:shadow-[-4px_0_12px_rgba(0,0,0,0.2)]">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {/* Quick Inline Edit Pencil Toggle */}
                        {isQuickEditing ? (
                          <button
                            onClick={() => setQuickEditId(null)}
                            title="Save inline changes"
                            className="p-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 rounded-lg hover:bg-emerald-150 transition cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setQuickEditId(tender.id)}
                            title="Quick Inline Edit Cell values"
                            className="p-1 text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-slate-800 rounded-lg hover:bg-sky-100 dark:hover:bg-slate-750 transition cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Full Edit Modal Launcher */}
                        <button
                          onClick={() => onEditTender(tender)}
                          title="Open Full Details Editor"
                          className="p-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Export to Google Docs */}
                        {googleToken && onExportGoogleDoc && (
                          <button
                            onClick={() => onExportGoogleDoc(tender)}
                            title="Export Tender Milestones to Google Doc"
                            className="p-1.5 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-slate-850 hover:bg-indigo-100 dark:hover:bg-slate-750 rounded-lg transition-colors cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-650" />
                          </button>
                        )}

                        {/* Delete Row with confirmation */}
                        <button
                          onClick={() => onDeleteTender(tender.id)}
                          title="Delete Record"
                          className="p-1.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Advice tip on cell operations */}
      <div className="p-3 bg-slate-50 dark:bg-slate-950/20 text-center text-3xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-850 select-none">
        💡 Pro-Tip: Click on the <b>Pencil icon</b> to quickly modify column values directly inside the cells, or click the <b>Edit icon (pencil on paper)</b> to open the organized stage-by-stage popup manager.
      </div>
    </div>
  );
}
