/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BarChart3, PieChart, Activity, UserCheck, CheckCircle2, Milestone, Layers, Award } from 'lucide-react';
import { Tender, Language } from '../types';

interface ReportsSubpageProps {
  tenders: Tender[];
  lang: Language;
}

export default function ReportsSubpage({ tenders, lang }: ReportsSubpageProps) {
  
  // 1. Compute Department counts
  const depts = tenders.reduce((acc: Record<string, number>, curr) => {
    const dept = curr.department || 'Other';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  const maxDeptVal = Math.max(...Object.values(depts), 1);

  // 2. Compute Manager assignments
  const managers = tenders.reduce((acc: Record<string, number>, curr) => {
    const mgr = curr.manager || 'Girish';
    acc[mgr] = (acc[mgr] || 0) + 1;
    return acc;
  }, {});

  const maxMgrVal = Math.max(...Object.values(managers), 1);

  // 3. Bidder Distribution statistics
  const bidderRanges = {
    'Single Bidder (1)': tenders.filter(t => t.noOfBidders === 1).length,
    'Few Bidders (2)': tenders.filter(t => t.noOfBidders === 2).length,
    'Competitive Bids (3-5)': tenders.filter(t => t.noOfBidders >= 3 && t.noOfBidders <= 5).length,
    'Massive Bids (> 5)': tenders.filter(t => t.noOfBidders > 5).length,
  };

  const totalBidsForRange = tenders.length || 1;

  // 4. Milestone Stage Status calculations
  const completeStages = {
    'Pre-Bid Meeting': tenders.filter(t => t.preBidMeeting.toLowerCase().includes('complete')).length,
    'TSC Discussions': tenders.filter(t => t.tscMeeting.toLowerCase().includes('complete')).length,
    'Technical opening': tenders.filter(t => t.technicalOpening.toLowerCase().includes('complete') || t.technicalOpening.toLowerCase().includes('open')).length,
    'TEC Evaluation': tenders.filter(t => t.tecMeeting.toLowerCase().includes('complete')).length,
    'Demo trials': tenders.filter(t => t.demoMeeting.toLowerCase().includes('complete')).length,
    'Award Approved': tenders.filter(t => t.awardOfContract.toLowerCase().includes('complete') || t.awardOfContract.toLowerCase().includes('approved') || t.awardOfContract.toLowerCase().includes('award')).length,
    'MOUs Signed': tenders.filter(t => t.agreement.toLowerCase().includes('signed') || t.agreement.toLowerCase().includes('complete')).length,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 sm:p-2 animate-fadeIn select-none">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-50 uppercase tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-500" />
            <span>{lang === 'en' ? 'BMSICL Procurement Analytics Report' : 'परिचालन विश्लेषण तथा विवरणी'}</span>
          </h2>
          <p className="text-3xs text-slate-500">
            {lang === 'en' ? 'Comprehensive graphs tracking milestone completions, bidder competitiveness, and manager performance data.' : 'निविदा मील का पत्थर पूरा होने, बोलीदाता कॉम्पिटिटिवनेस और प्रबंधकीय कार्यक्षमता के विस्तृत ग्राफिक्स।'}
          </p>
        </div>
      </div>

      {/* Grid: Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Chart 1: Milestone Stage Analysis (SVG Visual representation) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-sm flex flex-col">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-850 mb-4 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-500" />
              <span>Milestone Success Yield</span>
            </h3>
            <span className="text-[9px] font-mono font-bold bg-violet-50 dark:bg-violet-950/30 text-violet-600 px-2 py-0.5 rounded">
              PIPELINE SUCCESS RATE
            </span>
          </div>

          <div className="flex-1 space-y-3 pt-1">
            {Object.entries(completeStages).map(([stage, count]) => {
              const percentage = tenders.length > 0 ? (count / tenders.length) * 100 : 0;
              return (
                <div key={stage} className="space-y-1">
                  <div className="flex justify-between items-center text-2xs font-bold text-slate-700 dark:text-slate-350">
                    <span>{stage}</span>
                    <span className="font-mono text-slate-505 dark:text-slate-400">
                      {count} <span className="text-3xs font-normal text-slate-400">/ {tenders.length} ({Math.round(percentage)}%)</span>
                    </span>
                  </div>

                  {/* Horizontal Bar Graphic */}
                  <div className="w-full h-4 bg-slate-100 dark:bg-slate-850 border border-slate-200/40 rounded-lg overflow-hidden flex">
                    <div
                      className="bg-gradient-to-r from-violet-500 to-indigo-500 rounded-lg transition-all duration-1000 flex items-center justify-end pr-2 text-[9px] font-mono font-black text-white"
                      style={{ width: `${percentage}%` }}
                    >
                      {percentage > 10 && `${Math.round(percentage)}%`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Bidder Competitiveness Distribution */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-sm flex flex-col">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-850 mb-4 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-amber-500" />
              <span>Bidder Volume distribution</span>
            </h3>
            <span className="text-[9px] font-mono font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-600 px-2 py-0.5 rounded">
              COMPETITIVE ANALYSIS LOG
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-4">
            {Object.entries(bidderRanges).map(([lbl, count]) => {
              const pct = (count / totalBidsForRange) * 105;
              const actualPct = (count / totalBidsForRange) * 100;
              return (
                <div key={lbl} className="space-y-1.5">
                  <div className="flex justify-between text-2xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        lbl.includes('Single') ? 'bg-rose-500' : lbl.includes('Few') ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}></span>
                      {lbl}
                    </span>
                    <span className="font-mono">{count} Items ({Math.round(actualPct)}%)</span>
                  </div>

                  {/* Dynamic comparison ring filler */}
                  <div className="w-full bg-slate-100 dark:bg-slate-850/60 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        lbl.includes('Single') ? 'bg-gradient-to-r from-red-500 to-rose-500' : lbl.includes('Few') ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      }`}
                      style={{ width: `${actualPct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 3: Department Demands Leaderboard */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-sm flex flex-col">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-850 mb-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-505 text-indigo-500" />
              <span>Department Tender Distribution</span>
            </h3>
          </div>

          <div className="flex-1 space-y-3">
            {Object.entries(depts).map(([dept, count]) => {
              const factorHeight = (count / maxDeptVal) * 100;
              return (
                <div key={dept} className="space-y-1">
                  <div className="flex justify-between text-2xs font-bold">
                    <span className="text-slate-700 dark:text-slate-350 truncate max-w-[280px]">🏢 {dept}</span>
                    <span className="font-mono text-slate-505 dark:text-slate-400">{count} Active Tenders</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-850 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-505 from-blue-500 to-indigo-550 to-indigo-600 rounded-full"
                      style={{ width: `${factorHeight}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 4: Manager Leaderboard */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-sm flex flex-col">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-850 mb-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-500" />
              <span>Procurement Officers Assigned Tenders</span>
            </h3>
          </div>

          <div className="flex-1 space-y-3.5">
            {Object.entries(managers).map(([mgr, count]) => {
              const factorWidth = (count / maxMgrVal) * 100;
              return (
                <div key={mgr} className="space-y-1">
                  <div className="flex justify-between text-2xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300">👨‍💼 Officer {mgr}</span>
                    <span className="font-mono">{count} Items Tracked</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-850 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                      style={{ width: `${factorWidth}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
