/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { Tender } from '../types';
import { FileSpreadsheet, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ExcelImporterProps {
  onImportComplete: (tenders: Tender[]) => void;
  lang: 'en' | 'hi';
}

export default function ExcelImporter({ onImportComplete, lang }: ExcelImporterProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' | null }>({ text: '', type: null });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (!file) return;
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'xlsx' && fileExtension !== 'xls' && fileExtension !== 'csv') {
      setStatusMsg({
        text: lang === 'en' 
          ? 'Invalid file type. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.'
          : 'अवैध फ़ाइल प्रकार। कृपया एक्सेल (.xlsx, .xls) या सीएसवी (.csv) फ़ाइल अपलोड करें।',
        type: 'error'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error('Could not read file data');

        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert sheet to json array
        const rawRows = XLSX.utils.sheet_to_json<any>(worksheet, { defval: "" });
        
        if (rawRows.length === 0) {
          throw new Error('Spreadsheet contains no spreadsheet rows or data.');
        }

        // Map columns dynamically and intelligently with synonyms match
        const mappedTenders: Tender[] = rawRows.map((row, index) => {
          const findVal = (synonyms: string[]) => {
            const foundKey = Object.keys(row).find(k => 
              synonyms.some(syn => k.toLowerCase().replace(/[^a-z0-9]/g, '').includes(syn.toLowerCase().replace(/[^a-z0-9]/g, '')))
            );
            return foundKey ? String(row[foundKey]).trim() : '';
          };

          const sl = findVal(['slno', 'serial', 'sno', 'क्रम', 'संख्या']);
          const dept = findVal(['department', 'dept', 'विभाग']);
          const equip = findVal(['equipment', 'equip', 'name', 'उपकरण']);
          const tNo = findVal(['tenderno', 'tender', 'no', 'निविदा']);
          const opDate = findVal(['opened', 'open', 'start', 'तिथि']);
          const eDate = findVal(['end', 'due', 'close', 'अंतिम']);
          const status = findVal(['status', 'remark', 'update', 'स्थिति', 'meeting']);
          const mgr = findVal(['manager', 'mgr', 'officer', 'विभागाध्यक्ष', 'प्रबंधक']);

          // If important fields are entirely empty, don't generate completely empty placeholders
          const finalEquipmentName = equip || `Equipment Entry #${index + 1}`;
          const finalTenderNo = tNo || `ME-EMP-${index + 100}`;

          return {
            id: `imported-t-${Date.now()}-${index}`,
            slNo: sl ? parseInt(sl) : (index + 1),
            department: dept || 'Procurement',
            tenderNo: finalTenderNo,
            equipmentName: finalEquipmentName,
            openedDate: opDate || '',
            endDate: eDate || '',
            statusText: status || 'File under review / Awaiting update',
            manager: mgr || 'Girish',
            
            // Map status text back into milestones when possible for full structural support
            preBidMeeting: status.toLowerCase().includes('pre-bid') ? 'Completed' : 'Pending',
            tscMeeting: status.toLowerCase().includes('tsc') ? 'Completed' : 'Pending',
            technicalOpening: opDate ? `Opened (${opDate})` : 'Pending',
            bidderName: 'Imported Bidders List',
            noOfBidders: status.toLowerCase().includes('single') ? 1 : 3,
            tecMeeting: status.toLowerCase().includes('tec') ? 'Completed' : 'Pending',
            postTecMeeting: status.toLowerCase().includes('post-tec') ? 'Minutes under signing' : 'Pending',
            tec2Meeting: 'N/A',
            demoMeeting: status.toLowerCase().includes('demo') ? 'Completed' : 'Pending',
            postDemoMeeting: 'Pending',
            financialOpening: 'Pending',
            priceJustificationMeeting: 'Pending',
            awardOfContract: 'Pending',
            agreement: 'Pending'
          };
        });

        onImportComplete(mappedTenders);
        setStatusMsg({
          text: lang === 'en'
            ? `Successfully imported ${mappedTenders.length} official tender records into the dashboard database!`
            : `डैशबोर्ड डेटाबेस में ${mappedTenders.length} आधिकारिक निविदा रिकॉर्ड सफलतापूर्वक आयात किए गए!`,
          type: 'success'
        });

        setTimeout(() => {
          setStatusMsg({ text: '', type: null });
        }, 5000);
      } catch (err: any) {
        console.error('Import Error:', err);
        setStatusMsg({
          text: lang === 'en'
            ? `Error parsing spreadsheet: ${err.message || 'Please check your file structure.'}`
            : `एक्सेल को पार्स करने में त्रुटि: ${err.message || 'कृपया अपनी फ़ाइल संरचना की जांच करें।'}`,
          type: 'error'
        });
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerSelectFile = () => {
    fileInputRef.current?.click();
  };

  return (
    <div id="excel-import-panel" className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 p-4 rounded-2xl shadow-sm space-y-3 select-none no-print">
      <div className="flex items-center gap-2 text-indigo-700 dark:text-blue-400 font-extrabold text-xs tracking-wider uppercase">
        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
        <span>Spreadsheet Import Hub</span>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerSelectFile}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 ${isDragging ? 'border-emerald-555 bg-emerald-50/15 dark:bg-emerald-950/10 border-emerald-500 text-emerald-500' : 'border-slate-250 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40 hover:border-slate-350 dark:hover:border-slate-700 text-slate-500'}`}
      >
        <input
          id="file-import-input-trigger"
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <Upload className={`w-8 h-8 ${isDragging ? 'text-emerald-550' : 'text-slate-400 dark:text-slate-500'}`} />
        
        <div>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
            {lang === 'en' ? 'Click to select or drag and drop spreadsheet file' : 'फ़ाइल चुनने के लिए क्लिक करें या यहाँ ड्रैग और ड्रॉप करें'}
          </p>
          <p className="text-3xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
            Accepts Excel (.xlsx, .xls) and Tabular CSV (.csv) reports.
          </p>
        </div>
      </div>

      {statusMsg.type && (
        <div className={`p-3 rounded-lg text-xs font-medium flex items-start gap-2 animate-fadeIn ${statusMsg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30' : 'bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 border border-rose-100 dark:border-rose-900/30'}`}>
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-650" />}
          <span className="leading-tight">{statusMsg.text}</span>
        </div>
      )}

      {/* Recommended Column Structure Info */}
      <div className="bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl text-3xs font-medium text-slate-500 dark:text-slate-450 space-y-1">
        <span className="font-bold text-slate-600 dark:text-slate-300">💡 Intelligent Synonym Mapping Rule:</span>
        <p className="leading-relaxed">
          The importer will auto-align names like `Dept`, `SNo`, `Opened`, `Manager` or Hindi equivalents like `क्रम` immediately. It is ideal for live Bihar BMSICL government spreadsheets!
        </p>
      </div>
    </div>
  );
}
