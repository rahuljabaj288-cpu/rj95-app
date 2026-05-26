/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, Moon, Sun, Globe, Smartphone, RefreshCw, Cpu, Layers } from 'lucide-react';
import { Language, AppTheme } from '../types';
import { getTranslation } from '../localization';
import DepartmentManagement from './DepartmentManagement';

interface SettingsSubpageProps {
  theme: AppTheme;
  lang: Language;
  onThemeToggle: () => void;
  onLangToggle: () => void;
  isEmulatorMode: boolean;
  setIsEmulatorMode: (val: boolean) => void;
  onRestoreDefaults: () => void;
  tendersCount: number;
  onRenameDepartment: (oldName: string, newName: string) => void;
}

export default function SettingsSubpage({
  theme,
  lang,
  onThemeToggle,
  onLangToggle,
  isEmulatorMode,
  setIsEmulatorMode,
  onRestoreDefaults,
  tendersCount,
  onRenameDepartment
}: SettingsSubpageProps) {
  // Tabs for switching between General Settings and Department Management
  const [activeTab, setActiveTab] = useState<'general' | 'departments'>('general');
  // Refresh dropdown version state to force dropdowns to update on change
  const [refreshVersion, setRefreshVersion] = useState(0);

  const handleRefreshDropdowns = () => {
    setRefreshVersion(prev => prev + 1);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-1 sm:p-2 animate-fadeIn select-none">
      
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-405 text-indigo-500" />
          <div className="text-left">
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-50 uppercase tracking-tight">
              {lang === 'en' ? 'BMSICL Admin & Settings Panel' : 'प्रशासन एवं सेटिंग्स पैनल'}
            </h2>
            <p className="text-3xs text-slate-500">
              {lang === 'en' 
                ? 'Configure operational parameters, visual theme states, and full medical facility departments registries.' 
                : 'सिस्टम सेटिंग्स, दृश्य थीम मोड, और चिकित्सा विभाग सूची प्रबंधित करें।'}
            </p>
          </div>
        </div>
      </div>

      {/* Segmented Tab Row Controls */}
      <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl max-w-md">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'general'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>{lang === 'en' ? 'General' : 'सामान्य सेटिंग्स'}</span>
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'departments'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{lang === 'en' ? 'Departments' : 'विभाग प्रबंधन'}</span>
        </button>
      </div>

      {/* Conditional Rendering based on active section */}
      {activeTab === 'general' ? (
        <div className="space-y-6">
          {/* Main General Settings Container */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-805">
            
            {/* Toggle Language */}
            <div className="p-5 flex items-center justify-between gap-4">
              <div className="space-y-0.5 text-left">
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-105 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-indigo-500" />
                  <span>System Language / भाषा</span>
                </h4>
                <p className="text-3xs text-slate-500 text-left">Toggle operational language between Hindi and English.</p>
              </div>

              <button
                onClick={onLangToggle}
                className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-indigo-650 dark:text-indigo-400 rounded-xl text-xs font-black hover:bg-slate-100 shadow-sm cursor-pointer transition-all uppercase tracking-wider shrink-0"
              >
                {getTranslation(lang, 'langToggle')}
              </button>
            </div>

            {/* Toggle Theme */}
            <div className="p-5 flex items-center justify-between gap-4">
              <div className="space-y-0.5 text-left">
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-105 flex items-center gap-1.5">
                  {theme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                  <span>Visual interface Mode</span>
                </h4>
                <p className="text-3xs text-slate-500 text-left">Choose between a crisp workspace style light canvas or eye-comfort dark styling.</p>
              </div>

              <button
                onClick={onThemeToggle}
                className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 text-slate-600 dark:text-slate-350 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors shadow-sm shrink-0"
                title="Toggle theme style"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
            </div>

            {/* Emulator Toggle */}
            <div className="p-5 flex items-center justify-between gap-4">
              <div className="space-y-0.5 text-left">
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-105 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-sky-502 text-sky-500" />
                  <span>Smartphone layout emulation</span>
                </h4>
                <p className="text-3xs text-slate-500 text-left">Toggle a narrow high-res iPhone/Android preview frame wrapper or expand full widescreen desktop charts.</p>
              </div>

              <button
                onClick={() => setIsEmulatorMode(!isEmulatorMode)}
                className={`px-4 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer shadow-sm uppercase tracking-wider shrink-0 ${
                  isEmulatorMode 
                    ? 'bg-sky-500/10 border-sky-400 text-sky-600 dark:text-sky-400' 
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                }`}
              >
                {isEmulatorMode ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            {/* Restore Defaults */}
            <div className="p-5 flex items-center justify-between gap-4">
              <div className="space-y-0.5 text-left">
                <h4 className="text-xs font-black text-rose-600 flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-rose-500" />
                  <span>Full Database Reset & Sync</span>
                </h4>
                <p className="text-3xs text-slate-500 text-left">Clear all customized changes/additions to local storage and force restore original BMSICL official tender records.</p>
              </div>

              <button
                onClick={() => {
                  if (window.confirm('WARNING: This action is irreversible. It will clear all user-created modifications and sync back to standard official Bihar Govt mock ledger records! Do you want to proceed?')) {
                    onRestoreDefaults();
                  }
                }}
                className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-200/40 hover:border-rose-600 rounded-xl text-xs font-extrabold cursor-pointer transition-all uppercase tracking-wider scale-98 active:scale-95 shadow-sm shrink-0"
              >
                Restore Default Ledger
              </button>
            </div>

          </div>

          {/* System info log */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-500" />
              <span>BMSICL Security & System Parameters</span>
            </h4>

            <div className="grid grid-cols-2 gap-4 text-3xs font-mono font-bold leading-normal text-slate-500 text-left">
              <div className="space-y-1">
                <p>DATABASE SCHEMA VERSION: <span className="text-slate-700 dark:text-slate-350">RJ95-CO_v1.07</span></p>
                <p>COMMUNICATION PORT: <span className="text-slate-600 dark:text-slate-400 font-sans">HTTPS (SANDBOXED)</span></p>
                <p>ACTIVE ROW COUNT: <span className="text-slate-700 dark:text-slate-350">{tendersCount} Tenders</span></p>
              </div>
              <div className="space-y-1">
                <p>STORAGE ALLOCATION: <span className="text-slate-700 dark:text-slate-350">LOCAL STORAGE (SYNCED)</span></p>
                <p>ENCRYPTION STANDARD: <span className="text-emerald-500">SSL ENFORCED (AES-256)</span></p>
                <p>LEGAL AGENCY: <span className="text-indigo-600 dark:text-indigo-400 font-sans uppercase">DEPARTMENT OF HEALTH, PATNA</span></p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Department Management Panel */}
          <DepartmentManagement
            key={refreshVersion}
            lang={lang}
            onRenameDepartment={onRenameDepartment}
            onRefreshDropdowns={handleRefreshDropdowns}
          />
        </div>
      )}

    </div>
  );
}
