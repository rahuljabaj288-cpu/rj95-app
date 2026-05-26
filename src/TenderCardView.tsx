/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Tender, Language } from '../types';
import { getTranslation } from '../localization';
import { Edit2, Trash2, ChevronDown, ChevronUp, Calendar, AlertCircle, Award, Users, FileText } from 'lucide-react';
import HighlightText from './HighlightText';
import { getDepartmentIcon } from './DepartmentDropdown';

interface TenderCardViewProps {
  tenders: Tender[];
  lang: Language;
  onEditTender: (tender: Tender) => void;
  onDeleteTender: (id: string) => void;
  searchQuery: string;
  stageFilter: string;
  googleToken?: string | null;
  onExportGoogleDoc?: (tender: Tender) => void;
}

export default function TenderCardView({
  tenders,
  lang,
  onEditTender,
  onDeleteTender,
  searchQuery,
  stageFilter,
  googleToken,
  onExportGoogleDoc
}: TenderCardViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Filter logic same as table
  const processedTenders = tenders.filter(t => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || Object.entries(t).some(([key, val]) => {
      if (key === 'id') return false;
      if (val === undefined || val === null) return false;
      return String(val).toLowerCase().includes(q);
    });

    if (!matchSearch) return false;

    if (stageFilter === 'active_agreements') {
      const agL = t.agreement.toLowerCase();
      return agL.includes('signed') || agL.includes('completed') || agL.includes('in progress');
    }

    if (stageFilter === 'upcoming_stages') {
      return t.preBidMeeting.toLowerCase().includes('schedule') || t.tscMeeting.toLowerCase().includes('pending');
    }

    return true;
  });

  // Calculate current completion percentage based on fields filled
  const calculateProgressPercent = (t: Tender) => {
    const stages = [
      t.preBidMeeting, t.tscMeeting, t.technicalOpening, t.tecMeeting,
      t.postTecMeeting, t.tec2Meeting, t.demoMeeting, t.postDemoMeeting,
      t.financialOpening, t.priceJustificationMeeting, t.awardOfContract, t.agreement
    ];
    let completed = 0;
    stages.forEach(s => {
      const v = s.toLowerCase();
      if (v.includes('complete') || v.includes('signed') || v.includes('approved') || v.includes('opened') || v.includes('yes')) {
        completed++;
      } else if (v.includes('progress') || v.includes('schedule') || v.includes('drafting')) {
        completed += 0.5; // partial
      }
    });

    return Math.round((completed / stages.length) * 100);
  };

  return (
    <div className="space-y-3 px-1">
      {processedTenders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-8 rounded-2xl text-center text-slate-400 text-xs">
          No records found. Adjust your search or filters.
        </div>
      ) : (
        processedTenders.map(tender => {
          const isExpanded = expandedId === tender.id;
          const pct = calculateProgressPercent(tender);
          
          return (
            <div
              key={tender.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-850 p-4 shadow-sm hover:shadow-md transition-all flex flex-col"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start gap-2 cursor-pointer" onClick={() => toggleExpand(tender.id)}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 font-bold px-1.5 py-0.5 rounded text-indigo-700 dark:text-indigo-400 font-mono">
                      Sl. {tender.slNo}
                    </span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 px-2 py-0.5 rounded font-bold flex items-center gap-1 truncate max-w-[150px]" title={tender.department}>
                      <span className="select-none text-xs">{getDepartmentIcon(tender.department || 'General')}</span>
                      <HighlightText text={tender.department || 'General'} highlight={searchQuery} />
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400 select-all font-mono">
                      <HighlightText text={tender.tenderNo} highlight={searchQuery} />
                    </span>
                    <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                      {pct}% Done
                    </span>
                  </div>
                  
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 mt-1 leading-snug">
                    <HighlightText text={tender.equipmentName} highlight={searchQuery} />
                  </h3>
                </div>
                
                <div className="text-slate-400 p-1">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              {/* Status and Manager details */}
              <div className="mt-2.5 p-2.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl" onClick={() => toggleExpand(tender.id)}>
                <p className="text-2xs font-bold text-slate-400 uppercase tracking-wide flex justify-between">
                  <span>Current Live Status</span>
                  <span className="text-indigo-650 dark:text-indigo-400">👨‍💼 <HighlightText text={tender.manager || 'Girish'} highlight={searchQuery} /></span>
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed mt-1">
                  <HighlightText text={tender.statusText || 'Awaiting milestone updates under active review.'} highlight={searchQuery} />
                </p>

                <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] font-mono select-none text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-850/60">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-normal">Opened Date</span>
                    <span className="font-semibold"><HighlightText text={tender.openedDate || '—'} highlight={searchQuery} /></span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-normal">End Date</span>
                    <span className="font-semibold"><HighlightText text={tender.endDate || '—'} highlight={searchQuery} /></span>
                  </div>
                </div>
              </div>

              {/* Progress Micro Indicator bar */}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
                <span className="text-3xs font-mono font-bold text-slate-400">{pct}%</span>
              </div>

              {/* Primary Stage details preview (Last executed action preview) */}
              <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-850/50 flex justify-between items-center text-2xs select-none">
                <div className="text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-400 mr-2">Agreement:</span>
                  <span className={`font-bold ${tender.agreement.toLowerCase().includes('signed') ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-550 dark:text-amber-400'}`}>
                    <HighlightText text={tender.agreement} highlight={searchQuery} />
                  </span>
                </div>
                
                <div className="text-slate-400 flex items-center gap-1 font-mono">
                  <Users className="w-3.5 h-3.5" />
                  <span>{tender.noOfBidders} Bidder(s)</span>
                </div>
              </div>

              {/* Expanded details (Showing all 16 items configured dynamically) */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800 space-y-4">
                  {/* Bidders Details list */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl space-y-2">
                    <p className="text-2xs font-bold uppercase tracking-wider text-slate-400">
                      {getTranslation(lang, 'bidderName')}
                    </p>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <HighlightText text={tender.bidderName || 'N/A'} highlight={searchQuery} />
                    </p>
                  </div>

                  {/* 16 columns formatted as a streamlined timeline step list */}
                  <div className="space-y-2.5">
                    <h4 className="text-2xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <FileText className="w-4.5 h-4.5" />
                      <span>Detailed Milestones Grid (16 Steps)</span>
                    </h4>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {[
                        { label: getTranslation(lang, 'preBidMeeting'), val: tender.preBidMeeting },
                        { label: getTranslation(lang, 'tscMeeting'), val: tender.tscMeeting },
                        { label: getTranslation(lang, 'technicalOpening'), val: tender.technicalOpening },
                        { label: getTranslation(lang, 'tecMeeting'), val: tender.tecMeeting },
                        { label: getTranslation(lang, 'postTecMeeting'), val: tender.postTecMeeting },
                        { label: getTranslation(lang, 'tec2Meeting'), val: tender.tec2Meeting },
                        { label: getTranslation(lang, 'demoMeeting'), val: tender.demoMeeting },
                        { label: getTranslation(lang, 'postDemoMeeting'), val: tender.postDemoMeeting },
                        { label: getTranslation(lang, 'financialOpening'), val: tender.financialOpening },
                        { label: getTranslation(lang, 'priceJustificationMeeting'), val: tender.priceJustificationMeeting },
                        { label: getTranslation(lang, 'awardOfContract'), val: tender.awardOfContract },
                      ].map((step, idx) => {
                        const isDone = step.val.toLowerCase().includes('complete') || step.val.toLowerCase().includes('open') || step.val.toLowerCase().includes('approve') || step.val.toLowerCase().includes('yes');
                        const isPending = step.val.toLowerCase().includes('pending');
                        
                        return (
                          <div key={idx} className="p-2 border border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900 rounded-xl">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">{step.label}</span>
                            <span className={`text-[11px] font-bold block mt-0.5 ${isDone ? 'text-emerald-600 dark:text-emerald-400' : isPending ? 'text-amber-500 dark:text-amber-400' : 'text-slate-700 dark:text-slate-350'}`}>
                              {step.val}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Operational controls */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                    <button
                      onClick={() => onEditTender(tender)}
                      className="flex-1 py-2 px-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100 rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer min-w-[100px]"
                    >
                      <Edit2 className="w-4.5 h-4.5" />
                      <span>{getTranslation(lang, 'editRow')}</span>
                    </button>

                    {googleToken && onExportGoogleDoc && (
                      <button
                        onClick={() => onExportGoogleDoc(tender)}
                        className="flex-1 py-2 px-3 bg-indigo-55 bg-indigo-50 dark:bg-slate-850 text-indigo-700 dark:text-blue-350 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer min-w-[100px]"
                      >
                        <FileText className="w-4.5 h-4.5 text-blue-600" />
                        <span>Google Doc</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => onDeleteTender(tender.id)}
                      className="py-2 px-3 bg-red-50 dark:bg-red-950/30 text-red-650 text-red-600 dark:text-red-400 hover:bg-red-100 rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer min-w-[60px]"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                      <span>{getTranslation(lang, 'deleteRow')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
