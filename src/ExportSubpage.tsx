/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  FileDown, 
  Printer, 
  FileText, 
  CloudLightning,
  Sparkles,
  Search,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { Tender, Language } from '../types';
import ExcelImporter from './ExcelImporter';
import GoogleDriveHub from './GoogleDriveHub';

interface ExportSubpageProps {
  tenders: Tender[];
  lang: Language;
  googleUser: any;
  googleToken: string | null;
  onConnectGoogle: () => void;
  onDisconnectGoogle: () => void;
  onImportComplete: (imported: Tender[]) => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
  onExportWord: () => void;
  onPrint: () => void;
  onGenerateConsolidatedGoogleDoc: () => void;
  activeDocLink: string | null;
  isGoogleLoading: boolean;
}

export default function ExportSubpage({
  tenders,
  lang,
  googleUser,
  googleToken,
  onConnectGoogle,
  onDisconnectGoogle,
  onImportComplete,
  onExportExcel,
  onExportPDF,
  onExportWord,
  onPrint,
  onGenerateConsolidatedGoogleDoc,
  activeDocLink,
  isGoogleLoading
}: ExportSubpageProps) {
  
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 sm:p-2 animate-fadeIn select-none">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-50 uppercase tracking-tight flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            <span>{lang === 'en' ? 'BMSICL Document Export Center' : 'दस्तावेज तथा विवरणी निर्यात केंद्र'}</span>
          </h2>
          <p className="text-3xs text-slate-505 dark:text-slate-400">
            {lang === 'en' ? 'Export official spreadsheets, landscape PDF ledgers, Word reports, and connect Google Docs templates securely.' : 'आधिकारिक निविदा रिपोर्टों को एक्सेल, पीडीएफ, वर्ड या गूगल डॉक्स प्रारूप में बदलें।'}
          </p>
        </div>
      </div>

      {/* Grid: Left Column (Manual Exports & Google Docs), Right Column (Google Drive Backup & Excel Importer) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Side: Traditional Download File exports */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-805 pb-3">
              🎯 Native Local File Downloader
            </h3>

            <p className="text-2xs text-slate-500 max-w-md">
              Download fully styled native spreadsheet ledgers, Word registers, and printable high-res landscape PDF reports compiled directly on the client-side.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Excel Spreadsheet (.xlsx) */}
              <button
                type="button"
                onClick={onExportExcel}
                className="p-4 bg-slate-50 dark:bg-slate-950/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-slate-700 dark:text-slate-205 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-850 hover:border-emerald-305 dark:hover:border-emerald-900 rounded-xl transition-all font-bold flex flex-col justify-between h-28 text-left cursor-pointer group"
              >
                <FileSpreadsheet className="w-6 h-6 text-emerald-600 dark:text-emerald-500 group-hover:scale-105 duration-200" />
                <div>
                  <h4 className="text-xs font-black">Export Excel Workbook</h4>
                  <span className="text-[10px] text-slate-400 font-normal leading-normal mt-0.5 block">Download full .xlsx spreadsheet</span>
                </div>
              </button>

              {/* PDF Ledger (.pdf) */}
              <button
                type="button"
                onClick={onExportPDF}
                className="p-4 bg-slate-50 dark:bg-slate-950/60 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-700 dark:text-slate-205 hover:text-rose-600 dark:hover:text-rose-455 border border-slate-200 dark:border-slate-850 hover:border-rose-305 dark:hover:border-rose-900 rounded-xl transition-all font-bold flex flex-col justify-between h-28 text-left cursor-pointer group"
              >
                <FileDown className="w-6 h-6 text-red-650 dark:text-red-500 group-hover:scale-105 duration-200" />
                <div>
                  <h4 className="text-xs font-black">Export PDF Ledger</h4>
                  <span className="text-[10px] text-slate-400 font-normal leading-normal mt-0.5 block">Landscape A4 executive layout</span>
                </div>
              </button>

              {/* Word Registry (.doc) */}
              <button
                type="button"
                onClick={onExportWord}
                className="p-4 bg-slate-50 dark:bg-slate-950/60 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-slate-700 dark:text-slate-205 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-850 hover:border-blue-305 dark:hover:border-blue-900 rounded-xl transition-all font-bold flex flex-col justify-between h-28 text-left cursor-pointer group"
              >
                <FileText className="w-6 h-6 text-blue-650 dark:text-blue-400 group-hover:scale-105 duration-200" />
                <div>
                  <h4 className="text-xs font-black">Word Status Report</h4>
                  <span className="text-[10px] text-slate-400 font-normal leading-normal mt-0.5 block">Editable landscape Word format</span>
                </div>
              </button>

              {/* Print Layout */}
              <button
                type="button"
                onClick={onPrint}
                className="p-4 bg-slate-50 dark:bg-slate-950/60 hover:bg-sky-50 dark:hover:bg-sky-950/20 text-slate-700 dark:text-slate-205 hover:text-sky-600 dark:hover:text-sky-400 border border-slate-200 dark:border-slate-850 hover:border-sky-305 dark:hover:border-sky-900 rounded-xl transition-all font-bold flex flex-col justify-between h-28 text-left cursor-pointer group"
              >
                <Printer className="w-6 h-6 text-sky-650 dark:text-sky-400 group-hover:scale-105 duration-200" />
                <div>
                  <h4 className="text-xs font-black">Print Presentation</h4>
                  <span className="text-[10px] text-slate-400 font-normal leading-normal mt-0.5 block">Formatted print layout</span>
                </div>
              </button>
            </div>
          </div>

          {/* Google Docs Cloud Sync Panel */}
          <div className="bg-gradient-to-br from-indigo-50/15 via-blue-50/10 to-transparent dark:from-slate-900/60 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-blue-400 flex items-center gap-2">
                  <CloudLightning className="w-4 h-4 animate-bounce" />
                  <span>Google Docs Cloud Master templates</span>
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 max-w-sm mt-1 leading-relaxed">
                  Link your government Google account to immediately auto-generate and format dynamic official tables on fresh Google Docs templates.
                </p>
              </div>

              {isGoogleLoading ? (
                <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl text-3xs font-semibold flex items-center gap-1.5 select-none">
                  <span className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                  <span>Connecting...</span>
                </div>
              ) : googleUser ? (
                <div className="flex flex-col items-end gap-1.5">
                  <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg text-4xs font-mono font-bold uppercase tracking-wider border border-emerald-100">
                    Linked
                  </span>
                  <button
                    onClick={onDisconnectGoogle}
                    className="text-4xs font-black text-rose-600 uppercase hover:underline cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={onConnectGoogle}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-3xs uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
                >
                  Link Account
                </button>
              )}
            </div>

            {googleToken ? (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex flex-col gap-3.5 animate-fadeIn">
                <div className="flex items-center gap-3">
                  {googleUser.photoURL && (
                    <img src={googleUser.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-200" referrerPolicy="no-referrer" />
                  )}
                  <div>
                    <h4 className="text-2xs font-bold text-slate-800 dark:text-slate-200 leading-none">{googleUser.displayName || 'Procurement User'}</h4>
                    <span className="text-3xs text-slate-400 font-mono block mt-1">{googleUser.email}</span>
                  </div>
                </div>

                <button
                  onClick={onGenerateConsolidatedGoogleDoc}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold text-2xs uppercase tracking-wider rounded-xl shadow cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Generate Consolidated Master Google Doc Ledger</span>
                </button>

                {activeDocLink && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-150/50 rounded-xl text-center">
                    <a
                      href={activeDocLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-2xs text-emerald-700 dark:text-emerald-450 hover:underline font-extrabold animate-pulse"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Open Live Template in Google Docs ✨</span>
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-105 rounded-xl text-center text-slate-450/80 text-3xs font-semibold uppercase tracking-wider">
                🔒 Sign in to use Cloud Google Docs Integrations
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Backups & Importers */}
        <div className="space-y-6">
          {/* Local Excel Spreadsheet / CSV importer */}
          <ExcelImporter
            onImportComplete={onImportComplete}
            lang={lang}
          />

          {/* Google Drive Hub for JSON cloud database storage */}
          <GoogleDriveHub
            googleUser={googleUser}
            googleToken={googleToken}
            onConnectGoogle={onConnectGoogle}
            onDisconnectGoogle={onDisconnectGoogle}
            tenders={tenders}
            onImportTenders={onImportComplete}
            onUpdateTender={(updatedTender) => {
              const updated = tenders.map(t => t.id === updatedTender.id ? updatedTender : t);
              onImportComplete(updated);
            }}
            lang={lang}
          />
        </div>

      </div>

    </div>
  );
}
