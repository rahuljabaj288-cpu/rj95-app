/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  LogOut,
  Plus,
  Search,
  Download,
  Printer,
  FileDown,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  Smartphone,
  CheckSquare,
  HelpCircle,
  Users,
  Grid,
  Filter,
  FileSpreadsheet,
  FileText
} from 'lucide-react';

import { Tender, Language, AppTheme, UserSession } from './types';
import { initialTenders } from './data/tenders';
import { getTranslation } from './localization';
import { exportToExcel, exportToPDF, exportToWord } from './utils/exportUtils';
import AndroidFrame from './components/AndroidFrame';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import TenderTable from './components/TenderTable';
import TenderCardView from './components/TenderCardView';
import TenderModal from './components/TenderModal';
import ExcelImporter from './components/ExcelImporter';
import GoogleDriveHub from './components/GoogleDriveHub';
import GoogleCalendarHub from './components/GoogleCalendarHub';
import StatusLegend from './components/StatusLegend';

// Import New Modular Dashboard Subpages
import Sidebar from './components/Sidebar';
import DashboardSubpage from './components/DashboardSubpage';
import EquipmentSubpage from './components/EquipmentSubpage';
import MeetingsSubpage from './components/MeetingsSubpage';
import FinancialSubpage from './components/FinancialSubpage';
import ReportsSubpage from './components/ReportsSubpage';
import ExportSubpage from './components/ExportSubpage';
import SettingsSubpage from './components/SettingsSubpage';

// Google Workspace & Docs Integration Utilities
import {
  initAuth as initGoogleAuth,
  googleSignIn,
  logoutGoogle
} from './utils/googleAuth';
import {
  createTenderGoogleDoc,
  createFullTendersSummaryGoogleDoc
} from './utils/googleDocs';

export default function App() {
  // Theme & Language
  const [theme, setTheme] = useState<AppTheme>(() => {
    return (localStorage.getItem('rj95_theme') as AppTheme) || 'light';
  });
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('rj95_lang') as Language) || 'en';
  });

  // Emulator Mode State (defaults to false for professional desktop layouts, can toggle to true for mobile frame testing)
  const [isEmulatorMode, setIsEmulatorMode] = useState<boolean>(false);

  // Active Sidebar Navigation Tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Authentication
  const [session, setSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('rj95_session');
    return saved ? JSON.parse(saved) : null;
  });

  // Google OAuth & Docs Integration State
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [activeDocLink, setActiveDocLink] = useState<string | null>(null);

  // Tenders State
  const [tenders, setTenders] = useState<Tender[]>(() => {
    const saved = localStorage.getItem('bmsicl_tenders_consolidated_db_v1');
    return saved ? JSON.parse(saved) : initialTenders;
  });

  // Filtering and Searching
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all'); // 'all' | 'active_agreements' | 'upcoming_stages'

  // Modals and notifications
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [alert, setAlert] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Side Navigation Drawer for Mobile Layout
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('rj95_theme', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('rj95_lang', lang);
  }, [lang]);

  useEffect(() => {
    if (session) {
      localStorage.setItem('rj95_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('rj95_session');
    }
  }, [session]);

  const saveTendersToDb = (newTenders: Tender[]) => {
    setTenders(newTenders);
    localStorage.setItem('bmsicl_tenders_consolidated_db_v1', JSON.stringify(newTenders));
    showAlert(getTranslation(lang, 'successSave'), 'success');
  };

  const showAlert = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setAlert({ text, type });
    setTimeout(() => setAlert(null), 4000);
  };

  // Switch Theme & Language
  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  const toggleLanguage = () => setLang(prev => (prev === 'en' ? 'hi' : 'en'));

  // Authentication handler
  const handleLogin = (newSession: UserSession) => {
    setSession(newSession);
    showAlert(`Welcome, ${newSession.username}! Role: ${newSession.role}`, 'success');
  };

  const handleLogout = () => {
    setSession(null);
    showAlert('Signed out successfully.', 'info');
  };

  // Synchronize Google Auth session state at startup
  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const handleConnectGoogle = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setGoogleToken(result.accessToken);
        showAlert(`Successfully connected Google Account: ${result.user.email}`, 'success');
      }
    } catch (err: any) {
      console.error('Google Connect Error:', err);
      showAlert('Google sign-in flow failed. Please allow popups for authentication.', 'error');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    try {
      await logoutGoogle();
      setGoogleUser(null);
      setGoogleToken(null);
      setActiveDocLink(null);
      showAlert('Disconnected from Google successfully.', 'info');
    } catch (err) {
      console.error('Google Sign-Out Error:', err);
    }
  };

  const handleExportIndividualToGoogleDoc = async (tender: Tender) => {
    if (!googleToken) {
      showAlert('Please connect your Google Account first to use Google Docs features!', 'error');
      return;
    }
    
    setIsGoogleLoading(true);
    try {
      showAlert(`Creating Google Doc for: ${tender.tenderNo}...`, 'info');
      const docId = await createTenderGoogleDoc(tender, googleToken);
      const docUrl = `https://docs.google.com/document/d/${docId}/edit`;
      setActiveDocLink(docUrl);
      showAlert(`Google Doc created for ${tender.tenderNo}!`, 'success');
    } catch (err: any) {
      console.error('Create Doc Error:', err);
      showAlert(`Failed to create Google Doc: ${err.message || err}`, 'error');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleExportAllToGoogleDoc = async () => {
    if (!googleToken) {
      showAlert('Please connect your Google Account first!', 'error');
      return;
    }

    setIsGoogleLoading(true);
    try {
      showAlert('Creating Consolidated Google Doc summary of all tenders...', 'info');
      const docId = await createFullTendersSummaryGoogleDoc(tenders, googleToken);
      const docUrl = `https://docs.google.com/document/d/${docId}/edit`;
      setActiveDocLink(docUrl);
      showAlert('Consolidated Google Doc ledger created successfully!', 'success');
    } catch (err: any) {
      console.error('Create Full Doc Error:', err);
      showAlert(`Failed to compile master summary: ${err.message || err}`, 'error');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Add/Edit Row Actions
  const handleAddNewTenderClick = () => {
    if (session?.role === 'Guest') {
      showAlert('Guest Users do not have permission to add rows. Please log in as admin.', 'error');
      return;
    }
    setSelectedTender(null); // Null means Add New
    setIsModalOpen(true);
  };

  const handleEditTenderClick = (tender: Tender) => {
    if (session?.role === 'Guest') {
      showAlert('Guest Users do not have permission to edit records. Please log in as admin.', 'error');
      return;
    }
    setSelectedTender(tender);
    setIsModalOpen(true);
  };

  const handleSaveTender = (savedTender: Tender) => {
    const exists = tenders.some(t => t.id === savedTender.id);
    let updated: Tender[];

    if (exists) {
      updated = tenders.map(t => (t.id === savedTender.id ? savedTender : t));
    } else {
      updated = [savedTender, ...tenders];
    }

    saveTendersToDb(updated);
    setIsModalOpen(false);
  };

  const handleDeleteTender = (id: string) => {
    if (session?.role === 'Guest') {
      showAlert('Guest Users do not have permission to delete records.', 'error');
      return;
    }

    const confirmText = getTranslation(lang, 'confirmDelete');
    if (window.confirm(confirmText)) {
      const updated = tenders.filter(t => t.id !== id);
      saveTendersToDb(updated);
      showAlert(getTranslation(lang, 'successDelete'), 'success');
    }
  };

  // Quick inline input editor helper
  const handleInlineUpdateField = (id: string, field: keyof Tender, value: any) => {
    if (session?.role === 'Guest') {
      return; // Silently block edits for guest
    }
    const updated = tenders.map(t => {
      if (t.id === id) {
        return { ...t, [field]: value };
      }
      return t;
    });
    setTenders(updated);
    localStorage.setItem('bmsicl_tenders_consolidated_db_v1', JSON.stringify(updated));
  };

  const handleRenameDepartment = (oldName: string, newName: string) => {
    const updated = tenders.map(t => {
      if (t.department && t.department.trim().toLowerCase() === oldName.trim().toLowerCase()) {
        return { ...t, department: newName };
      }
      return t;
    });
    setTenders(updated);
    localStorage.setItem('bmsicl_tenders_consolidated_db_v1', JSON.stringify(updated));
    showAlert(`Successfully renamed department everywhere from "${oldName}" to "${newName}"`, 'success');
  };

  const handleRestoreDefaults = () => {
    localStorage.removeItem('bmsicl_tenders_consolidated_db_v1');
    setTenders(initialTenders);
    showAlert('Lead Database reset to official government listings completed.', 'success');
  };

  // EXPORTS
  const handleExportExcel = () => {
    try {
      exportToExcel(tenders, lang);
      showAlert('Excel Spreadsheet (.xlsx) downloaded successfully.', 'success');
    } catch (err) {
      console.error('Excel Export Error:', err);
      showAlert('Failed to export to Excel worksheet.', 'error');
    }
  };

  const handleExportPDF = () => {
    try {
      exportToPDF(tenders, lang);
      showAlert('Official PDF Ledger (.pdf) downloaded successfully.', 'success');
    } catch (err) {
      console.error('PDF Export Error:', err);
      showAlert('Failed to export PDF status document.', 'error');
    }
  };

  const handleExportWord = () => {
    try {
      exportToWord(tenders, lang);
      showAlert('Official Word Registry (.doc) downloaded successfully.', 'success');
    } catch (err) {
      console.error('Word Export Error:', err);
      showAlert('Failed to export Word report.', 'error');
    }
  };

  const handlePrint = () => {
    showAlert('Preparing print-friendly presentation...', 'info');
    setTimeout(() => {
      window.print();
    }, 450);
  };

  // Master unified filtration engine supporting all dashboard categories
  const processedTenders = tenders.filter(t => {
    const matchSearch =
      t.tenderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.bidderName && t.bidderName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.statusText && t.statusText.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchSearch) return false;

    if (stageFilter === 'all') return true;
    
    if (stageFilter === 'active' || stageFilter === 'active_agreements') {
      const agL = t.agreement.toLowerCase().trim();
      const acL = t.awardOfContract.toLowerCase().trim();
      return !agL.includes('signed') && !agL.includes('complete') && !acL.includes('re-tender');
    }

    if (stageFilter === 'upcoming_stages') {
      return t.preBidMeeting.toLowerCase().includes('schedule') || t.tscMeeting.toLowerCase().includes('pending');
    }

    if (stageFilter === 'technicalOpening') {
      const to = t.technicalOpening.toLowerCase();
      return to.includes('open') || to.includes('complete') || to.includes('yes');
    }

    if (stageFilter === 'tecMeeting') {
      const tec = t.tecMeeting.toLowerCase();
      return tec.includes('complete') || tec.includes('schedule') || tec.includes('yes');
    }

    if (stageFilter === 'demoMeeting') {
      const demo = t.demoMeeting.toLowerCase();
      return demo.includes('complete') || demo.includes('schedule') || demo.includes('yes');
    }

    if (stageFilter === 'financialOpening') {
      const fin = t.financialOpening.toLowerCase();
      return fin.includes('open') || fin.includes('complete') || fin.includes('yes');
    }

    if (stageFilter === 'awardOfContract') {
      const award = t.awardOfContract.toLowerCase();
      return award.includes('approved') || award.includes('complete') || award.includes('award') || award.includes('yes');
    }

    if (stageFilter === 'agreement') {
      const ag = t.agreement.toLowerCase();
      return ag.includes('signed') || ag.includes('complete') || ag.includes('yes');
    }

    return true;
  });

  // Login view fallback
  if (!session?.isLoggedIn) {
    return (
      <AndroidFrame
        theme={theme}
        lang={lang}
        onThemeToggle={toggleTheme}
        onLangToggle={toggleLanguage}
        isEmulatorMode={isEmulatorMode}
        setIsEmulatorMode={setIsEmulatorMode}
      >
        <LoginScreen
          theme={theme}
          lang={lang}
          onLoginSuccess={handleLogin}
          onLanguageToggle={toggleLanguage}
        />
      </AndroidFrame>
    );
  }

  return (
    <AndroidFrame
      theme={theme}
      lang={lang}
      onThemeToggle={toggleTheme}
      onLangToggle={toggleLanguage}
      isEmulatorMode={isEmulatorMode}
      setIsEmulatorMode={setIsEmulatorMode}
    >
      <div className="flex-1 flex h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden relative">
        
        {/* Collapsible Sidebar Navigation Panel */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          collapsed={isSidebarCollapsed}
          setCollapsed={setIsSidebarCollapsed}
          lang={lang}
          username={session.username}
          role={session.role}
          onLogout={handleLogout}
        />

        {/* Right Content Panel wrapper */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Top Operational Navigation bar of the actual App */}
        <header className="px-5 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-150 dark:border-slate-855 shrink-0 select-none flex items-center justify-between shadow-sm z-10">
          
          <div className="flex items-center gap-3">
            <span className="text-3xs font-black uppercase tracking-wider px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-150/40 text-indigo-755 dark:text-indigo-400">
              {activeTab}
            </span>
            <div className="hidden sm:block">
              <h1 className="text-xs font-black tracking-tight leading-none text-slate-900 dark:text-slate-100">
                {getTranslation(lang, 'appTitle')}
              </h1>
              <p className="text-[10px] text-slate-400 font-medium leading-normal mt-0.5">
                {getTranslation(lang, 'subTitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4.5">
            
            {/* User profile card status */}
            <div className="hidden md:flex items-center gap-2.5 border-r border-slate-150 dark:border-slate-805 pr-4.5">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs select-none shadow-sm uppercase">
                {session.username?.slice(0, 2) || 'AD'}
              </div>
              <div className="text-left leading-none space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-3xs font-black text-slate-705 dark:text-slate-350">{session.username}</span>
                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 rounded cursor-default select-none">
                    {session.role}
                  </span>
                </div>
                <span className="text-4xs text-slate-400 font-mono block font-bold">Bihar Govt RJ95 Admin</span>
              </div>
            </div>

            {/* Offline/Online latency status sync badge */}
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-150/45 dark:border-emerald-900/40 flex items-center gap-1 shrink-0">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="hidden sm:inline">{getTranslation(lang, 'offlineBadge')}</span>
            </div>
          </div>

        </header>

        {/* Temporary Snackbar Alerts alerts */}
        {alert && (
          <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xl border flex items-center gap-2 animate-fadeIn ${alert.type === 'error' ? 'bg-red-50 dark:bg-red-950 text-red-600 border-red-350' : alert.type === 'info' ? 'bg-sky-50 dark:bg-sky-950 text-sky-600 border-sky-350' : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-350 border-emerald-350'}`}>
            {alert.type === 'error' ? <AlertCircle className="w-4 h-4 text-red-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            <span>{alert.text}</span>
          </div>
        )}

        {/* Core App Scrolling Subpage Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* 1. Dashboard Home Page View */}
          {activeTab === 'dashboard' && (
            <DashboardSubpage
              tenders={tenders}
              lang={lang}
              username={session.username}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onNavigateToTenders={(filterId) => {
                setActiveTab('tenders');
                setStageFilter(filterId);
              }}
            />
          )}

          {/* 2. Tender Milestone Spreadsheet */}
          {activeTab === 'tenders' && (
            <div className="space-y-4 animate-fadeIn">

          {/* Google Workspace & Docs Integration Panel */}
          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900/40 dark:to-slate-950/40 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 shadow-sm space-y-3 no-print">
            <div className="flex items-start justify-between flex-wrap gap-2.5">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-blue-800 dark:text-blue-400 font-extrabold text-xs tracking-wider uppercase">
                  <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse"></span>
                  <FileText className="w-4 h-4" />
                  <span>Google Docs & Workspace Hub</span>
                </div>
                <p className="text-2xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                  Connect your Google Account to automatically generate, format, and share official Tender Milestone reports with your department or board members on Google Docs.
                </p>
              </div>

              {isGoogleLoading ? (
                <div className="flex items-center gap-2 px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl">
                  <span className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                  <span>Connecting Secure Access...</span>
                </div>
              ) : googleUser ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 rounded-xl text-3xs font-semibold flex items-center gap-1.5">
                    {googleUser.photoURL ? (
                      <img src={googleUser.photoURL} alt="Avatar" className="w-5 h-5 rounded-full" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-3xs">G</span>
                    )}
                    <span className="font-mono text-slate-600 dark:text-slate-400">{googleUser.email}</span>
                  </div>

                  <button
                    onClick={handleDisconnectGoogle}
                    className="px-2.5 py-1.5 text-3xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 dark:hover:bg-rose-950 border border-rose-205 hover:border-rose-600 rounded-lg transition-all cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnectGoogle}
                  className="px-4 py-1.5 text-3xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-sm hover:shadow transition-all font-sans cursor-pointer flex items-center gap-1.5 uppercase tracking-wide"
                >
                  <span className="bg-white px-1 py-0.5 rounded text-[8px] font-black mr-1 text-slate-800">G</span>
                  Connect Google Docs
                </button>
              )}
            </div>

            {/* If Google is connected, show actions */}
            {googleToken && (
              <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/40 flex flex-wrap items-center justify-between gap-3 text-2xs animate-fadeIn">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    onClick={handleExportAllToGoogleDoc}
                    className="px-3.5 py-2 bg-gradient-to-r from-blue-700/10 to-indigo-700/10 hover:from-blue-700/20 hover:to-indigo-700/20 text-indigo-850 dark:text-blue-350 dark:bg-blue-950/30 font-extrabold rounded-lg border border-indigo-200/40 dark:border-blue-900/30 flex items-center gap-1.5 hover:scale-101 cursor-pointer transition-transform"
                    title="Generate a fully consolidated master ledger document of all tenders"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-650" />
                    <span>Generate Consolidated Master Google Doc Ledger</span>
                  </button>
                </div>

                {activeDocLink && (
                  <div className="flex-1 sm:text-right">
                    <a
                      href={activeDocLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/45 hover:bg-emerald-100 border border-emerald-250 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 font-bold rounded-lg animate-pulse hover:underline"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <span>Open Document in Google Docs ✨</span>
                    </a>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Excel / CSV Importer Panel */}
          <ExcelImporter
            onImportComplete={(importedTenders) => saveTendersToDb(importedTenders)}
            lang={lang}
          />

          {/* Google Drive Vault & Cloud Backup System */}
          <GoogleDriveHub
            googleUser={googleUser}
            googleToken={googleToken}
            onConnectGoogle={handleConnectGoogle}
            onDisconnectGoogle={handleDisconnectGoogle}
            tenders={tenders}
            onImportTenders={(importedTenders) => saveTendersToDb(importedTenders)}
            onUpdateTender={(updatedTender) => {
              const updated = tenders.map(t => t.id === updatedTender.id ? updatedTender : t);
              saveTendersToDb(updated);
            }}
            lang={lang}
          />

          {/* Google Calendar Milestone & Meeting Scheduler */}
          <GoogleCalendarHub
            googleUser={googleUser}
            googleToken={googleToken}
            onConnectGoogle={handleConnectGoogle}
            onDisconnectGoogle={handleDisconnectGoogle}
            tenders={tenders}
            onUpdateTender={(updatedTender) => {
              const updated = tenders.map(t => t.id === updatedTender.id ? updatedTender : t);
              saveTendersToDb(updated);
            }}
            lang={lang}
          />

          {/* Quick Actions and Advanced Search Panel */}
          <section className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm space-y-3 no-print select-none">
            <div className="flex flex-col sm:flex-row gap-2.5 justify-between">
              
              {/* Full multi-field Search Bar */}
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  id="tender-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={getTranslation(lang, 'searchPlaceholder')}
                  className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              {/* Filters dropdown triggers */}
              <div className="flex items-center gap-1.5 flex-wrap">
                
                {/* Status Color Code Explanation Tooltip / Legend */}
                <StatusLegend lang={lang} />
                
                {/* Stage Filter */}
                <span className="text-3xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1 mr-1">
                  <Filter className="w-3 h-3 text-blue-500" />
                  Filter
                </span>

                <select
                  id="filter-stages"
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer outline-none focus:ring-1 focus:ring-blue-500/50"
                >
                  <option value="all">{getTranslation(lang, 'allStatus')}</option>
                  <option value="active_agreements">{getTranslation(lang, 'onlyActive')}</option>
                  <option value="upcoming_stages">{getTranslation(lang, 'onlyUpcoming')}</option>
                </select>

                {/* Reset Filters Shortcut */}
                {(searchQuery || stageFilter !== 'all') && (
                  <button
                    onClick={() => { setSearchQuery(''); setStageFilter('all'); }}
                    className="text-2xs font-extrabold text-blue-500 hover:underline cursor-pointer"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>

            {/* Print and CSV export actions row */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-850/50 text-[11px]">
              
              {/* Add row trigger */}
              <button
                onClick={handleAddNewTenderClick}
                className="px-4 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all hover:scale-102 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{getTranslation(lang, 'addTender')}</span>
              </button>

              {/* Document download group buttons with modern colorful styles */}
              <div className="flex flex-wrap items-center gap-1.5">
                
                {/* Excel Spreadsheet (.xlsx) */}
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-755 hover:border-emerald-350 dark:hover:border-emerald-900 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-bold"
                  title="Export entire dataset to fully styled native Excel (.xlsx) file"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
                  <span>Excel (.xlsx)</span>
                </button>

                {/* PDF Report (.pdf) */}
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-slate-755 hover:border-red-350 dark:hover:border-red-900 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-bold"
                  title="Export official high-res landscape PDF report"
                >
                  <FileDown className="w-3.5 h-3.5 text-red-600 dark:text-red-500" />
                  <span>PDF Ledger</span>
                </button>

                {/* Word Registry (.doc/.docx compat) */}
                <button
                  type="button"
                  onClick={handleExportWord}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-755 hover:border-blue-350 dark:hover:border-blue-900 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-bold"
                  title="Export editable Word document in official landscape table format"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Word Registry</span>
                </button>

                {/* Print Layout triggers */}
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/20 text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-450 border border-slate-200 dark:border-slate-755 hover:border-sky-350 dark:hover:border-sky-900 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-bold"
                  title="Prepare print-friendly view and trigger page setup"
                >
                  <Printer className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Print Report</span>
                </button>
              </div>
            </div>
          </section>

          {/* Main Visual Data Presenter (Spreadsheet vs Card view depending on frame widths and responsive state) */}
          <section className="space-y-4">
            {/* If EmulatorMode is active on Desktop, it has strict narrow constraints and CardView is better.
                If EmulatorMode is OFF, we have full desk view where TenderTable fits 100% of the screen.
                We naturally allow responsive view: table on wide desktop view ports and cards on actual mobile view ports for perfection. */}
            <div className="hidden md:block">
              {!isEmulatorMode ? (
                <TenderTable
                  tenders={tenders}
                  lang={lang}
                  onEditTender={handleEditTenderClick}
                  onDeleteTender={handleDeleteTender}
                  onUpdateField={handleInlineUpdateField}
                  searchQuery={searchQuery}
                  stageFilter={stageFilter}
                  googleToken={googleToken}
                  onExportGoogleDoc={handleExportIndividualToGoogleDoc}
                />
              ) : (
                <TenderCardView
                  tenders={tenders}
                  lang={lang}
                  onEditTender={handleEditTenderClick}
                  onDeleteTender={handleDeleteTender}
                  searchQuery={searchQuery}
                  stageFilter={stageFilter}
                  googleToken={googleToken}
                  onExportGoogleDoc={handleExportIndividualToGoogleDoc}
                />
              )}
            </div>
            
            <div className="block md:hidden">
              {/* Force Mobile format cards on narrow layout screens naturally */}
              <TenderCardView
                tenders={tenders}
                lang={lang}
                onEditTender={handleEditTenderClick}
                onDeleteTender={handleDeleteTender}
                searchQuery={searchQuery}
                stageFilter={stageFilter}
                googleToken={googleToken}
                onExportGoogleDoc={handleExportIndividualToGoogleDoc}
              />
            </div>
          </section>

          </div>
          )}

          {/* 3. Machinery Registry View */}
          {activeTab === 'equipment' && (
            <EquipmentSubpage
              tenders={tenders}
              lang={lang}
              onEditTender={handleEditTenderClick}
              role={session.role}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}

          {/* 4. Meetings, Committees and Google Calendars View */}
          {activeTab === 'meetings' && (
            <MeetingsSubpage
              tenders={tenders}
              lang={lang}
              googleUser={googleUser}
              googleToken={googleToken}
              onConnectGoogle={handleConnectGoogle}
              onDisconnectGoogle={handleDisconnectGoogle}
              onUpdateTender={(updated) => {
                const updatedList = tenders.map(t => t.id === updated.id ? updated : t);
                saveTendersToDb(updatedList);
              }}
            />
          )}

          {/* 5. Corporate Financial Openings Evaluator */}
          {activeTab === 'financial' && (
            <FinancialSubpage
              tenders={tenders}
              lang={lang}
              onEditTender={handleEditTenderClick}
              role={session.role}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}

          {/* 6. Professional Analytical Reports & Yield Metrics Chart board */}
          {activeTab === 'reports' && (
            <ReportsSubpage
              tenders={tenders}
              lang={lang}
            />
          )}

          {/* 7. Comprehensive Document Backup & Importer Export Panel */}
          {activeTab === 'exports' && (
            <ExportSubpage
              tenders={tenders}
              lang={lang}
              googleUser={googleUser}
              googleToken={googleToken}
              onConnectGoogle={handleConnectGoogle}
              onDisconnectGoogle={handleDisconnectGoogle}
              onImportComplete={(imported) => saveTendersToDb(imported)}
              onExportExcel={handleExportExcel}
              onExportPDF={handleExportPDF}
              onExportWord={handleExportWord}
              onPrint={handlePrint}
              onGenerateConsolidatedGoogleDoc={handleExportAllToGoogleDoc}
              activeDocLink={activeDocLink}
              isGoogleLoading={isGoogleLoading}
            />
          )}

          {/* 8. Administrative Theme settings, Smartphone emulator switcher */}
          {activeTab === 'settings' && (
            <SettingsSubpage
              theme={theme}
              lang={lang}
              onThemeToggle={toggleTheme}
              onLangToggle={toggleLanguage}
              isEmulatorMode={isEmulatorMode}
              setIsEmulatorMode={setIsEmulatorMode}
              onRestoreDefaults={handleRestoreDefaults}
              tendersCount={tenders.length}
              onRenameDepartment={handleRenameDepartment}
            />
          )}

        </div>

        {/* Tabbed Row Detail Editor Popup */}
        {isModalOpen && (
          <TenderModal
            tender={selectedTender}
            lang={lang}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveTender}
          />
        )}

      </div>
    </div>

      {/* 
        This is our print-only document wrapper that is 100% hidden in the UI but automatically 
        mapped into standard @media print systems. This gives perfect local PDF output.
      */}
      <div id="printable-area" className="p-8 font-sans bg-white text-black" style={{ display: 'none' }}>
        <div className="border-b-4 border-slate-800 pb-4 mb-4 text-center">
          <h1 className="text-lg font-bold uppercase tracking-tight text-black leading-tight">
            BIHAR MEDICAL SERVICES AND INFRASTRUCTURE CORPORATION LIMITED
          </h1>
          <p className="text-xs uppercase font-semibold text-slate-700 mt-1 tracking-wider">
            Department of Health, Government of Bihar
          </p>
          <p className="text-2xs font-mono text-slate-505 text-slate-600 mt-3 border border-slate-200 inline-block px-3 py-1 bg-slate-50 rounded">
            RJ95 EQUIPMENT PROCUREMENT STATUS REPORT - OFFICIAL LEDGER
          </p>
          
          <div className="flex justify-between items-center text-3xs mt-4 text-slate-500 font-mono">
            <span>Generated: {new Date().toISOString()}</span>
            <span>Signed Access: {session.username} ({session.role})</span>
          </div>
        </div>

        {/* Dense print list table */}
        <table className="w-full text-left border-collapse border border-slate-400 text-3xs">
          <thead>
            <tr className="bg-slate-100 font-bold uppercase border-b border-slate-400">
              <th className="p-2 border border-slate-350">Tender No.</th>
              <th className="p-2 border border-slate-350">Equipment</th>
              <th className="p-2 border border-slate-350">Pre-Bid</th>
              <th className="p-2 border border-slate-350">TSC Mt.</th>
              <th className="p-2 border border-slate-350">Tech Open</th>
              <th className="p-2 border border-slate-350">TEC Mt.</th>
              <th className="p-2 border border-slate-350">Demo Mt.</th>
              <th className="p-2 border border-slate-350">Award Of Contract</th>
              <th className="p-2 border border-slate-350">Agreement Status</th>
            </tr>
          </thead>
          <tbody>
            {tenders.map(t => (
              <tr key={t.id} className="border-b border-slate-300">
                <td className="p-2 border border-slate-300 font-mono font-semibold">{t.tenderNo}</td>
                <td className="p-2 border border-slate-300 font-bold">{t.equipmentName}</td>
                <td className="p-2 border border-slate-300">{t.preBidMeeting}</td>
                <td className="p-2 border border-slate-300">{t.tscMeeting}</td>
                <td className="p-2 border border-slate-300">{t.technicalOpening}</td>
                <td className="p-2 border border-slate-300">{t.tecMeeting}</td>
                <td className="p-2 border border-slate-300">{t.demoMeeting}</td>
                <td className="p-2 border border-slate-300">{t.awardOfContract}</td>
                <td className="p-2 border border-slate-300 font-semibold">{t.agreement}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Signatures */}
        <div className="mt-16 grid grid-cols-2 gap-12 text-center text-3xs pt-8">
          <div>
            <div className="border-t border-slate-450 border-slate-400 pt-1.5 font-bold mx-auto w-40">
              Procurement Officer
            </div>
            <p className="text-slate-505 text-slate-500 mt-1">IT & Procurement Division</p>
          </div>
          <div>
            <div className="border-t border-slate-450 border-slate-400 pt-1.5 font-bold mx-auto w-40">
              Managing Director
            </div>
            <p className="text-slate-505 text-slate-500 mt-1">BMSICL, Patna - Bihar</p>
          </div>
        </div>
      </div>
    </AndroidFrame>
  );
}
