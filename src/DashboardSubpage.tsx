/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  FileText, 
  Activity, 
  SearchCode, 
  Users, 
  Play, 
  TrendingUp, 
  Award, 
  FileCheck,
  Building,
  ArrowRight,
  Clock,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { Tender, Language } from '../types';
import { getTranslation } from '../localization';
import InstantSearchBar from './InstantSearchBar';

interface DashboardSubpageProps {
  tenders: Tender[];
  lang: Language;
  onNavigateToTenders: (mode: string) => void;
  username: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectTender?: (t: Tender) => void;
}

export default function DashboardSubpage({
  tenders,
  lang,
  onNavigateToTenders,
  username,
  searchQuery,
  onSearchChange,
  onSelectTender
}: DashboardSubpageProps) {
  
  // Calculate metric counts accurately
  const totalTenders = tenders.length;
  
  const activeTenders = tenders.filter(t => {
    const agL = t.agreement.toLowerCase().trim();
    const acL = t.awardOfContract.toLowerCase().trim();
    return !agL.includes('signed') && !agL.includes('complete') && !acL.includes('re-tender');
  }).length;

  const technicalOpeningCount = tenders.filter(t => {
    const to = t.technicalOpening.toLowerCase();
    return to.includes('open') || to.includes('complete') || to.includes('yes');
  }).length;

  const tecMeetingCount = tenders.filter(t => {
    const tec = t.tecMeeting.toLowerCase();
    return tec.includes('complete') || tec.includes('schedule') || tec.includes('yes');
  }).length;

  const demoMeetingCount = tenders.filter(t => {
    const demo = t.demoMeeting.toLowerCase();
    return demo.includes('complete') || demo.includes('schedule') || demo.includes('yes');
  }).length;

  const financialOpeningCount = tenders.filter(t => {
    const fin = t.financialOpening.toLowerCase();
    return fin.includes('open') || fin.includes('complete') || fin.includes('yes');
  }).length;

  const awardCount = tenders.filter(t => {
    const award = t.awardOfContract.toLowerCase();
    return award.includes('approved') || award.includes('complete') || award.includes('award') || award.includes('yes');
  }).length;

  const agreementCount = tenders.filter(t => {
    const ag = t.agreement.toLowerCase();
    return ag.includes('signed') || ag.includes('complete') || ag.includes('yes');
  }).length;

  // Let's list the 8 specific summary cards requested
  const statCards = [
    {
      id: 'all',
      titleEn: 'Total Tenders',
      titleHi: 'कुल निविदाएँ',
      count: totalTenders,
      color: 'from-blue-600 to-indigo-600',
      lightBg: 'bg-blue-50/50 dark:bg-blue-950/20',
      borderColor: 'border-blue-150 dark:border-blue-900/30',
      textColor: 'text-blue-600 dark:text-blue-400',
      icon: FileText,
      descEn: 'Master catalog of all procurements',
      descHi: 'सभी खरीद प्रविष्टियों की मास्टर सूची',
    },
    {
      id: 'active',
      titleEn: 'Active Tenders',
      titleHi: 'सक्रिय निविदाएँ',
      count: activeTenders,
      color: 'from-sky-500 to-blue-500',
      lightBg: 'bg-sky-50/50 dark:bg-sky-950/20',
      borderColor: 'border-sky-150 dark:border-sky-900/30',
      textColor: 'text-sky-600 dark:text-sky-400',
      icon: Activity,
      descEn: 'On-going processes awaiting final agreement',
      descHi: 'प्रगति पर चल रही निविदा प्रक्रियाएं',
    },
    {
      id: 'technicalOpening',
      titleEn: 'Technical Opening',
      titleHi: 'तकनीकी ओपनिंग',
      count: technicalOpeningCount,
      color: 'from-pink-500 to-rose-500',
      lightBg: 'bg-pink-50/50 dark:bg-pink-950/20',
      borderColor: 'border-pink-150 dark:border-pink-900/30',
      textColor: 'text-pink-600 dark:text-pink-400',
      icon: SearchCode,
      descEn: 'Tenders opened for technical evaluation',
      descHi: 'तकनीकी टीम द्वारा मूल्यांकन हेतु खुली निविदाएं',
    },
    {
      id: 'tecMeeting',
      titleEn: 'TEC Meeting Status',
      titleHi: 'टीईसी बैठक',
      count: tecMeetingCount,
      color: 'from-rose-500 to-red-500',
      lightBg: 'bg-rose-50/50 dark:bg-rose-950/20',
      borderColor: 'border-rose-150 dark:border-rose-900/30',
      textColor: 'text-rose-600 dark:text-rose-400',
      icon: Users,
      descEn: 'Technical Evaluation Committee meetings',
      descHi: 'तकनीकी मूल्यांकन समिति की बैठकों की स्थिति',
    },
    {
      id: 'demoMeeting',
      titleEn: 'Demo Meeting Status',
      titleHi: 'डेमो बैठक की स्थिति',
      count: demoMeetingCount,
      color: 'from-amber-500 to-orange-500',
      lightBg: 'bg-amber-50/55 dark:bg-amber-950/20',
      borderColor: 'border-amber-150 dark:border-amber-900/30',
      textColor: 'text-amber-600 dark:text-amber-400',
      icon: Play,
      descEn: 'Equipment live trials and presentations',
      descHi: 'उपकरणों के भौतिक परीक्षण एवं प्रदर्शन स्थिति',
    },
    {
      id: 'financialOpening',
      titleEn: 'Financial Opening',
      titleHi: 'वित्तीय ओपनिंग',
      count: financialOpeningCount,
      color: 'from-violet-500 to-fuchsia-500',
      lightBg: 'bg-violet-50/50 dark:bg-violet-950/20',
      borderColor: 'border-violet-150 dark:border-violet-900/30',
      textColor: 'text-violet-600 dark:text-violet-400',
      icon: TrendingUp,
      descEn: 'Rate analysis and commercial evaluation',
      descHi: 'रेट तुलना एवं व्यावसायिक मूल्यांकन स्तर',
    },
    {
      id: 'awardOfContract',
      titleEn: 'Award of Contract',
      titleHi: 'अनुबंध की स्वीकृति',
      count: awardCount,
      color: 'from-indigo-500 to-violet-500',
      lightBg: 'bg-indigo-50/50 dark:bg-indigo-950/20',
      borderColor: 'border-indigo-150 dark:border-indigo-900/30',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      icon: Award,
      descEn: 'Tenders approved by Managing Director',
      descHi: 'प्रबंध निदेशक द्वारा स्वीकृत तथा अनुशंसित निविदाएं',
    },
    {
      id: 'agreement',
      titleEn: 'Agreement Status',
      titleHi: 'समझौता (MOU) स्थिति',
      count: agreementCount,
      color: 'from-emerald-500 to-teal-500',
      lightBg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
      borderColor: 'border-emerald-150 dark:border-emerald-900/30',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      icon: FileCheck,
      descEn: 'MOUs signed with final supplier corporations',
      descHi: 'आपूर्तिकर्ताओं के साथ अंतिम हस्ताक्षरित एमओयू',
    },
  ];

  // Pipeline math
  const pipelineStages = [
    { label: lang === 'en' ? 'Pre-Bid Meetings' : 'प्री-बिड बैठकें', count: tenders.filter(t => t.preBidMeeting.toLowerCase().includes('complete')).length, color: 'bg-blue-500' },
    { label: lang === 'en' ? 'Technical opening' : 'तकनीकी ओपनिंग', count: technicalOpeningCount, color: 'bg-pink-500' },
    { label: lang === 'en' ? 'TEC evaluation' : 'टीईसी समीक्षा', count: tenders.filter(t => t.postTecMeeting.toLowerCase().includes('complete') || t.tecMeeting.toLowerCase().includes('complete')).length, color: 'bg-rose-500' },
    { label: lang === 'en' ? 'Financial opened' : 'वित्तीय स्वीकृत', count: financialOpeningCount, color: 'bg-violet-500' },
    { label: lang === 'en' ? 'MOUs signed' : 'एमओयू हस्ताक्षरित', count: agreementCount, color: 'bg-emerald-500' },
  ];

  // Recent 5 status logs (sorted or from dataset)
  const recentUpdates = tenders.slice(0, 5).map(t => ({
    tenderNo: t.tenderNo,
    equipment: t.equipmentName,
    manager: t.manager || 'Girish',
    status: t.statusText || 'Awaiting Progress updates.',
    department: t.department || 'Lab'
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 sm:p-2 animate-fadeIn select-none">
      
      {/* Dynamic Visual Greeting Header Block */}
      <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.15),transparent_60%)]"></div>
        
        {/* Ashoka Emblem Decorative Accent (Bihar Government style logo pairing) */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden md:block select-none">
          <Building className="w-48 h-48 text-indigo-200" />
        </div>

        <div className="relative max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 dark:bg-slate-900/60 backdrop-blur-md rounded-full text-3xs font-black uppercase tracking-widest text-indigo-300 border border-white/5 select-none animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>{getTranslation(lang, 'govtHeader')}</span>
          </div>

          <h2 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">
            {lang === 'en' ? `Welcome back, ${username}!` : `स्वागत है, ${username}!`}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            {lang === 'en' 
              ? 'Consolidated operational command center for BMSICL equipment procurement pipelines. Monitor milestones, track agreements, and schedule committee proceedings.'
              : 'निविदा मील के पत्थर, अनुबंधित एमओयू और टीईसी बैठकों की निगरानी के लिए एकीकृत परिचालन केंद्र।'}
          </p>

          <div className="pt-2 flex flex-wrap gap-3 text-3xs font-mono font-semibold text-slate-300">
            <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md border border-white/5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>{new Date().toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}</span>
            </span>
            <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md border border-white/5">
              <Briefcase className="w-3.5 h-3.5 text-sky-400" />
              <span>{totalTenders} Active Equipment Ledger Entries</span>
            </span>
          </div>
        </div>
      </div>

      {/* Modern Instant Search Hub Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-4.5 rounded-3xl shadow-sm space-y-2 no-print">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xs font-extrabold text-indigo-650 dark:text-indigo-400 uppercase tracking-widest">
              {lang === 'en' ? 'TENDER RESEARCH LEDGER' : 'खोज एवं अनुसन्धान केंद्र'}
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">
              {lang === 'en' ? 'Type to lookup and analyze tenders instantly across all fields in real-time.' : 'वास्तविक समय में सभी क्षेत्रों में निविदाओं को तुरंत खोजने के लिए टाइप करें।'}
            </p>
          </div>
        </div>
        <InstantSearchBar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          tenders={tenders}
          lang={lang}
          onSelectTender={onSelectTender}
        />
      </div>

      {/* Grid of the 8 Interactive KPI Cards */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {lang === 'en' ? 'Consolidated Procurement Metrics' : 'निविदा प्रगति संकेतक'}
            </h3>
            <p className="text-3xs text-slate-400">
              {lang === 'en' ? 'Click on any indicator below to filter and edit live spreadsheet details immediately.' : 'विस्तृत स्प्रेडशीट देखने या संपादन के लिए किसी भी संकेतक पर क्लिक करें।'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            const title = lang === 'en' ? card.titleEn : card.titleHi;
            const desc = lang === 'en' ? card.descEn : card.descHi;
            
            return (
              <button
                key={card.id}
                onClick={() => onNavigateToTenders(card.id)}
                className={`flex flex-col text-left group bg-white dark:bg-slate-900 p-5 rounded-2xl border ${card.borderColor} ${card.lightBg} shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden relative`}
              >
                {/* Visual hover background flare */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 rounded-full blur-xl transition-opacity duration-300`}></div>

                <div className="flex justify-between items-start">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  {/* Subtle navigation indicator */}
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-600 inline-flex items-center gap-0.5 transition-colors">
                    <span>GO</span>
                    <ArrowRight className="w-3 h-3 transform group-hover:translate-x-1 duration-200" />
                  </span>
                </div>

                <div className="mt-4 flex-1">
                  <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-205 group-hover:text-indigo-600/90 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                    {title}
                  </h4>
                  <p className="text-4xs text-slate-400 dark:text-slate-500 mt-1 uppercase font-black tracking-wider leading-relaxed">
                    {desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 flex items-baseline justify-between">
                  <span className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                    {card.count}
                  </span>
                  <span className="text-5xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest">
                    RJ95 Govt
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pipeline Status Flow & Action Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pipeline Analytics Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
              <span>Overall Procurement Milestone Pipe</span>
            </h4>
            <span className="text-4xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-md border border-indigo-150/40">
              REAL-TIME COUNTS (MAPPED)
            </span>
          </div>

          <div className="space-y-4 pt-1">
            {pipelineStages.map((stage, idx) => {
              const pct = totalTenders > 0 ? (stage.count / totalTenders) * 100 : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-2xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{stage.label}</span>
                    <span className="text-slate-505 dark:text-slate-450 text-slate-550">
                      <strong>{stage.count}</strong> <span className="text-4xs text-slate-400">/ {totalTenders} Items</span>
                    </span>
                  </div>
                  <div className="relative w-full h-3 rounded-full bg-slate-100 dark:bg-slate-850 border border-slate-200/40 overflow-hidden">
                    <div 
                      className={`h-full ${stage.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${pct}%` }}
                    ></div>
                    {/* Tiny percentage text inside container */}
                    <span className="absolute right-2 top-0 text-[8px] font-black font-mono text-slate-500/80">
                      {Math.round(pct)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850 mt-4 text-[11px] text-slate-500 dark:text-slate-450 flex items-start gap-2 select-none">
            <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Tip:</strong> The pipeline calculates progress of equipment purchases sequentially from preliminary Pre-Bid meetings up to signed and implemented supply agreements. Re-tendered equipment is excluded from ongoing Active count.
            </p>
          </div>
        </div>

        {/* Recent Status Updates Activity Stream */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span>Recent Operational Status updates</span>
            </h4>
            <span className="text-5xs text-slate-400 uppercase font-bold">LEDGER UPDATES</span>
          </div>

          <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-850 overflow-y-auto max-h-[320px] pr-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
            {recentUpdates.map((update, idx) => (
              <div key={idx} className="py-3 last:pb-0 font-sans space-y-1.5 hover:bg-slate-50/50 dark:hover:bg-slate-950/10 px-1 transition-colors rounded-lg">
                <div className="flex justify-between items-start gap-2 text-2xs">
                  <div className="min-w-0">
                    <span className="font-mono text-blue-600 dark:text-blue-450 font-bold uppercase tracking-wider px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/40 rounded border border-blue-100 dark:border-blue-900/10 mr-1.5">
                      {update.tenderNo}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {update.equipment}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-400 shrink-0 text-3xs font-mono uppercase bg-slate-100 dark:bg-slate-850 px-1.5 py-0.5 rounded">
                    👨‍💼 {update.manager}
                  </span>
                </div>
                
                <p className="text-3xs text-slate-500 dark:text-slate-400 italic line-clamp-2 pl-3 border-l-2 border-indigo-400 bg-slate-50/50 dark:bg-slate-950/20 p-1 rounded-r">
                  "{update.status}"
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
