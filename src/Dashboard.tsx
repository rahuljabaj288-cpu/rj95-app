/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Tender, Language } from '../types';
import { getTranslation } from '../localization';
import { Layers, FileCheck, Users, Activity, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface DashboardProps {
  tenders: Tender[];
  lang: Language;
}

export default function Dashboard({ tenders, lang }: DashboardProps) {
  const totalTendersCount = tenders.length;
  
  // Calculate agreements signed
  const agreementsSignedCount = tenders.filter(t => 
    t.agreement.toLowerCase().includes('signed') || 
    t.agreement.toLowerCase().includes('complete')
  ).length;

  // Calculate Average Bidders
  const totalBidders = tenders.reduce((acc, curr) => acc + (curr.noOfBidders || 0), 0);
  const avgBidders = totalTendersCount > 0 ? (totalBidders / totalTendersCount).toFixed(1) : '0';

  // Calculate completed Technical Stages (Tenders that have 'technicalOpening' = 'Opened' or 'Completed')
  const completedOpeningsCount = tenders.filter(t => 
    t.technicalOpening.toLowerCase().includes('opened') || 
    t.technicalOpening.toLowerCase().includes('complete')
  ).length;

  // Calculate stage-by-stage counts to build an interactive progress stream
  const getStageCounts = () => {
    let preBid = 0;
    let tsc = 0;
    let techOpening = 0;
    let tec = 0;
    let demo = 0;
    let award = 0;

    tenders.forEach(t => {
      const pbm = t.preBidMeeting.toLowerCase();
      if (pbm.includes('complete') || pbm.includes('yes')) preBid++;

      const tscM = t.tscMeeting.toLowerCase();
      if (tscM.includes('complete') || tscM.includes('yes')) tsc++;

      const to = t.technicalOpening.toLowerCase();
      if (to.includes('open') || to.includes('complete') || to.includes('yes')) techOpening++;

      const tecM = t.tecMeeting.toLowerCase();
      if (tecM.includes('complete') || tecM.includes('yes')) tec++;

      const dm = t.demoMeeting.toLowerCase();
      if (dm.includes('complete') || dm.includes('yes')) demo++;

      const ac = t.awardOfContract.toLowerCase();
      if (ac.includes('approved') || ac.includes('complete') || ac.includes('award') || ac.includes('yes')) award++;
    });

    return { preBid, tsc, techOpening, tec, demo, award };
  };

  const stages = getStageCounts();

  return (
    <div className="space-y-4">
      {/* Dynamic Summary Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* KPI 1: Total Tenders */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm hover:shadow transition-shadow flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
              {getTranslation(lang, 'totalTenders')}
            </p>
            <p className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50 mt-0.5">
              {totalTendersCount}
            </p>
          </div>
        </div>

        {/* KPI 2: Agreements Signed */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm hover:shadow transition-shadow flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
              {getTranslation(lang, 'agreementsSigned')}
            </p>
            <p className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50 mt-0.5">
              {agreementsSignedCount} <span className="text-xs font-normal text-slate-400">/ {totalTendersCount}</span>
            </p>
          </div>
        </div>

        {/* KPI 3: Pre-Bid / Openings Completed */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm hover:shadow transition-shadow flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
              {getTranslation(lang, 'stagesCompleted')}
            </p>
            <p className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50 mt-0.5">
              {completedOpeningsCount}
            </p>
          </div>
        </div>

        {/* KPI 4: Bidder stats */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm hover:shadow transition-shadow flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
              {getTranslation(lang, 'averageBidders')}
            </p>
            <p className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50 mt-0.5">
              {avgBidders}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Progress Dashboard Bar Stream */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-blue-500" />
          <span>Stage Completion Pipeline Metrics</span>
        </h4>
        
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {[
            { label: getTranslation(lang, 'preBidMeeting'), count: stages.preBid, color: 'bg-blue-500' },
            { label: getTranslation(lang, 'tscMeeting'), count: stages.tsc, color: 'bg-cyan-500' },
            { label: getTranslation(lang, 'technicalOpening'), count: stages.techOpening, color: 'bg-sky-500' },
            { label: getTranslation(lang, 'tecMeeting'), count: stages.tec, color: 'bg-indigo-500' },
            { label: getTranslation(lang, 'demoMeeting'), count: stages.demo, color: 'bg-purple-500' },
            { label: getTranslation(lang, 'awardOfContract'), count: stages.award, color: 'bg-emerald-500' },
          ].map((stage, idx) => {
            const pct = totalTendersCount > 0 ? (stage.count / totalTendersCount) * 100 : 0;
            return (
              <div key={idx} className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-medium text-slate-505 text-slate-500 dark:text-slate-400 block leading-tight truncate">
                    {stage.label}
                  </span>
                  <span className="text-sm font-bold block mt-1">
                    {stage.count} <span className="text-2xs font-normal text-slate-400">/ {totalTendersCount}</span>
                  </span>
                </div>
                
                {/* Micro Progress Indicator */}
                <div className="mt-2 text-2xs flex items-center justify-between">
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full ${stage.color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 ml-1.5 shrink-0">{Math.round(pct)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
