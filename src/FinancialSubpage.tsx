/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DollarSign, Coins, HelpCircle, ArrowUpDown, ChevronRight, UserCheck, Milestone } from 'lucide-react';
import { Tender, Language } from '../types';
import InstantSearchBar from './InstantSearchBar';
import HighlightText from './HighlightText';

interface FinancialSubpageProps {
  tenders: Tender[];
  lang: Language;
  onEditTender: (tender: Tender) => void;
  role: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectTender?: (t: Tender) => void;
}

export default function FinancialSubpage({
  tenders,
  lang,
  onEditTender,
  role,
  searchQuery,
  onSearchChange,
  onSelectTender
}: FinancialSubpageProps) {
  const [minBidders, setMinBidders] = useState<string>('all');

  // Compute stats
  const totalFinancialOpened = tenders.filter(t => 
    t.financialOpening.toLowerCase().includes('open') || 
    t.financialOpening.toLowerCase().includes('complete')
  ).length;

  const totalBiddersCount = tenders.reduce((sum, curr) => sum + (curr.noOfBidders || 0), 0);
  const avgBidders = tenders.length > 0 ? (totalBiddersCount / tenders.length).toFixed(1) : '0';

  const singleBidderAlertCount = tenders.filter(t => t.noOfBidders === 1).length;

  const filtered = tenders.filter(t => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || Object.entries(t).some(([key, val]) => {
      if (key === 'id') return false;
      if (val === undefined || val === null) return false;
      return String(val).toLowerCase().includes(q);
    });
    if (!matchSearch) return false;

    if (minBidders === 'single') return t.noOfBidders === 1;
    if (minBidders === 'multiple') return t.noOfBidders > 1;

    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 sm:p-2 animate-fadeIn select-none">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-50 uppercase tracking-tight flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-500 animate-pulse" />
            <span>{lang === 'en' ? 'BMSICL Corporate Financial Portal' : 'वित्तीय स्वीकृत तथा मूल्यांकन केंद्र'}</span>
          </h2>
          <p className="text-3xs text-slate-500">
            {lang === 'en' ? 'Verify bidder counts, commercial rates, commercial bid openings, low-bidder reports, and price justification committee metrics.' : 'बोलीदाताओं की वित्तीय निविदाओं, न्यूनतम दरों (Low Bidders) और मूल्य औचित्य रिपोर्टों की समीक्षा करें।'}
          </p>
        </div>
      </div>

      {/* KPI Row inside Financial */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1: Opened Financial bids */}
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-950/20 dark:to-orange-950/10 p-4 rounded-2xl border border-amber-500/20 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Bids Financially Opened</p>
            <p className="text-xl font-black mt-0.5 text-slate-800 dark:text-slate-100">{totalFinancialOpened} <span className="text-2xs font-normal text-slate-400">/ {tenders.length}</span></p>
          </div>
        </div>

        {/* KPI 2: Average bidders */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/20 dark:to-teal-950/10 p-4 rounded-2xl border border-emerald-500/20 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Avg Bidders Selected</p>
            <p className="text-xl font-black mt-0.5 text-slate-800 dark:text-slate-100">{avgBidders} <span className="text-2xs font-normal text-slate-400">Bidders/Item</span></p>
          </div>
        </div>

        {/* KPI 3: Single Bidder Alerts */}
        <div className="bg-gradient-to-br from-red-500/10 to-rose-500/10 dark:from-red-950/20 dark:to-rose-950/10 p-4 rounded-2xl border border-red-500/20 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 text-white shadow-sm">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Single Bidder Red Alerts</p>
            <p className="text-xl font-black mt-0.5 text-rose-600 dark:text-rose-400">{singleBidderAlertCount} <span className="text-2xs font-normal text-slate-450">Tenders</span></p>
          </div>
        </div>
      </div>

      {/* Inputs Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1">
          <InstantSearchBar
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            tenders={tenders}
            lang={lang}
            onSelectTender={onSelectTender}
            placeholder={lang === 'en' ? 'Search corporate items or tender numbers across all columns...' : 'निविदा या उपकरणों के विवरण खोजें...'}
          />
        </div>

        {/* Bidder Filter Category */}
        <select
          value={minBidders}
          onChange={(e) => setMinBidders(e.target.value)}
          className="px-3.5 py-2 text-xs rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
        >
          <option value="all">{lang === 'en' ? 'All Bidder Conditions' : 'सभी बोलीदाता स्थितियां'}</option>
          <option value="single">{lang === 'en' ? 'Single Bid Condition (Alert)' : 'एकल बोलीदाता स्थिति'}</option>
          <option value="multiple">{lang === 'en' ? 'Multiple Bidders (> 1 Qualified)' : 'बहु-बोलीदाता स्थितियां'}</option>
        </select>
      </div>

      {/* Financial Spreadsheet Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs select-none">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-850 uppercase font-bold text-slate-400 text-3xs tracking-wider">
                <th className="p-4 w-12 text-center text-slate-400">Sl No</th>
                <th className="p-4 min-w-[100px]">Tender No</th>
                <th className="p-4 min-w-[200px]">Equipment Name</th>
                <th className="p-4 text-center">No of Bidders</th>
                <th className="p-4 min-w-[150px]">Bidder Name</th>
                <th className="p-4 min-w-[140px]">Financial Opening</th>
                <th className="p-4 min-w-[160px]">Price Justification</th>
                <th className="p-4 min-w-[140px]">Award of Contract</th>
                {role !== 'Guest' && <th className="p-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {filtered.map((tender) => {
                const isSingle = tender.noOfBidders === 1;
                return (
                  <tr key={tender.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-950/20 ${isSingle ? 'bg-rose-50/5 dark:bg-rose-955/5' : ''}`}>
                    <td className="p-4 text-center font-mono text-slate-400">{tender.slNo}</td>
                    
                    <td className="p-4 font-mono font-semibold text-blue-800 dark:text-blue-400">
                      <HighlightText text={tender.tenderNo} highlight={searchQuery} />
                    </td>
                    
                    <td className="p-4 font-bold text-slate-850 dark:text-slate-100">
                      <div>
                        <span><HighlightText text={tender.equipmentName} highlight={searchQuery} /></span>
                        {isSingle && (
                          <span className="ml-2 inline-block px-1.5 py-0.5 bg-red-105 border border-red-200/40 text-red-650 rounded text-[8px] font-black uppercase tracking-wider animate-pulse">
                            Single Bid
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center justify-center font-mono w-7 h-7 rounded-lg font-black ${
                        tender.noOfBidders > 2 ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' : isSingle ? 'bg-red-50 dark:bg-red-955/30 text-red-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-650'
                      }`}>
                        {tender.noOfBidders}
                      </span>
                    </td>

                    <td className="p-4 font-medium text-slate-600 dark:text-slate-404 max-w-[200px] truncate" title={tender.bidderName}>
                      <HighlightText text={tender.bidderName || 'N/A'} highlight={searchQuery} />
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-3xs font-bold border ${
                        tender.financialOpening.toLowerCase().includes('open')
                          ? 'bg-emerald-50 dark:bg-emerald-955 border-emerald-300/45 text-emerald-700'
                          : 'bg-amber-50 dark:bg-amber-955 border-amber-300/45 text-amber-700'
                      }`}>
                        <HighlightText text={tender.financialOpening} highlight={searchQuery} />
                      </span>
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-3xs font-bold border ${
                        tender.priceJustificationMeeting.toLowerCase().includes('complete')
                          ? 'bg-emerald-50 dark:bg-emerald-955 border-emerald-300/45 text-emerald-700'
                          : 'bg-amber-50 dark:bg-amber-955 border-amber-305 text-amber-700'
                      }`}>
                        <HighlightText text={tender.priceJustificationMeeting} highlight={searchQuery} />
                      </span>
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-3xs font-bold border ${
                        tender.awardOfContract.toLowerCase().includes('recommend') || tender.awardOfContract.toLowerCase().includes('re-tender')
                          ? 'bg-rose-50 dark:bg-rose-955 border-rose-300/45 text-rose-700'
                          : tender.awardOfContract.toLowerCase().includes('award') || tender.awardOfContract.toLowerCase().includes('complete') || tender.awardOfContract.toLowerCase().includes('approv')
                          ? 'bg-emerald-50 dark:bg-emerald-955 border-emerald-305 text-emerald-700'
                          : 'bg-amber-50 dark:bg-amber-955 border-amber-305 text-amber-700'
                      }`}>
                        <HighlightText text={tender.awardOfContract} highlight={searchQuery} />
                      </span>
                    </td>

                    {role !== 'Guest' && (
                      <td className="p-4 text-right">
                        <button
                          onClick={() => onEditTender(tender)}
                          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 dark:bg-indigo-950/25 dark:hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 hover:text-white rounded-lg transition-all font-bold text-3xs uppercase tracking-wider cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>Review Rates</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-slate-450">
            No financial items matched the parameters.
          </div>
        )}
      </div>

    </div>
  );
}
