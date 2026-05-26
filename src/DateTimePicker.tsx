/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, X, CalendarCheck, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';

interface DateTimePickerProps {
  type: 'date' | 'time' | 'datetime';
  value: string; // "DD-MM-YYYY", "hh:mm AM/PM", or "DD-MM-YYYY 10:30 AM"
  onChange: (value: string) => void;
  lang: Language;
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
}

// English and Hindi names helper
const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_NAMES_HI = [
  'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
  'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
];

const WEEKDAYS_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const WEEKDAYS_HI = ['रवि', 'सोम', 'मंग', 'बुध', 'गुरु', 'शुक्र', 'शनि'];

export default function DateTimePicker({
  type,
  value,
  onChange,
  lang,
  placeholder = '',
  className = '',
  id,
  disabled = false,
}: DateTimePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // States for Date Selector
  const [currentYear, setCurrentYear] = useState(() => {
    // Attempt parse DD-MM-YYYY or default to current year
    const dVal = String(value || '');
    const datePart = type === 'datetime' ? dVal.split(' ')[0] : dVal;
    const parts = datePart.split('-');
    if (parts.length === 3) {
      const yr = parseInt(parts[2]);
      if (!isNaN(yr)) return yr;
    }
    return new Date().getFullYear();
  });

  const [currentMonth, setCurrentMonth] = useState(() => {
    const dVal = String(value || '');
    const datePart = type === 'datetime' ? dVal.split(' ')[0] : dVal;
    const parts = datePart.split('-');
    if (parts.length === 3) {
      const mo = parseInt(parts[1]) - 1; // 0-indexed
      if (!isNaN(mo) && mo >= 0 && mo <= 11) return mo;
    }
    return new Date().getMonth();
  });

  const [selectedDay, setSelectedDay] = useState(() => {
    const dVal = String(value || '');
    const datePart = type === 'datetime' ? dVal.split(' ')[0] : dVal;
    const parts = datePart.split('-');
    if (parts.length === 3) {
      const dy = parseInt(parts[0]);
      if (!isNaN(dy)) return dy;
    }
    return new Date().getDate();
  });

  // States for Time Selector
  const [selectedHour, setSelectedHour] = useState(() => {
    const dVal = String(value || '');
    const timePart = type === 'datetime' ? dVal.substring(dVal.indexOf(' ') + 1) : dVal;
    const matches = timePart.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (matches) {
      const h = parseInt(matches[1]);
      if (!isNaN(h) && h >= 1 && h <= 12) return h;
    }
    return 10; // Default: 10
  });

  const [selectedMinute, setSelectedMinute] = useState(() => {
    const dVal = String(value || '');
    const timePart = type === 'datetime' ? dVal.substring(dVal.indexOf(' ') + 1) : dVal;
    const matches = timePart.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (matches) {
      const m = parseInt(matches[2]);
      if (!isNaN(m) && m >= 0 && m <= 59) return m;
    }
    return 30; // Default: 30
  });

  const [ampm, setAmpm] = useState<'AM' | 'PM'>(() => {
    const dVal = String(value || '');
    const timePart = type === 'datetime' ? dVal.substring(dVal.indexOf(' ') + 1) : dVal;
    if (timePart.toLowerCase().includes('pm')) return 'PM';
    return 'AM';
  });

  const [activeSubTab, setActiveSubTab] = useState<'date' | 'time'>(type === 'time' ? 'time' : 'date');

  // Parse parent value changes to stay synced
  useEffect(() => {
    if (!value) return;
    const dVal = String(value);

    // Sync Date
    const datePart = type === 'datetime' ? dVal.split(' ')[0] : dVal;
    const dateParts = datePart.split('-');
    if (dateParts.length === 3) {
      const d = parseInt(dateParts[0]);
      const m = parseInt(dateParts[1]) - 1;
      const y = parseInt(dateParts[2]);
      if (!isNaN(d)) setSelectedDay(d);
      if (!isNaN(m) && m >= 0 && m <= 11) setCurrentMonth(m);
      if (!isNaN(y)) setCurrentYear(y);
    }

    // Sync Time
    const timePart = type === 'datetime' ? dVal.substring(dVal.indexOf(' ') + 1) : dVal;
    const timeMatches = timePart.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (timeMatches) {
      const h = parseInt(timeMatches[1]);
      const m = parseInt(timeMatches[2]);
      const ap = timeMatches[3].toUpperCase() as 'AM' | 'PM';
      if (!isNaN(h)) setSelectedHour(h);
      if (!isNaN(m)) setSelectedMinute(m);
      if (ap === 'AM' || ap === 'PM') setAmpm(ap);
    }
  }, [value, type]);

  // Click outside to dismiss popup picker
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        pickerRef.current && 
        !pickerRef.current.contains(e.target as Node) &&
        triggerRef.current && 
        !triggerRef.current.contains(e.target as Node)
      ) {
        setShowPicker(false);
      }
    };
    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPicker]);

  // Calendar calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const monthsList = lang === 'en' ? MONTH_NAMES_EN : MONTH_NAMES_HI;
  const daysOfWeek = lang === 'en' ? WEEKDAYS_EN : WEEKDAYS_HI;

  // Assembly and emit change
  const handleSaveSelection = (updatedDay = selectedDay, updatedMonth = currentMonth, updatedYear = currentYear, updatedHour = selectedHour, updatedMin = selectedMinute, updatedAmPm = ampm) => {
    const pad = (num: number) => String(num).padStart(2, '0');
    
    const formattedDate = `${pad(updatedDay)}-${pad(updatedMonth + 1)}-${updatedYear}`;
    const formattedTime = `${pad(updatedHour)}:${pad(updatedMin)} ${updatedAmPm}`;
    
    let result = '';
    if (type === 'date') {
      result = formattedDate;
    } else if (type === 'time') {
      result = formattedTime;
    } else {
      result = `${formattedDate} ${formattedTime}`;
    }

    onChange(result);
  };

  const selectDayAction = (day: number) => {
    setSelectedDay(day);
    handleSaveSelection(day, currentMonth, currentYear);
    if (type === 'date') {
      // Auto close date only picker
      setShowPicker(false);
    }
  };

  const selectHourAction = (hr: number) => {
    setSelectedHour(hr);
    handleSaveSelection(selectedDay, currentMonth, currentYear, hr, selectedMinute, ampm);
  };

  const selectMinAction = (mn: number) => {
    setSelectedMinute(mn);
    handleSaveSelection(selectedDay, currentMonth, currentYear, selectedHour, mn, ampm);
  };

  const setAmpmAction = (ap: 'AM' | 'PM') => {
    setAmpm(ap);
    handleSaveSelection(selectedDay, currentMonth, currentYear, selectedHour, selectedMinute, ap);
  };

  // Helper arrays for hours & minutes
  const hoursArray = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutesArray = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  return (
    <div className="relative inline-block w-full" ref={triggerRef}>
      
      {/* Visual ReadOnly trigger field */}
      <div 
        onClick={() => !disabled && setShowPicker(!showPicker)}
        className={`flex items-center justify-between border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-850 dark:text-slate-100 cursor-pointer select-none shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
        id={id}
      >
        <span className="truncate">
          {value || placeholder || (type === 'time' ? '00:00 AM' : 'DD-MM-YYYY')}
        </span>
        {type === 'time' ? (
          <Clock className="w-4 h-4 text-blue-500 shrink-0 ml-1.5" />
        ) : (
          <CalendarIcon className="w-4 h-4 text-indigo-500 shrink-0 ml-1.5" />
        )}
      </div>

      {/* Floating interactive Popover Box */}
      {showPicker && (
        <div 
          ref={pickerRef}
          className="absolute left-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-[90] w-[300px] sm:w-[320px] p-4 select-none animate-fadeIn no-print"
        >
          {/* Header tab switcher for Combined DateTime pickers */}
          {type === 'datetime' && (
            <div className="flex border-b border-slate-150 dark:border-slate-800 mb-3 text-3xs font-extrabold uppercase tracking-widest pb-1 gap-1.5">
              <button
                type="button"
                onClick={() => setActiveSubTab('date')}
                className={`flex-1 py-1.5 px-2 text-center rounded-lg transition-all ${activeSubTab === 'date' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600'}`}
              >
                📅 {lang === 'en' ? 'Date' : 'दिनांक'}
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('time')}
                className={`flex-1 py-1.5 px-2 text-center rounded-lg transition-all ${activeSubTab === 'time' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600'}`}
              >
                🕒 {lang === 'en' ? 'Time' : 'समय'}
              </button>
            </div>
          )}

          {/* Sub-Panel 1: Calendar Date picker Engine */}
          {activeSubTab === 'date' && (
            <div className="space-y-3">
              {/* Year & Month Selection controls */}
              <div className="flex justify-between items-center gap-1.5">
                <button 
                  type="button"
                  onClick={handlePrevMonth} 
                  className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg text-slate-500"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {/* Custom Month/Year Dropdowns so users can quickly change year and month */}
                <div className="flex gap-1.5 items-center flex-1 justify-center">
                  <select
                    value={currentMonth}
                    onChange={(e) => {
                      const m = parseInt(e.target.value);
                      setCurrentMonth(m);
                      handleSaveSelection(selectedDay, m, currentYear);
                    }}
                    className="bg-transparent dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 border-none focus:outline-none cursor-pointer p-0.5"
                  >
                    {monthsList.map((mName, idx) => (
                      <option key={idx} value={idx}>{mName}</option>
                    ))}
                  </select>

                  <select
                    value={currentYear}
                    onChange={(e) => {
                      const y = parseInt(e.target.value);
                      setCurrentYear(y);
                      handleSaveSelection(selectedDay, currentMonth, y);
                    }}
                    className="bg-transparent dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 border-none focus:outline-none cursor-pointer p-0.5"
                  >
                    {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - 10 + i).map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <button 
                  type="button"
                  onClick={handleNextMonth} 
                  className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg text-slate-500"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Day of Week Label grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-4xs font-bold uppercase tracking-widest text-slate-400">
                {daysOfWeek.map((dayLabel, index) => (
                  <div key={index} className="py-1">
                    {dayLabel}
                  </div>
                ))}
              </div>

              {/* Day cells grid layout */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {/* Fill empty leading space */}
                {Array.from({ length: firstDayIndex }).map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-square"></div>
                ))}

                {/* Days of this month */}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1;
                  const isSelected = day === selectedDay;
                  const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
                  
                  return (
                    <button
                      key={`day-${day}`}
                      type="button"
                      onClick={() => selectDayAction(day)}
                      className={`aspect-square w-full rounded-full text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-indigo-600 text-white shadow-xs' 
                          : isToday 
                            ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 border border-blue-200/50 dark:border-blue-900/40' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sub-Panel 2: 12-Hour 12-Hour AM/PM Time picker Dial grid */}
          {activeSubTab === 'time' && (
            <div className="space-y-4">
              
              {/* Hour Grid 1 to 12 */}
              <div>
                <span className="text-4xs font-extrabold uppercase tracking-widest text-slate-400 block mb-1.5 text-center">
                  {lang === 'en' ? 'Select Hour' : 'घंटा चुनें'}
                </span>
                <div className="grid grid-cols-6 gap-1 text-center">
                  {hoursArray.map((hr) => (
                    <button
                      key={`hr-${hr}`}
                      type="button"
                      onClick={() => selectHourAction(hr)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        hr === selectedHour 
                          ? 'bg-blue-600 text-white shadow-xs' 
                          : 'bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {String(hr).padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minute selection options */}
              <div>
                <span className="text-4xs font-extrabold uppercase tracking-widest text-slate-400 block mb-1.5 text-center">
                  {lang === 'en' ? 'Select Minute' : 'मिनट चुनें'}
                </span>
                <div className="grid grid-cols-6 gap-1 text-center">
                  {minutesArray.map((mn) => (
                    <button
                      key={`mn-${mn}`}
                      type="button"
                      onClick={() => selectMinAction(mn)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        mn === selectedMinute 
                          ? 'bg-emerald-600 text-white shadow-xs' 
                          : 'bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {String(mn).padStart(2, '0')}
                    </button>
                  ))}
                </div>

                {/* Micro Adjustment Fine triggers */}
                <div className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20 p-1 rounded-xl border border-slate-100 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const prev = (selectedMinute - 1 + 60) % 60;
                      selectMinAction(prev);
                    }}
                    className="p-1 hover:bg-slate-100 rounded text-slate-500 font-extrabold text-[11px]"
                  >
                    -1 min
                  </button>
                  <span className="font-mono text-xs font-black text-slate-600 dark:text-slate-300">
                    {String(selectedHour).padStart(2, '0')}:{String(selectedMinute).padStart(2, '0')} {ampm}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = (selectedMinute + 1) % 60;
                      selectMinAction(next);
                    }}
                    className="p-1 hover:bg-slate-100 rounded text-slate-500 font-extrabold text-[11px]"
                  >
                    +1 min
                  </button>
                </div>
              </div>

              {/* AM/PM Switcher toggles */}
              <div className="flex bg-slate-50 dark:bg-slate-850 p-1 rounded-xl border border-slate-150/40 dark:border-slate-800 gap-1 select-none">
                <button
                  type="button"
                  onClick={() => setAmpmAction('AM')}
                  className={`flex-1 py-1 text-center text-xs font-black uppercase rounded-lg transition-all cursor-pointer ${
                    ampm === 'AM' 
                      ? 'bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-blue-600 dark:text-blue-400 font-extrabold' 
                      : 'text-slate-400 hover:text-slate-500'
                  }`}
                >
                  AM (पूर्वाह्न)
                </button>
                <button
                  type="button"
                  onClick={() => setAmpmAction('PM')}
                  className={`flex-1 py-1 text-center text-xs font-black uppercase rounded-lg transition-all cursor-pointer ${
                    ampm === 'PM' 
                      ? 'bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 font-extrabold' 
                      : 'text-slate-400 hover:text-slate-500'
                  }`}
                >
                  PM (अपराह्न)
                </button>
              </div>
            </div>
          )}

          {/* Action Control triggers */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center gap-2">
            <button
              type="button"
              onClick={() => {
                // Return today or current hour
                const now = new Date();
                const pad = (n: number) => String(n).padStart(2, '0');
                if (type === 'date') {
                  const todayStr = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`;
                  onChange(todayStr);
                } else if (type === 'time') {
                  onChange("10:00 AM");
                } else {
                  const todayStr = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`;
                  onChange(`${todayStr} 10:00 AM`);
                }
                setShowPicker(false);
              }}
              className="text-3xs font-extrabold text-blue-650 hover:text-blue-700 uppercase"
            >
              🚀 {lang === 'en' ? 'Today' : 'आज'}
            </button>
            
            <button
              type="button"
              onClick={() => setShowPicker(false)}
              className="px-3 py-1 bg-indigo-650 hover:bg-indigo-700 text-white text-3xs font-extrabold rounded-lg inline-flex items-center gap-0.5 shadow-sm uppercase tracking-wide cursor-pointer active:scale-95 duration-150"
            >
              <CheckCircle2 className="w-3 h-3 text-white" />
              <span>{lang === 'en' ? 'Done' : 'पूर्ण'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
