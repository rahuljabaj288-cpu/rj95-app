/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Wifi, Signal, Battery, Clock, HelpCircle } from 'lucide-react';
import { Language, AppTheme } from '../types';
import { getTranslation } from '../localization';

interface AndroidFrameProps {
  children: React.ReactNode;
  theme: AppTheme;
  lang: Language;
  onThemeToggle: () => void;
  onLangToggle: () => void;
  isEmulatorMode: boolean;
  setIsEmulatorMode: (val: boolean) => void;
}

export default function AndroidFrame({
  children,
  theme,
  lang,
  onThemeToggle,
  onLangToggle,
  isEmulatorMode,
  setIsEmulatorMode,
}: AndroidFrameProps) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      setTime(`${hours}:${minutes} UTC`);
    };
    updateTime();
    const timer = setInterval(updateTime, 15000);
    return () => clearInterval(timer);
  }, []);

  if (!isEmulatorMode) {
    // Desktop Fullscreen view
    return (
      <div className="min-h-screen flex flex-col transition-colors duration-300">
        {/* Toggle Panel */}
        <div className="bg-slate-900 text-slate-100 px-6 py-2 flex items-center justify-between text-xs border-b border-slate-800 shrink-0 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono tracking-wider font-semibold">BMSICL PORTAL ACTIVE</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsEmulatorMode(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-md transition-all font-medium cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{getTranslation(lang, 'mobileEmul')}</span>
            </button>
          </div>
        </div>
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-auto">
          {children}
        </div>
      </div>
    );
  }

  // Dual or phone-centered mobile emulation screen
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 transition-colors duration-300 overflow-y-auto selection:bg-teal-500 selection:text-white">
      
      {/* Dynamic top control panel and statistics for desktop inspect */}
      <div className="w-full max-w-4xl mb-4 flex flex-col md:flex-row items-center justify-between gap-3 text-slate-300 text-xs px-2">
        <div className="flex flex-col items-center md:items-start">
          <h2 className="font-semibold text-white tracking-wide text-sm flex items-center gap-2">
            <span className="text-emerald-400">●</span> {getTranslation(lang, 'appTitle')}
          </h2>
          <p className="text-slate-400 text-2xs mt-0.5">{getTranslation(lang, 'govtHeader')}</p>
        </div>
        
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsEmulatorMode(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-100 hover:text-white rounded-lg transition-all font-medium cursor-pointer border border-slate-700"
          >
            <Monitor className="w-4 h-4 text-sky-400" />
            <span>{getTranslation(lang, 'fullWidthView')}</span>
          </button>
          
          <button
            onClick={onLangToggle}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-emerald-400 rounded-lg font-bold border border-slate-700"
          >
            {getTranslation(lang, 'langToggle')}
          </button>
        </div>
      </div>

      {/* Modern High-Fidelity Android Smartphone Frame wrapper */}
      <div className="relative w-full max-w-[430px] h-[880px] rounded-[52px] border-8 border-slate-800 bg-slate-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden transition-all duration-300 ring-1 ring-white/10 shrink-0">
        
        {/* Dynamic Notch / Camera Island */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-3xl z-40 flex items-center justify-center pointer-events-none">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800"></span>
          <span className="ml-1.5 w-8 h-1 bg-slate-900 rounded-full"></span>
        </div>

        {/* Emulated Android System Status Bar */}
        <div className={`h-11 ${theme === 'dark' ? 'bg-slate-950 text-slate-300' : 'bg-slate-100 text-slate-700'} px-8 flex items-end justify-between select-none shrink-0 pb-1.5 text-xs font-mono font-medium z-30 transition-colors duration-300 border-b border-transparent`}>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 inline mr-0.5" />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5">
              <Battery className="w-4 h-4 rotate-0 inline" />
              <span className="text-[10px]">95%</span>
            </div>
          </div>
        </div>

        {/* Live Scrollable Inside Viewport */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          {children}
        </div>

        {/* Bottom Android Universal Jet Navigation Gesture Bar */}
        <div className={`h-8 ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'} w-full flex items-center justify-center pb-2 pt-1 shrink-0 select-none z-30 transition-colors duration-300`}>
          <div className="w-32 h-1 bg-slate-400/80 rounded-full"></div>
        </div>
      </div>
      
      {/* Small informative advice on emulator state */}
      <div className="mt-3 text-2xs text-slate-500 max-w-sm text-center font-mono leading-relaxed">
        * Tip: Switch to <b>{getTranslation(lang, 'fullWidthView')}</b> to see all 16 BMSICL Tender status columns side-by-side inside wide workspace tables.
      </div>
    </div>
  );
}
