/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Hash, Package, User, FileText, CheckCircle, HelpCircle } from 'lucide-react';
import { Tender, Language } from '../types';
import HighlightText from './HighlightText';

interface InstantSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  tenders: Tender[];
  lang: Language;
  onSelectTender?: (tender: Tender) => void;
  placeholder?: string;
  className?: string;
}

export default function InstantSearchBar({
  searchQuery,
  onSearchChange,
  tenders,
  lang,
  onSelectTender,
  placeholder,
  className = '',
}: InstantSearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter tenders for suggestions
  const getSuggestions = () => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();

    const matches: Array<{
      tender: Tender;
      matchType: 'tenderNo' | 'equipmentName' | 'bidderName' | 'statusText' | 'other';
      matchValue: string;
      fieldLabel: string;
    }> = [];

    for (const t of tenders) {
      if (t.tenderNo.toLowerCase().includes(q)) {
        matches.push({ tender: t, matchType: 'tenderNo', matchValue: t.tenderNo, fieldLabel: lang === 'en' ? 'Tender No' : 'निविदा संख्या' });
      } else if (t.equipmentName.toLowerCase().includes(q)) {
        matches.push({ tender: t, matchType: 'equipmentName', matchValue: t.equipmentName, fieldLabel: lang === 'en' ? 'Equipment' : 'उपकरण' });
      } else if (t.bidderName && t.bidderName.toLowerCase().includes(q)) {
        matches.push({ tender: t, matchType: 'bidderName', matchValue: t.bidderName, fieldLabel: lang === 'en' ? 'Bidder' : 'बोलीदाता' });
      } else if (t.statusText && t.statusText.toLowerCase().includes(q)) {
        matches.push({ tender: t, matchType: 'statusText', matchValue: t.statusText, fieldLabel: lang === 'en' ? 'Status' : 'स्थिति' });
      } else {
        // Fallback check on all milestone properties
        const matchOther = Object.entries(t).some(([key, val]) => {
          if (['id', 'tenderNo', 'equipmentName', 'bidderName', 'statusText'].includes(key)) return false;
          return String(val).toLowerCase().includes(q);
        });
        if (matchOther) {
          matches.push({ tender: t, matchType: 'other', matchValue: t.equipmentName, fieldLabel: lang === 'en' ? 'Milestone' : 'मील का पत्थर' });
        }
      }
    }

    return matches.slice(0, 8); // Limit to 8 responsive suggestions
  };

  const suggestions = getSuggestions();

  const handleSuggestionClick = (match: { tender: Tender; matchType: string; matchValue: string }) => {
    // Fill search box with the matching value
    onSearchChange(match.matchValue);
    setIsOpen(false);
    
    // Trigger onSelectTender if available
    if (onSelectTender) {
      onSelectTender(match.tender);
    }
  };

  const getMatchIcon = (type: string) => {
    switch (type) {
      case 'tenderNo':
        return <Hash className="w-3.5 h-3.5 text-indigo-500 shrink-0" />;
      case 'equipmentName':
        return <Package className="w-3.5 h-3.5 text-sky-500 shrink-0" />;
      case 'bidderName':
        return <User className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
      case 'statusText':
        return <CheckCircle className="w-3.5 h-3.5 text-pink-500 shrink-0" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    }
  };

  const defaultPlaceholder = lang === 'en'
    ? 'Search anything instantly across all columns...'
    : 'त्वरित खोज (निविदा संख्या, उपकरण, ठेकेदार या स्थिति)...';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Bar Input Container */}
      <div className="relative group flex items-center">
        <span className="absolute left-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none">
          <Search className="w-4 h-4" />
        </span>
        
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder || defaultPlaceholder}
          className="w-full pl-9 pr-10 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-550 dark:focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
        />

        {/* Clear Search Interaction Button */}
        {searchQuery && (
          <button
            onClick={() => {
              onSearchChange('');
              setIsOpen(false);
            }}
            aria-label="Clear Search Input"
            className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/80 transition-all cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Dynamic Instant Search Suggestions Overlay Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden select-none animate-fadeIn max-h-80 overflow-y-auto">
          {/* Header summary label */}
          <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
            <span className="text-4xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
              {lang === 'en' ? 'Direct Matching Ledger Records' : 'निविदा रिकॉर्ड सुझाव'}
            </span>
            <span className="text-4xs font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/45 text-indigo-600 dark:text-indigo-400">
              {suggestions.length} {lang === 'en' ? 'found' : 'मिले'}
            </span>
          </div>

          <ul className="divide-y divide-slate-100 dark:divide-slate-850">
            {suggestions.map((match, idx) => (
              <li key={`${match.tender.id}-${idx}`}>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick(match)}
                  className="w-full px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-950/70 text-left flex items-start gap-2.5 transition-colors cursor-pointer group"
                >
                  <div className="mt-0.5 p-1 rounded bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/50 transition-colors">
                    {getMatchIcon(match.matchType)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-4xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                        {match.tender.tenderNo}
                      </span>
                      <span className="text-4xs font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/60 text-slate-500 dark:text-slate-350 transition-colors">
                        {match.fieldLabel}
                      </span>
                    </div>

                    <h4 className="text-3xs font-extrabold text-slate-800 dark:text-slate-100 truncate mt-0.5 leading-snug">
                      <HighlightText text={match.tender.equipmentName} highlight={searchQuery} />
                    </h4>

                    {/* Matched Preview Context Subtitle */}
                    <p className="text-4xs text-slate-405 dark:text-slate-400 truncate mt-0.5 font-medium leading-none">
                      {match.matchType === 'bidderName' && (
                        <span>
                          {lang === 'en' ? 'Bidder: ' : 'बोलीदाता: '}
                          <HighlightText text={match.tender.bidderName || ''} highlight={searchQuery} />
                        </span>
                      )}
                      {match.matchType === 'statusText' && (
                        <span>
                          {lang === 'en' ? 'Latest Update: ' : 'नवीनतम अद्यतन: '}
                          <HighlightText text={match.tender.statusText || ''} highlight={searchQuery} />
                        </span>
                      )}
                      {match.matchType === 'tenderNo' && (
                        <span>
                          {lang === 'en' ? 'Tender Tag: ' : 'निविदा संख्या: '}
                          <HighlightText text={match.tender.tenderNo} highlight={searchQuery} />
                        </span>
                      )}
                      {['equipmentName', 'other'].includes(match.matchType) && (
                        <span>
                          {lang === 'en' ? 'Manager: ' : 'प्रबंधक: '}
                          <strong>{match.tender.manager || 'Girish'}</strong>
                          {match.tender.department && ` • Dept: ${match.tender.department}`}
                        </span>
                      )}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
