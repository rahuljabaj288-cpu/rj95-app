/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Tender, Language } from '../types';
import { getTranslation } from '../localization';
import { X, Save, FileText, CheckCircle, HelpCircle } from 'lucide-react';
import DateTimePicker from './DateTimePicker';
import DepartmentDropdown from './DepartmentDropdown';

interface TenderModalProps {
  tender: Tender | null; // Null means we are creating a new row
  lang: Language;
  onClose: () => void;
  onSave: (tender: Tender) => void;
}

const DEFAULT_TENDER: Omit<Tender, 'id'> = {
  slNo: 1,
  department: 'Procurement',
  tenderNo: 'BMSICL/2026-27/ME-',
  equipmentName: '',
  openedDate: '',
  endDate: '',
  statusText: 'Under review',
  manager: 'Girish',
  preBidMeeting: 'Pending',
  tscMeeting: 'Pending',
  technicalOpening: 'Pending',
  bidderName: '',
  noOfBidders: 0,
  tecMeeting: 'Pending',
  postTecMeeting: 'Pending',
  tec2Meeting: 'N/A',
  demoMeeting: 'Pending',
  postDemoMeeting: 'Pending',
  financialOpening: 'Pending',
  priceJustificationMeeting: 'Pending',
  awardOfContract: 'Pending',
  agreement: 'Pending',
};

export default function TenderModal({
  tender,
  lang,
  onClose,
  onSave,
}: TenderModalProps) {
  const [formData, setFormData] = useState<Tender>({ id: '', ...DEFAULT_TENDER });
  const [activeTab, setActiveTab] = useState<'general' | 'tsc' | 'tec' | 'financial'>('general');

  useEffect(() => {
    if (tender) {
      setFormData({ ...tender });
    } else {
      setFormData({
        id: 't-' + Math.random().toString(36).substr(2, 9),
        ...DEFAULT_TENDER,
      });
    }
  }, [tender]);

  const handleChange = (field: keyof Tender, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  // Helper inputs options list
  const statusOptions = [
    'Pending',
    'Completed',
    'Scheduled',
    'N/A',
    'Yes',
    'No',
    'Opened',
    'Approved',
    'Signed',
    'In Progress',
    'Drafting',
  ];

  return (
    <div className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex flex-col justify-end sm:justify-center p-3 sm:p-5 select-none hover:cursor-default" id="tender-modal-overlay">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90%] overflow-hidden relative" id="tender-modal-container">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              {tender ? getTranslation(lang, 'editRow') : getTranslation(lang, 'addNewRow')}
            </h3>
            <p className="text-3xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              ID: {formData.id}
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Headers selector */}
        <div className="flex border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 text-3xs font-bold uppercase tracking-wider shrink-0 overflow-x-auto scroller-hidden">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex-1 min-w-[90px] text-center py-2.5 border-b-2 transition-all cursor-pointer ${activeTab === 'general' ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-extrabold' : 'border-transparent text-slate-400'}`}
          >
            {getTranslation(lang, 'stageGeneral').split('.')[1]}
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('tsc')}
            className={`flex-1 min-w-[90px] text-center py-2.5 border-b-2 transition-all cursor-pointer ${activeTab === 'tsc' ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-extrabold' : 'border-transparent text-slate-400'}`}
          >
            {getTranslation(lang, 'stageTSC').split('.')[1]}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tec')}
            className={`flex-1 min-w-[90px] text-center py-2.5 border-b-2 transition-all cursor-pointer ${activeTab === 'tec' ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-extrabold' : 'border-transparent text-slate-400'}`}
          >
            {getTranslation(lang, 'stageTEC').split('.')[1]}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('financial')}
            className={`flex-1 min-w-[90px] text-center py-2.5 border-b-2 transition-all cursor-pointer ${activeTab === 'financial' ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-extrabold' : 'border-transparent text-slate-400'}`}
          >
            {getTranslation(lang, 'stageFinancial').split('.')[1]}
          </button>
        </div>

        {/* Form Body Fields (with nested scroll) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* TAB 1: GENERAL INFO */}
          {activeTab === 'general' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-2xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    {getTranslation(lang, 'slNo')}
                  </label>
                  <input
                    id="modal-slno"
                    type="number"
                    value={formData.slNo || ''}
                    onChange={(e) => handleChange('slNo', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-100 font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-2xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    {getTranslation(lang, 'department')} *
                  </label>
                  <DepartmentDropdown
                    value={formData.department || ''}
                    onChange={(val) => handleChange('department', val)}
                    lang={lang}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    {getTranslation(lang, 'tenderNo')} *
                  </label>
                  <input
                    id="modal-tenderno"
                    type="text"
                    value={formData.tenderNo}
                    onChange={(e) => handleChange('tenderNo', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-100 font-mono font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-2xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    {getTranslation(lang, 'manager')} *
                  </label>
                  <input
                    id="modal-manager"
                    type="text"
                    value={formData.manager || ''}
                    onChange={(e) => handleChange('manager', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-100 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-2xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  {getTranslation(lang, 'equipmentName')} *
                </label>
                <input
                  id="modal-equipname"
                  type="text"
                  value={formData.equipmentName}
                  onChange={(e) => handleChange('equipmentName', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-100 font-medium"
                  placeholder="e.g. ICU Ventilator High-End"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    {getTranslation(lang, 'openedDate')}
                  </label>
                  <DateTimePicker
                    id="modal-openeddate"
                    type="date"
                    value={formData.openedDate || ''}
                    onChange={(val) => handleChange('openedDate', val)}
                    lang={lang}
                    placeholder="DD-MM-YYYY"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    {getTranslation(lang, 'endDate')}
                  </label>
                  <DateTimePicker
                    id="modal-enddate"
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(val) => handleChange('endDate', val)}
                    lang={lang}
                    placeholder="DD-MM-YYYY"
                  />
                </div>
              </div>

              <div>
                <label className="block text-2xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  {getTranslation(lang, 'statusText')} *
                </label>
                <textarea
                  id="modal-statustext"
                  value={formData.statusText || ''}
                  onChange={(e) => handleChange('statusText', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-100 font-medium h-20 resize-none"
                  placeholder="Describe current tender evaluation status..."
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-2xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    {getTranslation(lang, 'bidderName')}
                  </label>
                  <input
                    id="modal-bidnames"
                    type="text"
                    value={formData.bidderName}
                    onChange={(e) => handleChange('bidderName', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-100"
                    placeholder="e.g. Philips India, Siemens Diagnostic"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 truncate">
                    {getTranslation(lang, 'noOfBidders')}
                  </label>
                  <input
                    id="modal-bidderscount"
                    type="number"
                    value={formData.noOfBidders}
                    onChange={(e) => handleChange('noOfBidders', Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-100 font-mono"
                    min="0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRE-BID & TSC STAGES */}
          {activeTab === 'tsc' && (
            <div className="space-y-4 animate-fadeIn">
              {['preBidMeeting', 'tscMeeting', 'technicalOpening'].map((field) => (
                <div key={field}>
                  <label className="block text-2xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    {getTranslation(lang, field as any)}
                  </label>
                  <div className="flex gap-2 items-center">
                    <div className="relative flex-1">
                      <input
                        id={`modal-${field}`}
                        type="text"
                        value={formData[field as keyof Tender] || ''}
                        onChange={(e) => handleChange(field as keyof Tender, e.target.value)}
                        className="w-full pl-3 pr-24 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-100"
                      />
                      <select
                        id={`preset-${field}`}
                        className="absolute right-1 top-1 bottom-1 px-1.5 py-0.5 text-2xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 rounded-lg outline-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-750 font-semibold"
                        onChange={(e) => handleChange(field as keyof Tender, e.target.value)}
                      >
                        <option value="">Presets</option>
                        {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        <option value="Completed (Today)">Completed Today</option>
                      </select>
                    </div>

                    {/* Integrated Date and Time selector triggers */}
                    <div className="flex gap-1 shrink-0 select-none">
                      <DateTimePicker
                        type="date"
                        value=""
                        onChange={(val) => handleChange(field as keyof Tender, val)}
                        lang={lang}
                        placeholder="📅"
                        className="!px-2.5 !py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-850 rounded-xl"
                      />
                      <DateTimePicker
                        type="time"
                        value=""
                        onChange={(val) => {
                          const currentVal = formData[field as keyof Tender] || '';
                          if (currentVal && currentVal !== 'Pending' && currentVal !== 'N/A') {
                            handleChange(field as keyof Tender, `${currentVal} ${val}`);
                          } else {
                            handleChange(field as keyof Tender, val);
                          }
                        }}
                        lang={lang}
                        placeholder="🕒"
                        className="!px-2.5 !py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-850 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: TECHNICAL EVALUATION & DEMO */}
          {activeTab === 'tec' && (
            <div className="space-y-4 animate-fadeIn">
              {['tecMeeting', 'postTecMeeting', 'tec2Meeting', 'demoMeeting', 'postDemoMeeting'].map((field) => (
                <div key={field}>
                  <label className="block text-2xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    {getTranslation(lang, field as any)}
                  </label>
                  <div className="flex gap-2 items-center">
                    <div className="relative flex-1">
                      <input
                        id={`modal-${field}`}
                        type="text"
                        value={formData[field as keyof Tender] || ''}
                        onChange={(e) => handleChange(field as keyof Tender, e.target.value)}
                        className="w-full pl-3 pr-24 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-100"
                      />
                      <select
                        id={`preset-${field}`}
                        className="absolute right-1 top-1 bottom-1 px-1.5 py-0.5 text-2xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 rounded-lg outline-none cursor-pointer hover:bg-slate-200"
                        onChange={(e) => handleChange(field as keyof Tender, e.target.value)}
                      >
                        <option value="">Presets</option>
                        {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>

                    {/* Integrated Date and Time selector triggers */}
                    <div className="flex gap-1 shrink-0 select-none">
                      <DateTimePicker
                        type="date"
                        value=""
                        onChange={(val) => handleChange(field as keyof Tender, val)}
                        lang={lang}
                        placeholder="📅"
                        className="!px-2.5 !py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-850 rounded-xl"
                      />
                      <DateTimePicker
                        type="time"
                        value=""
                        onChange={(val) => {
                          const currentVal = formData[field as keyof Tender] || '';
                          if (currentVal && currentVal !== 'Pending' && currentVal !== 'N/A') {
                            handleChange(field as keyof Tender, `${currentVal} ${val}`);
                          } else {
                            handleChange(field as keyof Tender, val);
                          }
                        }}
                        lang={lang}
                        placeholder="🕒"
                        className="!px-2.5 !py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-850 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: FINANCIAL & CONTRACTS */}
          {activeTab === 'financial' && (
            <div className="space-y-4 animate-fadeIn">
              {['financialOpening', 'priceJustificationMeeting', 'awardOfContract', 'agreement'].map((field) => (
                <div key={field}>
                  <label className="block text-2xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    {getTranslation(lang, field as any)}
                  </label>
                  <div className="flex gap-2 items-center">
                    <div className="relative flex-1">
                      <input
                        id={`modal-${field}`}
                        type="text"
                        value={formData[field as keyof Tender] || ''}
                        onChange={(e) => handleChange(field as keyof Tender, e.target.value)}
                        className="w-full pl-3 pr-24 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-100"
                      />
                      <select
                        id={`preset-${field}`}
                        className="absolute right-1 top-1 bottom-1 px-1.5 py-0.5 text-2xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 rounded-lg outline-none cursor-pointer hover:bg-slate-200"
                        onChange={(e) => handleChange(field as keyof Tender, e.target.value)}
                      >
                        <option value="">Presets</option>
                        {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>

                    {/* Integrated Date and Time selector triggers */}
                    <div className="flex gap-1 shrink-0 select-none">
                      <DateTimePicker
                        type="date"
                        value=""
                        onChange={(val) => handleChange(field as keyof Tender, val)}
                        lang={lang}
                        placeholder="📅"
                        className="!px-2.5 !py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-850 rounded-xl"
                      />
                      <DateTimePicker
                        type="time"
                        value=""
                        onChange={(val) => {
                          const currentVal = formData[field as keyof Tender] || '';
                          if (currentVal && currentVal !== 'Pending' && currentVal !== 'N/A') {
                            handleChange(field as keyof Tender, `${currentVal} ${val}`);
                          } else {
                            handleChange(field as keyof Tender, val);
                          }
                        }}
                        lang={lang}
                        placeholder="🕒"
                        className="!px-2.5 !py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-850 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </form>

        {/* Modal Actions Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950 flex gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            {getTranslation(lang, 'cancel')}
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{getTranslation(lang, 'saveChanges')}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
