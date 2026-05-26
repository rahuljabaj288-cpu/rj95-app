/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { 
  Cloud, 
  CloudLightning, 
  FolderGit, 
  Trash2, 
  Upload, 
  Loader2, 
  RefreshCw, 
  FileText, 
  FileSpreadsheet, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  DatabaseBackup,
  Download,
  CheckCircle2
} from 'lucide-react';
import { Tender, Language } from '../types';
import { 
  getOrCreateBmsiclFolder, 
  listGoogleDriveFiles, 
  uploadFileToGoogleDrive, 
  deleteDriveFile 
} from '../utils/googleDrive';
import * as XLSX from 'xlsx';

interface GoogleDriveHubProps {
  googleUser: any;
  googleToken: string | null;
  onConnectGoogle: () => void;
  onDisconnectGoogle: () => void;
  tenders: Tender[];
  onImportTenders: (tenders: Tender[]) => void;
  onUpdateTender: (tender: Tender) => void;
  lang: Language;
}

export default function GoogleDriveHub({
  googleUser,
  googleToken,
  onConnectGoogle,
  onDisconnectGoogle,
  tenders,
  onImportTenders,
  onUpdateTender,
  lang,
}: GoogleDriveHubProps) {
  const [loading, setLoading] = useState(false);
  const [folderId, setFolderId] = useState<string>('');
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [selectedTenderId, setSelectedTenderId] = useState<string>('');
  const [vaultStatus, setVaultStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync / load folder & files
  const loadDriveData = async () => {
    if (!googleToken) return;
    setLoading(true);
    setVaultStatus(lang === 'en' ? 'Synchronizing BMSICL Storage Vault...' : 'BMSICL स्टोरेज वॉल्ट को सिंक्रोनाइज़ किया जा रहा है...');
    try {
      const fid = await getOrCreateBmsiclFolder(googleToken);
      setFolderId(fid);
      const files = await listGoogleDriveFiles(googleToken, fid);
      setDriveFiles(files);
      setVaultStatus('');
    } catch (err: any) {
      console.error(err);
      setVaultStatus(lang === 'en' ? 'Failed to fetch files from Drive.' : 'ड्राइव से फ़ाइलें प्राप्त करने में विफल।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (googleToken) {
      loadDriveData();
    } else {
      setDriveFiles([]);
      setFolderId('');
    }
  }, [googleToken]);

  // Handle Drag & Drop to directly upload to Google Drive
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processDirectUpload = async (file: File) => {
    if (!googleToken) return;
    setUploadProgress(lang === 'en' ? `Uploading "${file.name}"...` : `"${file.name}" अपलोड किया जा रहा है...`);
    try {
      // 1. Upload to Google Drive using helper multipart upload
      const uploaded = await uploadFileToGoogleDrive(
        googleToken,
        file.name,
        file.type || 'application/octet-stream',
        file,
        folderId
      );

      // 2. Link to tender if selected
      if (selectedTenderId) {
        const tender = tenders.find(t => t.id === selectedTenderId);
        if (tender) {
          const updatedTender: Tender = {
            ...tender,
            statusText: `${tender.statusText || ''}\n[Doc Link: ${file.name} - ${uploaded.webViewLink}]`.trim(),
            // We can add custom status indicating doc linked
          };
          onUpdateTender(updatedTender);
        }
      }

      setVaultStatus(lang === 'en' ? `File "${file.name}" uploaded successfully!` : `फ़ाइल "${file.name}" सफलतापूर्वक अपलोड हो गई!`);
      // Reload lists
      const files = await listGoogleDriveFiles(googleToken, folderId);
      setDriveFiles(files);
    } catch (err: any) {
      console.error(err);
      setVaultStatus(lang === 'en' ? `Upload failed: ${err.message}` : `अपलोड विफल: ${err.message}`);
    } finally {
      setUploadProgress(null);
      setTimeout(() => setVaultStatus(''), 5000);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processDirectUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processDirectUpload(e.target.files[0]);
    }
  };

  // Create real-time Spreadsheet Backup directly into Google Drive Folder
  const handleBackupTendersToDrive = async () => {
    if (!googleToken) return;
    setLoading(true);
    setUploadProgress(lang === 'en' ? 'Generating and uploading official ledger backup xlsx...' : 'आधिकारिक निविदा बैकअप xlsx उत्पन्न और अपलोड किया जा रहा है...');
    try {
      // Create raw worksheet
      const worksheetData = tenders.map((t, idx) => ({
        "SNo": t.slNo || (idx + 1),
        "Department": t.department || 'Procurement',
        "Tender No": t.tenderNo,
        "Equipment Name": t.equipmentName,
        "Opened Date": t.openedDate || '',
        "End Date": t.endDate || '',
        "Manager": t.manager || 'Girish',
        "Current Status": t.statusText || '',
        "Pre-Bid Meeting": t.preBidMeeting || '',
        "TSC Meeting": t.tscMeeting || '',
        "Technical Opening": t.technicalOpening || '',
        "Bidder Name": t.bidderName || '',
        "No of Bidders": t.noOfBidders || 0,
        "TEC Meeting": t.tecMeeting || '',
        "Post TEC Meeting": t.postTecMeeting || '',
        "Agreement Stage": t.agreement || '',
      }));

      const ws = XLSX.utils.json_to_sheet(worksheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "BMSICL Ledger Backup");
      
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const excelBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      const timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').slice(0, 19);
      const filename = `BMSICL_Tenders_Database_Backup_${timestamp}.xlsx`;

      const response = await uploadFileToGoogleDrive(
        googleToken,
        filename,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        excelBlob,
        folderId
      );

      setVaultStatus(lang === 'en' ? 'Secure Excel backup generated and saved to Google Drive!' : 'सुरक्षित एक्सेल बैकअप जेनरेट हुआ और गूगल ड्राइव में सेव हो गया!');
      
      // Reload Files
      const files = await listGoogleDriveFiles(googleToken, folderId);
      setDriveFiles(files);
    } catch (err: any) {
      console.error(err);
      setVaultStatus(lang === 'en' ? `Backup failed: ${err.message}` : `बैकअप विफल: ${err.message}`);
    } finally {
      setLoading(false);
      setUploadProgress(null);
      setTimeout(() => setVaultStatus(''), 5000);
    }
  };

  // Create real-time JSON Backup directly into Google Drive Folder
  const handleBackupJsonToDrive = async () => {
    if (!googleToken) return;
    setLoading(true);
    setUploadProgress(lang === 'en' ? 'Compiling JSON Database ledger...' : 'JSON डेटाबेस संकलित किया जा रहा है...');
    try {
      const jsonString = JSON.stringify(tenders, null, 2);
      const jsonBlob = new Blob([jsonString], { type: 'application/json' });
      const timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').slice(0, 19);
      const filename = `BMSICL_Full_Ledger_Dump_${timestamp}.json`;

      await uploadFileToGoogleDrive(
        googleToken,
        filename,
        'application/json',
        jsonBlob,
        folderId
      );

      setVaultStatus(lang === 'en' ? 'Full database JSON dump uploaded to Drive Vault!' : 'पूर्ण डेटाबेस JSON डंप ड्राइव वॉल्ट में अपलोड हो गया!');
      // Reload List
      const files = await listGoogleDriveFiles(googleToken, folderId);
      setDriveFiles(files);
    } catch (err: any) {
      console.error(err);
      setVaultStatus(lang === 'en' ? `JSON Dump failed: ${err.message}` : `JSON डंप विफल हुआ: ${err.message}`);
    } finally {
      setLoading(false);
      setUploadProgress(null);
      setTimeout(() => setVaultStatus(''), 5000);
    }
  };

  // Delete file from Google Drive (Requires user confirmation under critical Workspace integration security principles)
  const handleDeleteFile = async (fileId: string, name: string) => {
    if (!googleToken) return;
    
    // Explicit User Confirmation before destructive operation (MANDATORY guideline)
    const promptMessage = lang === 'en'
      ? `🚨 SECURITY ACTION REQUIRED 🚨\nAre you sure you want to permanently delete "${name}" from your BMSICL Google Drive Vault?\nThis action cannot be undone.`
      : `🚨 सुरक्षा कार्रवाई आवश्यक है 🚨\nक्या आप वास्तव में अपने BMSICL गूगल ड्राइव वॉल्ट से "${name}" को स्थायी रूप से हटाना चाहते हैं?\nयह कार्रवाई वापस नहीं ली जा सकती।`;

    if (window.confirm(promptMessage)) {
      setLoading(true);
      setVaultStatus(lang === 'en' ? `Deleting "${name}"...` : `"${name}" हटाया जा रहा है...`);
      try {
        await deleteDriveFile(fileId, googleToken);
        setVaultStatus(lang === 'en' ? `Successfully deleted "${name}"` : `"${name}" सफलतापूर्वक हटा दिया गया है`);
        // Reload List
        const files = await listGoogleDriveFiles(googleToken, folderId);
        setDriveFiles(files);
      } catch (err: any) {
        console.error(err);
        setVaultStatus(lang === 'en' ? `Error deleting file: ${err.message}` : `फ़ाइल हटाने में त्रुटि: ${err.message}`);
      } finally {
        setLoading(false);
        setTimeout(() => setVaultStatus(''), 4000);
      }
    }
  };

  // Pull / restore tenders data from Drive Backup
  const handleRestoreFromDriveFile = async (fileId: string, name: string) => {
    if (!googleToken) return;

    const confirmRestore = window.confirm(
      lang === 'en'
        ? `⚠️ RESTORE WARNING ⚠️\nDo you want to restore the ledger from "${name}"?\nThis will overwrite your unsaved active memory storage with the backup content.`
        : `⚠️ पुनर्स्थापना चेतावनी ⚠️\nक्या आप "${name}" से लेजर डेटा पुनर्स्थापित करना चाहते हैं?\nयह आपके सक्रिय मेमोरी स्टोरेज रिकॉर्ड को बैकअप सामग्री से बदल देगा।`
    );

    if (!confirmRestore) return;

    setLoading(true);
    setVaultStatus(lang === 'en' ? 'Fetching spreadsheet from Drive...' : 'ड्राइव से स्प्रेडशीट प्राप्त की जा रही है...');
    try {
      const resp = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${googleToken}` }
      });

      if (!resp.ok) {
        throw new Error('Failed to retrieve file contents from Google API');
      }

      const fileExtension = name.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'json') {
        const textStr = await resp.text();
        const dataArr = JSON.parse(textStr);
        if (Array.isArray(dataArr)) {
          onImportTenders(dataArr);
          setVaultStatus(lang === 'en' ? `Successfully restored ${dataArr.length} records!` : `${dataArr.length} रिकॉर्ड सफलतापूर्वक बहाल कर दिए गए!`);
        } else {
          throw new Error('JSON is not in a validated list format.');
        }
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls' || fileExtension === 'csv') {
        const arrayBuffer = await resp.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows = XLSX.utils.sheet_to_json<any>(worksheet, { defval: "" });

        if (rawRows.length === 0) {
          throw new Error('Retrieved spreadsheet contains no parseable rows.');
        }

        // Map excel data using synonyms match intelligently
        const mapped: Tender[] = rawRows.map((row, index) => {
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

          return {
            id: `restored-t-${Date.now()}-${index}`,
            slNo: sl ? parseInt(sl) : (index + 1),
            department: dept || 'Procurement',
            tenderNo: tNo || `ME-EMP-${index + 100}`,
            equipmentName: equip || `Restored Equipment ${index + 1}`,
            openedDate: opDate || '',
            endDate: eDate || '',
            statusText: status || 'Restored',
            manager: mgr || 'Girish',
            preBidMeeting: 'Completed',
            tscMeeting: 'Completed',
            technicalOpening: 'Completed',
            bidderName: 'Restored Grid',
            noOfBidders: 3,
            tecMeeting: 'Completed',
            postTecMeeting: 'Completed',
            tec2Meeting: 'N/A',
            demoMeeting: 'Completed',
            postDemoMeeting: 'Completed',
            financialOpening: 'Compiled',
            priceJustificationMeeting: 'N/A',
            awardOfContract: 'Completed',
            agreement: 'In Force'
          };
        });

        onImportTenders(mapped);
        setVaultStatus(lang === 'en' ? `Restored ${mapped.length} tenders successfully!` : `${mapped.length} निविदाएं सफलतापूर्वक बहाल की गईं!`);
      } else {
        throw new Error('Format must be .xlsx, .xls, .csv, or .json file');
      }
    } catch (err: any) {
      console.error(err);
      setVaultStatus(lang === 'en' ? `Restore failed: ${err.message}` : `बहाली विफल रही: ${err.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setVaultStatus(''), 5000);
    }
  };

  const getFormatIcon = (mimeType: string, filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (mimeType.includes('spreadsheet') || ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
      return <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />;
    }
    if (mimeType.includes('document') || ext === 'docx' || ext === 'doc' || ext === 'json' || ext === 'txt') {
      return <FileText className="w-4 h-4 text-blue-500 shrink-0" />;
    }
    return <FolderGit className="w-4 h-4 text-amber-500 shrink-0" />;
  };

  const formatSize = (bytes: any) => {
    if (!bytes) return '—';
    const num = parseInt(bytes);
    if (isNaN(num)) return bytes;
    if (num < 1024) return `${num} B`;
    if (num < 1048576) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / 1048576).toFixed(1)} MB`;
  };

  const formatTime = (timeStr: string) => {
    try {
      const d = new Date(timeStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeStr;
    }
  };

  return (
    <div id="google-drive-hub-panel" className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 p-5 rounded-2xl shadow-sm space-y-4 select-none no-print">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/45 text-blue-600 dark:text-blue-400">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
              {lang === 'en' ? 'Google Drive Secure Vault' : 'गूगल ड्राइव सुरक्षित वॉल्ट'}
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
              {lang === 'en' ? 'BMSICL Cloud Integration Console' : 'BMSICL क्लाउड एकीकरण कंसोल'}
            </p>
          </div>
        </div>

        {/* Auth / Connection State */}
        <div>
          {googleToken ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/35 text-emerald-800 dark:text-emerald-400 text-3xs font-extrabold uppercase border border-emerald-100 dark:border-emerald-900/30">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{lang === 'en' ? 'Active Sync' : 'सक्रिय सिंक'}</span>
              </span>
              <button
                id="btn-disconnect-gdrive-session"
                onClick={onDisconnectGoogle}
                className="text-3xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/20 px-2 py-1 rounded border border-rose-100 dark:border-rose-900/30 transition-all hover:scale-[1.03]"
                title={googleUser?.email || ''}
              >
                {lang === 'en' ? 'Disconnect' : 'डिस्कनेक्ट'}
              </button>
            </div>
          ) : (
            <button
              id="btn-connect-gdrive-session"
              onClick={onConnectGoogle}
              className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-750 transition-all active:scale-[0.98]"
            >
              <CloudLightning className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Connect Google Drive' : 'गूगल ड्राइव कनेक्ट करें'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main drive controls when authenticated */}
      {googleToken ? (
        <div className="space-y-4">
          
          {/* Action buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Backup Excel */}
            <button
              id="btn-backup-tenders-excel-drive"
              onClick={handleBackupTendersToDrive}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 hover:from-emerald-500/15 hover:to-emerald-600/10 border border-emerald-250/50 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 p-3 rounded-xl transition-all cursor-pointer font-bold duration-250 group disabled:opacity-50"
            >
              <DatabaseBackup className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <span className="block text-xs font-black">{lang === 'en' ? 'Full Excel Backup' : 'पूर्ण एक्सेल बैकअप'}</span>
                <span className="block text-[9px] text-emerald-600 dark:text-emerald-450 font-normal mt-0.5">
                  {lang === 'en' ? 'Mirror current ledger sheet' : 'वर्तमान लेजर शीट को सिंक करें'}
                </span>
              </div>
            </button>

            {/* Backup JSON */}
            <button
              id="btn-backup-tenders-json-drive"
              onClick={handleBackupJsonToDrive}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-gradient-to-br from-blue-500/10 to-blue-600/5 hover:from-blue-500/15 hover:to-blue-600/10 border border-blue-250/50 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 p-3 rounded-xl transition-all cursor-pointer font-bold duration-250 group disabled:opacity-50"
            >
              <Cloud className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <span className="block text-xs font-black">{lang === 'en' ? 'Consolidated JSON Dump' : 'एकीकृत JSON डंप'}</span>
                <span className="block text-[9px] text-blue-600 dark:text-blue-450 font-normal mt-0.5">
                  {lang === 'en' ? 'Developer-grade direct schema backup' : 'डेवलपर-ग्रेड डायरेक्ट स्कीमा बैकअप'}
                </span>
              </div>
            </button>
          </div>

          {/* Interactive Drag Drop File Upload Panel */}
          <div className="space-y-2">
            <span className="text-3xs font-extrabold uppercase tracking-widest text-slate-400 block">
              {lang === 'en' ? 'Live File Uploader & Tender Association' : 'लाइव फाइल अपलोडर और निविदा संघ'}
            </span>
            <div className="flex gap-2">
              <select
                id="select-uploader-tender-assoc"
                value={selectedTenderId}
                onChange={(e) => setSelectedTenderId(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                <option value="">{lang === 'en' ? '⚠️ General Upload (No tender linking)' : '⚠️ सामान्य अपलोड (कोई निविदा लिंक नहीं)'}</option>
                {tenders.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.tenderNo.slice(0, 18)}... (Sl. {t.slNo}) - {t.equipmentName.slice(0, 30)}
                  </option>
                ))}
              </select>

              <button
                id="btn-upload-trigger-interactive"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Select File' : 'फाइल चुनें'}</span>
              </button>
              <input
                id="gdrive-file-picker-input"
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Drag drop zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${isDragging ? 'border-emerald-500 bg-emerald-50/15 text-emerald-500' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/20 text-slate-400'}`}
            >
              <p className="text-3xs font-bold leading-relaxed">
                {lang === 'en' 
                  ? 'Drag & drop scanned file/specification document here to upload directly to BMSICL Drive folder' 
                  : 'स्कैन की गई फ़ाइल/विशिष्टता दस्तावेज़ को यहाँ खींचें और छोड़ें ताकि वह सीधे BMSICL ड्राइव फ़ोल्डर में अपलोड हो जाए'}
              </p>
            </div>
          </div>

          {/* Status Message */}
          {(vaultStatus || uploadProgress) && (
            <div className="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2 text-2xs font-semibold text-slate-700 dark:text-slate-300">
                {uploadProgress ? (
                  <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin shrink-0" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                )}
                <span>{uploadProgress || vaultStatus}</span>
              </div>
              <button
                onClick={() => setVaultStatus('')}
                className="text-slate-400 hover:text-slate-500 text-3xs font-bold px-1.5 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Repository Files List */}
          <div className="space-y-2">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/30 p-2 rounded-lg">
              <span className="text-3xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <FolderGit className="w-3 h-3 text-slate-400" />
                <span>{lang === 'en' ? 'BMSICL Ledger Cloud Storage' : 'BMSICL लेजर क्लाउड स्टोरेज'} ({driveFiles.length})</span>
              </span>
              <button
                id="btn-refresh-drive-list"
                onClick={loadDriveData}
                disabled={loading}
                className="p-1 rounded bg-white dark:bg-slate-850 hover:bg-slate-100 text-slate-500 hover:text-slate-700 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/60 shadow-xs active:scale-95 duration-200 cursor-pointer"
                title="Refresh Drive Repository"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loading && driveFiles.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-2 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="text-3xs font-medium uppercase tracking-wider">Retrieving Drive ledger vault...</span>
              </div>
            ) : driveFiles.length === 0 ? (
              <div className="text-center py-6 border border-slate-100 dark:border-slate-850 rounded-xl bg-slate-50/40 dark:bg-slate-950/15">
                <Cloud className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-xs font-semibold text-slate-400 mt-2">
                  {lang === 'en' ? 'BMSICL Storage is Empty.' : 'BMSICL स्टोरेज खाली है।'}
                </p>
                <p className="text-3xs text-slate-400 mt-0.5 px-3">
                  Upload files or perform spreadsheet backups above to populate your secure cloud database.
                </p>
              </div>
            ) : (
              <div className="max-h-[250px] overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                {driveFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex justify-between items-center p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 hover:border-slate-250 dark:hover:border-slate-800 transition-all hover:bg-slate-50/50 dark:hover:bg-slate-950/10 gap-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {getFormatIcon(file.mimeType, file.name)}
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate leading-tight" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-3xs font-mono text-slate-400 mt-0.5 flex gap-1.5">
                          <span>{formatSize(file.size)}</span>
                          <span>•</span>
                          <span>{formatTime(file.createdTime)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Restore option if spreadsheet */}
                      {(file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.json')) && (
                        <button
                          onClick={() => handleRestoreFromDriveFile(file.id, file.name)}
                          className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-900/40 font-black px-2 py-0.5 rounded transition-all shrink-0 uppercase tracking-tight flex items-center gap-0.5"
                          title="Restore Database Layout from Backup"
                        >
                          <Download className="w-2.5 h-2.5" />
                          <span>Restore</span>
                        </button>
                      )}

                      {/* Web view link */}
                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-500 transition-all shrink-0"
                          title="Open in Google Drive"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {/* Delete option */}
                      <button
                        onClick={() => handleDeleteFile(file.id, file.name)}
                        className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-600 transition-all shrink-0"
                        title="Delete permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-950/30 p-6 rounded-2xl text-center space-y-3">
          <Cloud className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto animate-pulse" />
          <div className="space-y-1 max-w-sm mx-auto">
            <h4 className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">
              {lang === 'en' ? 'Drive Integration Pending Activation' : 'ड्राइव एकीकरण सक्रियण लंबित है'}
            </h4>
            <p className="text-[11px] text-slate-400 px-1 leading-relaxed">
              {lang === 'en' 
                ? 'Authenticate your Google Account to enable live cloud ledger reports backups, Specification Sheets linking, and permanent file attachments.' 
                : 'क्लाउड लेजर रिपोर्ट बैकअप, विशिष्टता पत्रक लिंकिंग, और स्थायी फ़ाइल अनुलग्नकों को सक्षम करने के लिए अपने Google खाते को प्रमाणित करें।'}
            </p>
          </div>

          <button
            id="gdrive-oauth-connect-prompt"
            onClick={onConnectGoogle}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 duration-200 font-bold text-white text-xs px-4 py-2 rounded-xl shadow-sm active:scale-95 select-none shrink-0"
          >
            <CloudLightning className="w-4 h-4" />
            <span>{lang === 'en' ? 'Activate Sync Connection' : 'सिंक कनेक्शन सक्रिय करें'}</span>
          </button>
        </div>
      )}

      {/* Vault Info footer */}
      <div className="flex justify-between items-center text-3xs font-medium text-slate-400 pt-1">
        <span>🔒 Secure Endpoint OAuth standard</span>
        <span>v1.0.2 Cloud</span>
      </div>
    </div>
  );
}
