/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Tender, Language } from '../types';
import { getTranslation } from '../localization';

// Utility helper to escape HTML entities for the Word report
const escapeHtml = (text: string | null | undefined): string => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * EXPORT 1: EXCEL (.xlsx)
 * Leverages SheetJS to construct a high-fidelity workbook with Bihar Government headers, 
 * report generation dates, total records counted, and proper custom auto-fit columns.
 */
export const exportToExcel = (tenders: Tender[], lang: Language) => {
  const isHindi = lang === 'hi';
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  // 1. Structural Header Information in official government layout
  const excelData = [
    [isHindi ? 'बिहार सरकार' : 'GOVERNMENT OF BIHAR'],
    [isHindi ? 'बिहार चिकित्सा सेवा एवं बुनियादी ढांचा निगम लिमिटेड (BMSICL)' : 'BIHAR MEDICAL SERVICES & INFRASTRUCTURE CORPORATION LTD. (BMSICL)'],
    [isHindi ? 'उपकरण निविदा मील का पत्थर चरण अनुवर्ती रिपोर्ट' : 'RJ95 Equipment Tender Milestones Tracking Status Ledger'],
    [`${isHindi ? 'रिपोर्ट तैयार होने का समय (IST):' : 'Report Generated On:'} ${timestamp} (IST)`],
    [`${isHindi ? 'कुल निविदा रिकॉर्ड्स की संख्या:' : 'Total Active Records:'} ${tenders.length}`],
    [], // Blank spacer row
    // 2. Headings Row
    [
      isHindi ? 'क्र.सं.' : 'Sl. No.',
      getTranslation(lang, 'tenderNo'),
      getTranslation(lang, 'equipmentName'),
      getTranslation(lang, 'preBidMeeting'),
      getTranslation(lang, 'tscMeeting'),
      getTranslation(lang, 'technicalOpening'),
      getTranslation(lang, 'bidderName'),
      getTranslation(lang, 'noOfBidders'),
      getTranslation(lang, 'tecMeeting'),
      getTranslation(lang, 'postTecMeeting'),
      getTranslation(lang, 'tec2Meeting'),
      getTranslation(lang, 'demoMeeting'),
      getTranslation(lang, 'postDemoMeeting'),
      getTranslation(lang, 'financialOpening'),
      getTranslation(lang, 'priceJustificationMeeting'),
      getTranslation(lang, 'awardOfContract'),
      getTranslation(lang, 'agreement')
    ],
    // 3. Actual Data Streams
    ...tenders.map((t, idx) => [
      idx + 1,
      t.tenderNo,
      t.equipmentName,
      t.preBidMeeting || '-',
      t.tscMeeting || '-',
      t.technicalOpening || '-',
      t.bidderName || '-',
      t.noOfBidders ?? 0,
      t.tecMeeting || '-',
      t.postTecMeeting || '-',
      t.tec2Meeting || '-',
      t.demoMeeting || '-',
      t.postDemoMeeting || '-',
      t.financialOpening || '-',
      t.priceJustificationMeeting || '-',
      t.awardOfContract || '-',
      t.agreement || '-'
    ])
  ];

  // Create workspace worksheet
  const ws = XLSX.utils.aoa_to_sheet(excelData);

  // Set highly professional column width constraints
  ws['!cols'] = [
    { wch: 8 },  // Sl No
    { wch: 18 }, // Tender No
    { wch: 35 }, // Equipment Name
    { wch: 15 }, // Pre-Bid
    { wch: 15 }, // TSC
    { wch: 15 }, // Tech Opening
    { wch: 25 }, // Bidder Name
    { wch: 12 }, // No of Bidders
    { wch: 15 }, // TEC
    { wch: 15 }, // Post TEC
    { wch: 15 }, // TEC 2
    { wch: 15 }, // Demo
    { wch: 15 }, // Post Demo
    { wch: 15 }, // Financial Opening
    { wch: 18 }, // Price Justification
    { wch: 18 }, // Award of Contract
    { wch: 18 }  // Agreement / Contract Form
  ];

  // Create workbook and append sheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, isHindi ? 'निविदा रिपोर्ट' : 'Tender Stages Ledger');

  // Trigger download automatically
  const fileName = `BMSICL_RJ95_Tenders_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

/**
 * EXPORT 2: PDF (.pdf)
 * Uses high-contrast professional styling conforming to the selected app-wide layout language.
 * Uses landside A3 specification to allow wide multi-milestone tracking grids to fit comfortably.
 */
export const exportToPDF = (tenders: Tender[], lang: Language) => {
  const isHindi = lang === 'hi';
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  // PDF settings - A3 landscape gives spacious rendering to prevent squeezing 16 milestone columns
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a3'
  }) as any;

  // Header column strings
  const headers = [
    isHindi ? 'क्र.सं.' : 'Sl. No.',
    getTranslation(lang, 'tenderNo'),
    getTranslation(lang, 'equipmentName'),
    getTranslation(lang, 'preBidMeeting'),
    getTranslation(lang, 'tscMeeting'),
    getTranslation(lang, 'technicalOpening'),
    getTranslation(lang, 'bidderName'),
    isHindi ? 'बोलीदाता' : 'Bidders',
    getTranslation(lang, 'tecMeeting'),
    getTranslation(lang, 'postTecMeeting'),
    getTranslation(lang, 'tec2Meeting'),
    getTranslation(lang, 'demoMeeting'),
    getTranslation(lang, 'postDemoMeeting'),
    getTranslation(lang, 'financialOpening'),
    isHindi ? 'मूल्य औचित्य' : 'Price Just.',
    getTranslation(lang, 'awardOfContract'),
    getTranslation(lang, 'agreement')
  ];

  // Row formatting and string mappings
  const dataRows = tenders.map((t, idx) => [
    String(idx + 1),
    t.tenderNo,
    t.equipmentName,
    t.preBidMeeting || '-',
    t.tscMeeting || '-',
    t.technicalOpening || '-',
    t.bidderName || '-',
    String(t.noOfBidders),
    t.tecMeeting || '-',
    t.postTecMeeting || '-',
    t.tec2Meeting || '-',
    t.demoMeeting || '-',
    t.postDemoMeeting || '-',
    t.financialOpening || '-',
    t.priceJustificationMeeting || '-',
    t.awardOfContract || '-',
    t.agreement || '-'
  ]);

  // Use the autoTable plugin
  doc.autoTable({
    head: [headers],
    body: dataRows,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 1.8,
      font: 'helvetica',
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [30, 58, 138], // Government Navy (blue-900)
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' }, // Sl. No.
      1: { cellWidth: 22 }, // Tender No
      2: { cellWidth: 38 }, // Equipment Name
      3: { cellWidth: 16 }, // Pre-Bid
      4: { cellWidth: 16 }, // TSC
      5: { cellWidth: 18 }, // Tech Opening
      6: { cellWidth: 24 }, // Bidder Name
      7: { cellWidth: 12, halign: 'center' }, // No. of Bidders
      8: { cellWidth: 16 }, // TEC
      9: { cellWidth: 16 }, // Post TEC
      10: { cellWidth: 16 }, // TEC 2
      11: { cellWidth: 16 }, // Demo
      12: { cellWidth: 16 }, // Post Demo
      13: { cellWidth: 18 }, // Financial Opening
      14: { cellWidth: 18 }, // Price Just.
      15: { cellWidth: 18 }, // Award of Contract
      16: { cellWidth: 18 }  // Agreement
    },
    margin: { top: 40, bottom: 20, left: 15, right: 15 },
    didDrawPage: (data: any) => {
      // Top Government Branding Title
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59); // slate-800
      doc.setFont('helvetica', 'bold');
      doc.text(isHindi ? 'बिहार सरकार' : 'GOVERNMENT OF BIHAR', data.settings.margin.left, 15);
      
      doc.setFontSize(11);
      doc.text(
        isHindi 
          ? 'बिहार चिकित्सा सेवाएं एवं बुनियादी ढांचा निगम लिमिटेड (BMSICL)' 
          : 'BIHAR MEDICAL SERVICES & INFRASTRUCTURE CORPORATION LTD. (BMSICL)', 
        data.settings.margin.left, 21
      );
      
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(
        isHindi 
          ? 'निविदा स्थिति निगरानी और मील का पत्थर ट्रैकिंग सिस्टम रिपोर्ट' 
          : 'RJ95 Equipment Status Tracking Matrix (16 Key Procurement Stages Progress Ledger)', 
        data.settings.margin.left, 27
      );
      
      const detailsText = isHindi
        ? `रिपोर्ट तैयार होने का समय (IST): ${timestamp} | कुल सक्रिय निविदाएं: ${tenders.length}`
        : `Report Generated: ${timestamp} (IST) | Total Monitored Records: ${tenders.length}`;
      doc.text(detailsText, data.settings.margin.left, 32);
      
      // Bottom confidential status footer
      const str = 'Page ' + doc.getNumberOfPages();
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(str, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10);
      
      const footerNotice = isHindi
        ? 'गोपनीय कार्यालय रिकॉर्ड - BMSICL खरीद विभाग, पटना, बिहार'
        : 'Confidential Official Log - BMSICL Procurement Cell, Patna, Bihar';
      doc.text(footerNotice, data.settings.margin.left, doc.internal.pageSize.height - 10);
    }
  });

  const fileName = `BMSICL_RJ95_Tenders_Summary_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

/**
 * EXPORT 3: WORD (.doc/.docx compat)
 * Compiles a structural, styling-rich XML/HTML package for Microsoft Word.
 * Opens perfectly inside MS Word with exact styles, colors, layouts, and print setups.
 */
export const exportToWord = (tenders: Tender[], lang: Language) => {
  const isHindi = lang === 'hi';
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const govtTitle = isHindi ? 'बिहार सरकार' : 'GOVERNMENT OF BIHAR';
  const corpTitle = isHindi 
    ? 'बिहार चिकित्सा सेवाएं एवं बुनियादी ढांचा निगम लिमिटेड (BMSICL)'
    : 'BIHAR MEDICAL SERVICES & INFRASTRUCTURE CORPORATION LTD. (BMSICL)';
  const docTitle = isHindi 
    ? 'निविदा स्थिति विवरण एवं प्रगति मील का पत्थर रजिस्टर'
    : 'RJ95 Equipment procurement Stage Progress Official Registry';
  const metaText = isHindi
    ? `<b>तैयार तिथि (IST):</b> ${timestamp} | <b>कुल पंजीकृत उपकरण:</b> ${tenders.length} रिकॉर्ड`
    : `<b>Generated:</b> ${timestamp} (IST) | <b>Total Monitored Instruments:</b> ${tenders.length} entries`;
  const officeNotice = isHindi
    ? 'खरीद निदेशक का कार्यालय, BMSICL, पटना, बिहार'
    : 'Office of the Director (Procurement), BMSICL, Patna, Bihar';

  const html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <title>BMSICL Official Tender Report</title>
      <meta charset="utf-8">
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page WordSection1 {
          size: 11in 8.5in; /* US Letter Landscape to fit 16 wide columns gracefully */
          margin: 0.4in 0.4in 0.4in 0.4in;
          mso-header-margin: 0.4in;
          mso-footer-margin: 0.4in;
          mso-paper-source: 0;
        }
        div.WordSection1 {
          page: WordSection1;
        }
        body {
          font-family: Arial, "Helvetica Neue", sans-serif;
          color: #0f172a;
          font-size: 10.5pt;
        }
        .header {
          text-align: center;
          margin-bottom: 25px;
          border-bottom: 3px double #1e3a8a;
          padding-bottom: 12px;
        }
        .dept-title {
          font-size: 10pt;
          font-weight: bold;
          color: #475569;
          text-transform: uppercase;
          margin: 0 0 4px 0;
          letter-spacing: 1.5px;
        }
        .corp-title {
          font-size: 13pt;
          font-weight: bold;
          color: #1e3a8a;
          margin: 0 0 5px 0;
        }
        .doc-title {
          font-size: 14pt;
          font-weight: bold;
          color: #1e293b;
          margin: 0 0 8px 0;
        }
        .metadata {
          font-size: 9.5pt;
          color: #475569;
          margin: 4px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 8pt;
          margin-top: 12px;
        }
        th {
          background-color: #1e3a8a;
          color: #ffffff;
          font-weight: bold;
          border: 1px solid #94a3b8;
          padding: 8px 5px;
          text-align: left;
        }
        td {
          border: 1px solid #cbd5e1;
          padding: 6px 5px;
          vertical-align: top;
        }
        .zebra {
          background-color: #f8fafc;
        }
        .font-mono {
          font-family: "Consolas", "Courier New", monospace;
        }
        .text-center {
          text-align: center;
        }
        .footer {
          margin-top: 35px;
          font-size: 8pt;
          color: #64748b;
          border-top: 1px solid #cbd5e1;
          padding-top: 10px;
          text-align: right;
        }
      </style>
    </head>
    <body>
      <div class="WordSection1">
        <div class="header">
          <p class="dept-title">${escapeHtml(govtTitle)}</p>
          <p class="corp-title">${escapeHtml(corpTitle)}</p>
          <h2 class="doc-title">${escapeHtml(docTitle)}</h2>
          <p class="metadata">${metaText}</p>
          <p class="metadata"><b>${escapeHtml(officeNotice)}</b></p>
        </div>
        
        <table border="1" cellspacing="0" cellpadding="4">
          <thead>
            <tr>
              <th style="width: 3%;">${isHindi ? 'क्र.' : 'Sl.'}</th>
              <th style="width: 8%;">${escapeHtml(getTranslation(lang, 'tenderNo'))}</th>
              <th style="width: 13%;">${escapeHtml(getTranslation(lang, 'equipmentName'))}</th>
              <th style="width: 6%;">${escapeHtml(getTranslation(lang, 'preBidMeeting'))}</th>
              <th style="width: 6%;">${escapeHtml(getTranslation(lang, 'tscMeeting'))}</th>
              <th style="width: 63px;">${escapeHtml(getTranslation(lang, 'technicalOpening'))}</th>
              <th style="width: 10%;">${escapeHtml(getTranslation(lang, 'bidderName'))}</th>
              <th style="width: 3%;">${isHindi ? 'संख्या' : 'Qty'}</th>
              <th style="width: 6%;">${escapeHtml(getTranslation(lang, 'tecMeeting'))}</th>
              <th style="width: 6%;">${escapeHtml(getTranslation(lang, 'postTecMeeting'))}</th>
              <th style="width: 6%;">${escapeHtml(getTranslation(lang, 'tec2Meeting'))}</th>
              <th style="width: 6%;">${escapeHtml(getTranslation(lang, 'demoMeeting'))}</th>
              <th style="width: 6%;">${escapeHtml(getTranslation(lang, 'postDemoMeeting'))}</th>
              <th style="width: 6%;">${escapeHtml(getTranslation(lang, 'financialOpening'))}</th>
              <th style="width: 6%;">${escapeHtml(getTranslation(lang, 'priceJustificationMeeting'))}</th>
              <th style="width: 6%;">${escapeHtml(getTranslation(lang, 'awardOfContract'))}</th>
              <th style="width: 6%;">${escapeHtml(getTranslation(lang, 'agreement'))}</th>
            </tr>
          </thead>
          <tbody>
            ${tenders.map((t, idx) => `
              <tr class="${idx % 2 === 1 ? 'zebra' : ''}">
                <td class="text-center">${idx + 1}</td>
                <td class="font-mono" style="word-break: break-all;"><b>${escapeHtml(t.tenderNo)}</b></td>
                <td><b>${escapeHtml(t.equipmentName)}</b></td>
                <td>${escapeHtml(t.preBidMeeting || '-')}</td>
                <td>${escapeHtml(t.tscMeeting || '-')}</td>
                <td>${escapeHtml(t.technicalOpening || '-')}</td>
                <td>${escapeHtml(t.bidderName || '-')}</td>
                <td class="text-center">${t.noOfBidders ?? 0}</td>
                <td>${escapeHtml(t.tecMeeting || '-')}</td>
                <td>${escapeHtml(t.postTecMeeting || '-')}</td>
                <td>${escapeHtml(t.tec2Meeting || '-')}</td>
                <td>${escapeHtml(t.demoMeeting || '-')}</td>
                <td>${escapeHtml(t.postDemoMeeting || '-')}</td>
                <td>${escapeHtml(t.financialOpening || '-')}</td>
                <td>${escapeHtml(t.priceJustificationMeeting || '-')}</td>
                <td>${escapeHtml(t.awardOfContract || '-')}</td>
                <td>${escapeHtml(t.agreement || '-')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>${isHindi ? 'यह एक कंप्यूटर-जनरेटेड आधिकारिक कार्यालय रिपोर्ट है।' : 'This is a secure system-generated procurement report.'}</p>
          <p>&copy; BMSICL, Bihar Government Division</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  const fileName = `BMSICL_RJ95_Tenders_Office_Registry_${new Date().toISOString().split('T')[0]}.doc`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * EXPORT 4: PRINT LEDGER
 * Simple utility function to print current list content natively as a clean page record.
 */
export const printTenders = () => {
  window.print();
};
