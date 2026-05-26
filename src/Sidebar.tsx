/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Grid,
  FileText,
  Package,
  Calendar,
  DollarSign,
  BarChart3,
  Download,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { Language } from '../types';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
  lang: Language;
  username: string;
  role: string;
  onLogout: () => void;
}

export default function Sidebar({
  activeTab,
  onTabChange,
  collapsed,
  setCollapsed,
  lang,
  username,
  role,
  onLogout
}: SidebarProps) {
  
  const menuItems = [
    { id: 'dashboard', labelEn: 'Dashboard', labelHi: 'डैशबोर्ड', icon: Grid, color: 'text-indigo-500' },
    { id: 'tenders', labelEn: 'Tender Management', labelHi: 'निविदा प्रबंधन', icon: FileText, color: 'text-sky-500' },
    { id: 'equipment', labelEn: 'Equipment Details', labelHi: 'उपकरण विवरण', icon: Package, color: 'text-emerald-500' },
    { id: 'meetings', labelEn: 'Meetings', labelHi: 'बैठकें / शेड्यूलर', icon: Calendar, color: 'text-rose-500' },
    { id: 'financial', labelEn: 'Financial Opening', labelHi: 'वित्तीय ओपनिंग', icon: DollarSign, color: 'text-amber-500' },
    { id: 'reports', labelEn: 'Reports & Analytics', labelHi: 'रिपोर्ट्स और आंकड़े', icon: BarChart3, color: 'text-violet-500' },
    { id: 'exports', labelEn: 'Export Center', labelHi: 'निर्यात केंद्र', icon: Download, color: 'text-blue-500' },
    { id: 'settings', labelEn: 'Settings', labelHi: 'सेटिंग्स', icon: Settings, color: 'text-slate-500' },
  ];

  return (
    <aside 
      className={`bg-slate-900 border-r border-slate-800 flex flex-col h-full transition-all duration-300 relative no-print select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Sidebar Header Brand with Collapsible Toggle Button */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-2 overflow-hidden animate-fadeIn">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white flex items-center justify-center font-black shrink-0 text-sm shadow-md">
              BM
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-black text-white tracking-wider leading-none truncate">
                BMSICL
              </h2>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 block truncate">
                Govt Portal
              </span>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white flex items-center justify-center font-black mx-auto shadow-md">
            BM
          </div>
        )}

        {/* Floating Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-5 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 hover:bg-indigo-600 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer shadow-lg z-50 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          const label = lang === 'en' ? item.labelEn : item.labelHi;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative group cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {/* Highlight active strip */}
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1.5 bg-sky-300 rounded-r-full" />
              )}

              <IconComponent 
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-white' : item.color
                }`} 
              />

              {!collapsed && (
                <span className="truncate transition-opacity duration-200 animate-fadeIn">
                  {label}
                </span>
              )}

              {/* Collapsed view tooltip */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2 py-1 bg-slate-950 text-slate-100 rounded-md text-[10px] uppercase font-bold tracking-wider opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50 whitespace-nowrap shadow-xl border border-slate-800">
                  {label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Embedded Minimalist User Persona Info & Secure Logout Trigger */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/45 shrink-0">
        {!collapsed ? (
          <div className="space-y-3 animate-fadeIn">
            {/* User details */}
            <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-800/40 rounded-xl border border-slate-800/50">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-extrabold flex items-center justify-center text-xs border border-indigo-500/20 shrink-0 capitalize">
                {username.substring(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="text-2xs font-extrabold text-slate-200 truncate leading-tight">
                  {username}
                </p>
                <span className="text-[9px] text-sky-450 text-indigo-400 font-bold uppercase tracking-wider block mt-0.5">
                  {role}
                </span>
              </div>
            </div>

            {/* Logout block */}
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white font-bold text-2xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-rose-500/25 active:scale-95 duration-100"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Sign Out' : 'प्रस्थान' }</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            {/* Simple dot badge indicator of user role */}
            <div className="relative group mx-auto w-6 h-6 flex items-center justify-center bg-slate-800 hover:bg-slate-755 rounded-lg border border-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <div className="absolute left-full ml-3 px-2 py-1.5 bg-slate-950 text-slate-100 rounded-md text-[10px] font-mono opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50 whitespace-nowrap border border-slate-800 shadow-xl">
                👤 {username} ({role})
              </div>
            </div>

            {/* Collapsed logout */}
            <button
              onClick={onLogout}
              className="w-8 h-8 mx-auto flex items-center justify-center rounded-lg text-rose-450 hover:bg-rose-500 text-rose-500 hover:text-white transition-all cursor-pointer group relative"
              title={lang === 'en' ? 'Log Out' : 'लॉग आउट'}
            >
              <LogOut className="w-4 h-4" />
              <div className="absolute left-full ml-3 px-2 py-1 bg-slate-950 text-rose-400 rounded-md text-[10px] font-bold uppercase tracking-widest opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50 whitespace-nowrap border border-slate-800 shadow-xl">
                {lang === 'en' ? 'Secure Log Out' : 'सुरक्षित प्रस्थान'}
              </div>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
