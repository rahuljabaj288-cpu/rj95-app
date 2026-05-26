/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, X, CheckSquare, Info, ShieldAlert, Award, Calendar, RefreshCw } from 'lucide-react';
import { Language } from '../types';

interface StatusLegendProps {
  lang: Language;
}

export default function StatusLegend({ lang }: StatusLegendProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Status explanations dictionary for both languages
  const legendItems = [
    {
      key: 'completed',
      title: lang === 'en' ? 'Completed / Approved / Opened' : 'पूर्ण / स्वीकृत / खोले गये',
      badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/40',
      dotClass: 'bg-emerald-500',
      description: lang === 'en' 
        ? 'Indicates this milestone evaluation phase has successfully finished, signed off, or technical envelopes have been opened.' 
        : 'यह दर्शाता है कि यह मील का पत्थर चरण सफलतापूर्वक समाप्त हो चुका है, हस्ताक्षरित है, या तकनीकी लिफाफे खोले जा चुके हैं।',
      example: lang === 'en' ? ['Completed', 'Opened (15.06.27)', 'Signed'] : ['पूर्ण', 'खोला गया', 'हस्ताक्षरित']
    },
    {
      key: 'in-progress',
      title: lang === 'en' ? 'In-Progress / Drafting' : 'प्रगति पर है / प्रारूपण (ड्राफ्टिंग)',
      badgeClass: 'bg-indigo-50 dark:bg-indigo-950/45 text-indigo-700 dark:text-indigo-400 border border-indigo-200/40 dark:border-indigo-900/20',
      dotClass: 'bg-indigo-500',
      description: lang === 'en' 
        ? 'Indicates the phase is under active evaluation, minutes are being drafted, or queries are currently awaiting bidder responses.' 
        : 'इंगित करता है कि चरण सक्रिय मूल्यांकन के अधीन है, बैठक की कार्यवाही का मसौदा तैयार किया जा रहा है, या बोलीदाता के जवाब प्रतीक्षित हैं।',
      example: lang === 'en' ? ['In Progress', 'Minutes under signing', 'Drafting Queries'] : ['कार्यवाही जारी', 'हस्ताक्षर प्रक्रिया', 'मसौदा तैयार']
    },
    {
      key: 'scheduled',
      title: lang === 'en' ? 'Scheduled Meeting' : 'बैठक निर्धारित है',
      badgeClass: 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border border-sky-200/40 dark:border-sky-900/30',
      dotClass: 'bg-sky-500',
      description: lang === 'en' 
        ? 'Indicates a calendar date has been officially reserved for this meeting (e.g., Pre-Bid, TSC, Demo or TEC session).' 
        : 'दर्शाता है कि इस बैठक (प्री-बिड, टीएससी, डेमो या टीईसी सत्र) के लिए आधिकारिक तौर पर कैलेंडर तिथि आरक्षित की गई है।',
      example: lang === 'en' ? ['Scheduled (15.06.2027)', 'Meeting Set'] : ['निर्धारित बैठक', 'तिथि सुरक्षित']
    },
    {
      key: 'pending',
      title: lang === 'en' ? 'Pending / Awaiting Action' : 'लंबित / कार्रवाई की प्रतीक्षा में',
      badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30',
      dotClass: 'bg-amber-500 animate-pulse',
      description: lang === 'en' 
        ? 'Represent milestones awaiting previous task resolutions or initial files. Accompanied by a pulsing status indicator.' 
        : 'यह पिछले कार्यों के समाधान या प्रारंभिक फाइलों की प्रतीक्षा कर रहे मील के पत्थर का प्रतिनिधित्व करता है, जिसमें एक पलसिंग संकेतक होता है।',
      example: lang === 'en' ? ['Pending', 'Awaiting Update', 'Awaiting Predecessors'] : ['लंबित', 'अद्यतन की प्रतीक्षा', 'प्रतीक्षित']
    },
    {
      key: 'na',
      title: lang === 'en' ? 'Not Applicable (N/A)' : 'लागू नहीं (N/A)',
      badgeClass: 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-550 border border-slate-200 dark:border-slate-800',
      dotClass: 'hidden',
      description: lang === 'en' 
        ? 'Represents standard evaluation paths that are verified as structurally waived, optional, or irrelevant for this machinery item.' 
        : 'उन सामान्य मूल्यांकन चरणों का प्रतिनिधित्व करता है जिन्हें इस विशेष मशीनरी वस्तु के लिए छोड़ दिया गया है या जो अप्रासंगिक हैं।',
      example: ['N/A', 'Not Applicable', 'No']
    }
  ];

  return (
    <div id="status-legend-standalone-container" className="no-print inline-block">
      {/* Small informative inline trigger button */}
      <button
        id="btn-status-legend-trigger"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-3xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200/60 dark:border-slate-850/70 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-2xs"
        title={lang === 'en' ? 'View Status Color Code Legend' : 'स्थिति रंग-कूट संकेतक देखें'}
      >
        <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
        <span>{lang === 'en' ? 'Status Color Legend' : 'स्थिति संकेतक लेजेंड'}</span>
      </button>

      {/* Modal Backdrop */}
      {isOpen && (
        <div 
          id="status-legend-modal-overlay"
          className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsOpen(false)}
        >
          {/* Modal Card */}
          <div 
            id="status-legend-modal-card"
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl shadow-2xl p-5 space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400">
                  <Info className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-150 uppercase tracking-tight">
                    {lang === 'en' ? 'Milestone Color Code Guide' : 'स्थिति मील के पत्थर संकेत गाइड'}
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold font-mono">
                    {lang === 'en' ? 'Bihar Government BMSICL Ledgers' : 'बिहार सरकार BMSICL लेजर नियम'}
                  </p>
                </div>
              </div>
              <button
                id="btn-close-status-legend-modal"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Context Explanation banner */}
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold bg-indigo-50/20 dark:bg-indigo-950/10 p-2.5 rounded-xl border border-indigo-100/30 dark:border-indigo-950/20">
              {lang === 'en' 
                ? 'These standardized, eye-safe status colors are systematically synced across cell grids, visual statistics graphs, and Android summary cards to guarantee effortless tracking of BMSICL equipment procurement pipelines.'
                : 'इन मानकीकृत रंग कोडों को सेल ग्रिड, दृश्य सांख्यिकी ग्राफ़ और एंड्रॉइड सारांश कार्डों में समक्रमिक किया गया है ताकि बीएमएसआईसीएल उपकरणों की निगरानी सहजता से की जा सके।'}
            </p>

            {/* Items Stream */}
            <div className="space-y-3">
              {legendItems.map((item) => (
                <div 
                  key={item.key} 
                  className="p-3 bg-slate-50/50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-850/60 rounded-2xl flex flex-col sm:flex-row gap-3 items-start hover:border-indigo-200/50 dark:hover:border-indigo-950/20 transition-all"
                >
                  {/* Color Representative Badge */}
                  <div className="sm:w-[150px] w-full shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${item.badgeClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.dotClass}`}></span>
                      <span>{item.title}</span>
                    </span>
                  </div>

                  {/* Descriptions */}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-1 text-3xs font-mono font-bold text-slate-400">
                      <span className="opacity-75 uppercase">{lang === 'en' ? 'Examples:' : 'उदाहरण:'}</span>
                      {item.example.map((ex, i) => (
                        <span key={i} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 px-1.5 py-0.5 rounded leading-none text-slate-500">
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer warning */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center text-3xs font-medium text-slate-400">
              <span className="flex items-center gap-1 text-indigo-500">
                <CheckSquare className="w-3.5 h-3.5" />
                <span>BMSICL standard tracker system</span>
              </span>
              <button 
                onClick={() => setIsOpen(false)}
                className="bg-indigo-650 hover:bg-blue-600 text-white font-extrabold px-3 py-1.5 rounded-xl transition-all hover:scale-102 cursor-pointer active:scale-98"
              >
                {lang === 'en' ? 'Got It' : 'समझ गया'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
