/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Language } from './types';

export const translations = {
  en: {
    appTitle: 'RJ95 Equipment Info App',
    subTitle: 'BMSICL Tender Status Management',
    govtHeader: 'GOVERNMENT OF BIHAR - BIHAR MEDICAL SERVICES & INFRASTRUCTURE CORPORATION LTD.',
    loginTitle: 'Secure Portal Access',
    usernameLabel: 'Username / Email ID',
    passwordLabel: 'Security Password',
    loginButton: 'Sign In securely',
    loginPrompt: 'Please log in with your administrative credentials to manage or edit BMSICL Tenders.',
    guestLogin: 'Quick View (Bypass)',
    loginError: 'Access Denied: Please use Username: BMSICL and Password: 1234.',
    roleAdmin: 'Administrator',
    roleOfficer: 'Procurement Officer',
    roleGuest: 'Guest viewer',

    // Dashboard Cards
    totalTenders: 'Total Equipment Tenders',
    agreementsSigned: 'Signed Agreements',
    stagesCompleted: 'Completed Openings',
    averageBidders: 'Avg. Bidders per Tender',
    addTender: 'Add Equipment Tender',
    searchPlaceholder: 'Search Tender No. or Equipment Name...',
    entriesCount: 'Showing {count} tender entries',
    offlineBadge: 'Offline Local Save Active',

    // Filters
    allStatus: 'All Statuses',
    onlyActive: 'Only Active Agreements',
    onlyUpcoming: 'Show Pre-Bid & TSC Stage',
    filterByState: 'Filter by Milestone Stage',
    resetFilters: 'Clear Filters',

    // Layout views
    mobileEmul: 'Android Layout Emulator',
    fullWidthView: 'Full Desktop Layout',
    switchMode: 'Device Mode',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    langToggle: 'हिन्दी',

    // Column translations
    slNo: 'Sl No.',
    department: 'Department',
    tenderNo: 'Tender No.',
    equipmentName: 'Equipment Name',
    openedDate: 'Opened Date',
    endDate: 'End Date',
    statusText: 'Current Status',
    manager: 'Manager',
    preBidMeeting: 'Pre-Bid Meeting',
    tscMeeting: 'TSC Meeting',
    technicalOpening: 'Technical Opening',
    bidderName: 'Bidder Name',
    noOfBidders: 'No. of Bidders',
    tecMeeting: 'TEC Meeting',
    postTecMeeting: 'Post TEC Meeting',
    tec2Meeting: 'TEC.2 Meeting',
    demoMeeting: 'Demo Meeting',
    postDemoMeeting: 'Post Demo Meeting',
    financialOpening: 'Financial Opening',
    priceJustificationMeeting: 'Price Justification',
    awardOfContract: 'Award of Contract',
    agreement: 'Agreement / MOU',

    // Actions & Buttons
    editRow: 'Edit Row',
    deleteRow: 'Delete',
    cancel: 'Cancel',
    saveChanges: 'Save Changes',
    addNewRow: 'Add New Record',
    confirmDelete: 'Are you sure you want to delete this equipment tender record?',
    successDelete: 'Tender deleted successfully.',
    successSave: 'Tender data saved and synchronized.',
    exportPdf: 'Export to PDF',
    exportCsv: 'Export to Excel',
    printReport: 'Print Report',

    // Stages category groupings for modal
    stageGeneral: '1. General & Bidders Info',
    stageTSC: '2. Pre-Bid & TSC Stage',
    stageTEC: '3. Technical Evaluation & Demo',
    stageFinancial: '4. Financial & Contract Signing'
  },
  hi: {
    appTitle: 'आर्जे95 उपकरण सूचना ऐप',
    subTitle: 'BMSICL निविदा स्थिति प्रबंधन',
    govtHeader: 'बिहार सरकार - बिहार चिकित्सा सेवाएं एवं बुनियादी ढांचा निगम लिमिटेड (BMSICL)',
    loginTitle: 'सुरक्षित पोर्टल लॉगिन',
    usernameLabel: 'उपयोगकर्ता नाम / ईमेल आईडी',
    passwordLabel: 'सुरक्षा पासवर्ड',
    loginButton: 'सुरक्षित प्रवेश करें',
    loginPrompt: 'BMSICL निविदाओं को प्रबंधित या संपादित करने के लिए कृपया अपने प्रशासनिक क्रेडेंशियल्स के साथ लॉगिन करें।',
    guestLogin: 'त्वरित दर्शन (बायपास)',
    loginError: 'प्रवेश अस्वीकृत: कृपया उपयोगकर्ता नाम: BMSICL और पासवर्ड: 1234 का उपयोग करें।',
    roleAdmin: 'प्रशासक',
    roleOfficer: 'खरीद अधिकारी',
    roleGuest: 'अतिथि दर्शक',

    // Dashboard Cards
    totalTenders: 'कुल उपकरण निविदाएं',
    agreementsSigned: 'हस्ताक्षरित समझौते (MOU)',
    stagesCompleted: 'पूर्ण तकनीकी ओपनिंग',
    averageBidders: 'औसत बोलीदाता प्रति निविदा',
    addTender: 'नया उपकरण निविदा जोड़ें',
    searchPlaceholder: 'निविदा संख्या या उपकरण का नाम खोजें...',
    entriesCount: 'कुल {count} निविदा प्रविष्टियां दिखाई दे रही हैं',
    offlineBadge: 'ऑफ़लाइन लोकल सुरक्षित मोड सक्रिय',

    // Filters
    allStatus: 'सभी स्थिति',
    onlyActive: 'केवल सक्रिय समझौते',
    onlyUpcoming: 'केवल प्री-बिड और टीएससी चरण',
    filterByState: 'मील का पत्थर चरण फ़िल्टर',
    resetFilters: 'फ़िल्टर साफ़ करें',

    // Layout views
    mobileEmul: 'एंड्रॉइड लेआउट एमुलेटर',
    fullWidthView: 'पूर्ण डेस्कटॉप लेआउट',
    switchMode: 'डिवाइस मोड बदलें',
    darkMode: 'डार्क मोड',
    lightMode: 'लाइट मोड',
    langToggle: 'English',

    // Column translations
    slNo: 'क्रम संख्या',
    department: 'विभाग',
    tenderNo: 'निविदा संख्या',
    equipmentName: 'उपकरण का नाम',
    openedDate: 'खोलने की तिथि',
    endDate: 'अंतिम तिथि',
    statusText: 'वर्तमान स्थिति',
    manager: 'प्रबंधक',
    preBidMeeting: 'प्री-बिड बैठक',
    tscMeeting: 'टीएससी बैठक',
    technicalOpening: 'तकनीकी ओपनिंग',
    bidderName: 'बोलीदाता का नाम',
    noOfBidders: 'बोलीदाताओं की संख्या',
    tecMeeting: 'टीईसी बैठक',
    postTecMeeting: 'पोस्ट टीईसी बैठक',
    tec2Meeting: 'टीईसी.2 बैठक',
    demoMeeting: 'डेमो बैठक',
    postDemoMeeting: 'पोस्ट डेमो बैठक',
    financialOpening: 'वित्तीय ओपनिंग',
    priceJustificationMeeting: 'मूल्य औचित्य',
    awardOfContract: 'अनुबंध की स्वीकृति',
    agreement: 'समझौता / अनुबंध पत्र',

    // Actions & Buttons
    editRow: 'पंक्ति बदलें',
    deleteRow: 'हटाएं',
    cancel: 'रद्द करें',
    saveChanges: 'परिवर्तन सुरक्षित करें',
    addNewRow: 'नया रिकॉर्ड जोड़ें',
    confirmDelete: 'क्या आप वाकई इस उपकरण निविदा रिकॉर्ड को हटाना चाहते हैं?',
    successDelete: 'निविदा सफलतापूर्वक हटा दी गई।',
    successSave: 'निविदा डेटा सुरक्षित और सिंक किया गया।',
    exportPdf: 'पीडीएफ निर्यात',
    exportCsv: 'एक्सेल में निर्यात',
    printReport: 'प्रिंट रिपोर्ट',

    // Stages category groupings for modal
    stageGeneral: '1. सामान्य एवं बोलीदाता जानकारी',
    stageTSC: '2. प्री-बिड और टीएससी चरण',
    stageTEC: '3. तकनीकी मूल्यांकन और डेमो',
    stageFinancial: '4. वित्तीय और अनुबंध हस्ताक्षर'
  }
};

export function getTranslation(lang: Language, key: keyof typeof translations['en']): string {
  return translations[lang][key] || translations['en'][key] || String(key);
}
