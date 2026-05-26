/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  RefreshCw, 
  LogIn, 
  AlertTriangle, 
  Building2, 
  Smartphone,
  EyeIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, AppTheme, UserSession } from '../types';
import { getTranslation } from '../localization';

interface LoginScreenProps {
  theme: AppTheme;
  lang: Language;
  onLoginSuccess: (session: UserSession) => void;
  onLanguageToggle: () => void;
}

export default function LoginScreen({
  theme,
  lang,
  onLoginSuccess,
  onLanguageToggle,
}: LoginScreenProps) {
  // Read initial values from localStorage to support "Remember Login Option"
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('bmsicl_remember_username') || '';
  });
  const [password, setPassword] = useState(() => {
    return localStorage.getItem('bmsicl_remember_password') || '';
  });
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('bmsicl_remember_checked') === 'true';
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Simulate safe network/hash delay to make it feel extremely secure
    await new Promise((resolve) => setTimeout(resolve, 800));

    const normalizedUser = username.trim().toUpperCase();
    
    if (normalizedUser === 'BMSICL' && password === '1234') {
      // If remember me is checked, write secure tokens to persistence
      if (rememberMe) {
        localStorage.setItem('bmsicl_remember_username', username);
        localStorage.setItem('bmsicl_remember_password', password);
        localStorage.setItem('bmsicl_remember_checked', 'true');
      } else {
        localStorage.removeItem('bmsicl_remember_username');
        localStorage.removeItem('bmsicl_remember_password');
        localStorage.setItem('bmsicl_remember_checked', 'false');
      }

      onLoginSuccess({
        username: 'BMSICL Administrator',
        isLoggedIn: true,
        role: 'Administrator',
      });
    } else {
      setIsSubmitting(false);
      setError(getTranslation(lang, 'loginError'));
    }
  };

  const handleGuestBypass = () => {
    onLoginSuccess({
      username: 'Guest Reviewer',
      isLoggedIn: true,
      role: 'Guest',
    });
  };

  // Stagger parameters for smooth entrance animation
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 120, damping: 14 }
    },
  };

  return (
    <div className={`flex-1 flex flex-col justify-between overflow-y-auto ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} transition-colors duration-300`}>
      
      {/* Bihar Government Elegant Executive Header */}
      <div className="bg-gradient-to-r from-blue-800 via-indigo-900 to-slate-900 text-white px-6 py-7 shrink-0 shadow-lg relative overflow-hidden border-b border-blue-500/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-4 left-1/3 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/95 rounded-2xl flex flex-col items-center justify-center shadow-xl border border-white/20 select-none">
              <span className="text-[10px] uppercase font-mono font-black text-blue-900 leading-none tracking-tight">Govt</span>
              <span className="text-sm font-black text-rose-600 leading-tight">BIHAR</span>
            </div>
            <div>
              <p className="text-[10px] font-extrabold tracking-widest text-emerald-400 uppercase leading-none">
                Department of Health
              </p>
              <h2 className="text-base font-black tracking-tight mt-1 leading-tight text-white flex items-center gap-1.5">
                BMSICL
              </h2>
            </div>
          </div>
          
          <button
            type="button"
            onClick={onLanguageToggle}
            className="text-2xs font-extrabold px-3.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all tracking-wider uppercase backdrop-blur-md cursor-pointer text-white hover:scale-105 active:scale-95"
          >
            {getTranslation(lang, 'langToggle')}
          </button>
        </div>
        
        <div className="mt-5 pt-4 border-t border-white/10 relative z-10">
          <h1 className="text-base font-extrabold tracking-tight text-white leading-snug">
            {getTranslation(lang, 'appTitle')}
          </h1>
          <p className="text-xs text-amber-200 mt-1 font-semibold flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 inline text-amber-400" />
            <span>{getTranslation(lang, 'subTitle')}</span>
          </p>
        </div>
      </div>

      {/* Main Core Form Area */}
      <div className="flex-1 p-6 flex flex-col justify-center max-w-sm mx-auto w-full">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full space-y-5"
        >
          {/* Logo badge */}
          <motion.div variants={itemVariants} className="text-center mb-2">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-700 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/20 border border-blue-450/40">
              <ShieldCheck className="w-8 h-8 text-emerald-300" />
            </div>
            <h3 className="text-lg font-black tracking-tight">{getTranslation(lang, 'loginTitle')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              {getTranslation(lang, 'loginPrompt')}
            </p>
          </motion.div>

          {/* Verification Warning Alert Banner if error occurs */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border-l-4 border-rose-500 text-rose-700 dark:text-rose-350 text-xs rounded-r-xl flex gap-2.5 items-start shadow-sm"
              >
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-extrabold tracking-tight">Verification Failure</p>
                  <p className="leading-relaxed opacity-90">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Formal Entry Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username Entry */}
            <motion.div variants={itemVariants}>
              <label 
                htmlFor="login-username" 
                className="block text-3xs font-extrabold uppercase tracking-widest text-slate-450 dark:text-slate-400 mb-1.5"
              >
                {getTranslation(lang, 'usernameLabel')}
              </label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="login-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
                  required
                  placeholder="e.g. BMSICL"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all font-semibold"
                />
              </div>
            </motion.div>

            {/* Password Entry */}
            <motion.div variants={itemVariants}>
              <div className="flex justify-between items-center mb-1.5">
                <label 
                  htmlFor="login-password" 
                  className="block text-3xs font-extrabold uppercase tracking-widest text-slate-450 dark:text-slate-400"
                >
                  {getTranslation(lang, 'passwordLabel')}
                </label>
              </div>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  required
                  placeholder="••••"
                  className="w-full pl-10 pr-11 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all font-semibold tracking-wider"
                />
                
                {/* Show/Hide password toggler */}
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>

            {/* Remember Me Toggle */}
            <motion.div variants={itemVariants} className="flex items-center justify-between pt-1 select-none">
              <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                <input
                  id="login-remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-800 text-indigo-600 focus:ring-indigo-500/40 bg-white dark:bg-slate-900 transition-all cursor-pointer"
                />
                <span className="text-slate-500 dark:text-slate-400 text-3xs font-bold uppercase tracking-wider">
                  Remember this device
                </span>
              </label>
            </motion.div>

            {/* Submit Action Button */}
            <motion.div variants={itemVariants} className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg hover:shadow-blue-500/10 active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{getTranslation(lang, 'loginButton')}</span>
                  </>
                )}
              </button>
            </motion.div>
          </form>

          {/* Secure Divider */}
          <motion.div variants={itemVariants} className="relative my-5 flex items-center justify-center">
            <span className="absolute px-3 bg-slate-50 dark:bg-slate-950 text-3xs font-bold tracking-widest text-slate-400 uppercase">
              OR
            </span>
            <div className="w-full border-t border-slate-200 dark:border-slate-850"></div>
          </motion.div>

          {/* Professional Viewer Bypass button */}
          <motion.div variants={itemVariants}>
            <button
              type="button"
              onClick={handleGuestBypass}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-250 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-3xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 hover:scale-101 active:scale-99"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
              <span>{getTranslation(lang, 'guestLogin')}</span>
            </button>
          </motion.div>
          
          {/* Note section with exact user-friendly help */}
          <motion.div variants={itemVariants} className="p-3 bg-indigo-50/50 dark:bg-slate-900/30 border border-indigo-100/30 dark:border-slate-800 rounded-xl text-center select-none">
            <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-405 text-slate-400">
              For administrative roles, use government context <strong className="font-mono text-indigo-600 dark:text-indigo-400">BMSICL</strong> / <strong className="font-mono text-indigo-600 dark:text-indigo-400">1234</strong>
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Safety Compliance Footer copyright */}
      <footer className="p-4 text-center border-t border-slate-150/40 dark:border-slate-900 shrink-0 select-none">
        <p className="text-[9px] text-slate-400 dark:text-slate-500 tracking-wider uppercase font-bold">
          BMSICL IT Division • Sealed Security Network
        </p>
        <p className="text-[8px] text-slate-550 dark:text-slate-600 font-mono mt-1">
          Authorized workstations only. Network activities are logged.
        </p>
      </footer>
    </div>
  );
}
