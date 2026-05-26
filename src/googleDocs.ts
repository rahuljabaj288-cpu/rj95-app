/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Tender } from '../types';

interface Range {
  startIndex: number;
  endIndex: number;
}

/**
 * Dynamically computes Gov-standard text layouts and applies fine-grained Google Docs styles
 */
export async function createTenderGoogleDoc(tender: Tender, accessToken: string): Promise<string> {
  const title = `BMSICL Tender Progress - ${tender.tenderNo} - ${tender.equipmentName.slice(0, 30)}`;
  
  // Create empty document
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Google Docs Creation Failed: ${errorText}`);
  }

  const doc = await createRes.json();
  const documentId = doc.documentId;

  // Build the rich formatted text
  const deptHeader = "BIHAR MEDICAL SERVICES AND INFRASTRUCTURE CORPORATION LIMITED";
  const subDeptHeader = "Department of Health, Government of Bihar (Patna, India)";
  const docSubtitle = "OFFICIAL PROCUREMENT STATUS & MILESTONES LEDGER";
  
  const sec1Title = "1. TENDER METADATA IDENTIFICATION";
  const sec1Content = `Tender Reference ID: ${tender.tenderNo}\nEquipment Monitored: ${tender.equipmentName}\nStatus Generation Date: ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}`;

  const sec2Title = "2. CHRONOLOGICAL MILESTONES MONITORING";
  const sec2Content = `• Pre-Bid Meeting Schedule:     ${tender.preBidMeeting || 'Lapsed / Not Required'}\n• Tender Committee Meeting (TSC):   ${tender.tscMeeting || 'Awaiting Schedule'}\n• Technical Opening Milestone:    ${tender.technicalOpening || 'Awaiting Progress'}\n• Technical Evaluation (TEC):      ${tender.tecMeeting || 'Pending Evaluation'}\n• Technical Evaluation 2 Meeting:  ${tender.tec2Meeting || 'N/A'}\n• Post-TEC Discussion Phase:       ${tender.postTecMeeting || 'N/A'}\n• Live Equipment Demonstration:    ${tender.demoMeeting || 'Awaiting Demo'}\n• Post-Demonstration Audit:       ${tender.postDemoMeeting || 'N/A'}\n• Financial Bid Opening Status:    ${tender.financialOpening || 'Pending Technical Clearance'}\n• Price Justification Discussion:  ${tender.priceJustificationMeeting || 'Pending Completion'}\n• Final Award of Contract (AoC):  ${tender.awardOfContract || 'Awaiting Contractual Approval'}\n• Agreement Status:               ${tender.agreement || 'In Draft'}`;

  const sec3Title = "3. REGULATORY AUDIT & SECURITY PROTOCOL";
  const sec3Content = "This document represents a certified electronic mirror of the BMSICL milestone tracking registry. Chronological milestones are secured under official healthcare audit guidelines. Changes to milestones can only be initiated by the assigned Procurement Officers or Administrators.";

  // Assemble the completed body text
  const textBlocks = [
    deptHeader,
    subDeptHeader,
    docSubtitle,
    "\n",
    sec1Title,
    sec1Content,
    "\n",
    sec2Title,
    sec2Content,
    "\n",
    sec3Title,
    sec3Content,
    "\n------------------------------------------------------------\nBMSICL IT Division • Sealed Security Network System\n------------------------------------------------------------"
  ];

  const fullText = textBlocks.join("\n");

  // Helper to find range with correct index translation
  const findSubRange = (sub: string): Range | null => {
    const idx = fullText.indexOf(sub);
    if (idx === -1) return null;
    return {
      startIndex: idx + 1, // Docs API uses 1-based indexing
      endIndex: idx + sub.length + 1
    };
  };

  const requests: any[] = [
    // Insert all text at the beginning
    {
      insertText: {
        text: fullText,
        location: { index: 1 },
      }
    }
  ];

  // Apply Document Styling - BMSICL Brand Navy (#1e3a8a)
  const navyColor = {
    color: {
      rgbColor: {
        red: 0.117,
        green: 0.227,
        blue: 0.541
      }
    }
  };

  const tealColor = {
    color: {
      rgbColor: {
        red: 0.05,
        green: 0.45,
        blue: 0.45
      }
    }
  };

  // 1. Style Department Title
  const deptRange = findSubRange(deptHeader);
  if (deptRange) {
    requests.push({
      updateTextStyle: {
        range: deptRange,
        textStyle: {
          bold: true,
          fontSize: { size: 14, unit: 'PT' },
          foregroundColor: navyColor,
          fontFamily: 'Arial',
        },
        fields: 'bold,fontSize,foregroundColor,fontFamily'
      }
    });
  }

  // 2. Style Sub-header
  const subDeptRange = findSubRange(subDeptHeader);
  if (subDeptRange) {
    requests.push({
      updateTextStyle: {
        range: subDeptRange,
        textStyle: {
          italic: true,
          fontSize: { size: 10, unit: 'PT' },
          foregroundColor: { color: { rgbColor: { red: 0.4, green: 0.4, blue: 0.4 } } },
        },
        fields: 'italic,fontSize,foregroundColor'
      }
    });
  }

  // 3. Style Doc Subtitle
  const subRange = findSubRange(docSubtitle);
  if (subRange) {
    requests.push({
      updateTextStyle: {
        range: subRange,
        textStyle: {
          bold: true,
          fontSize: { size: 11, unit: 'PT' },
          foregroundColor: tealColor,
        },
        fields: 'bold,fontSize,foregroundColor'
      }
    });
  }

  // 4. Style Section Headers
  [sec1Title, sec2Title, sec3Title].forEach(hdr => {
    const r = findSubRange(hdr);
    if (r) {
      requests.push({
        updateTextStyle: {
          range: r,
          textStyle: {
            bold: true,
            fontSize: { size: 12, unit: 'PT' },
            foregroundColor: navyColor,
          },
          fields: 'bold,fontSize,foregroundColor'
        }
      });
    }
  });

  // Bulk update API call
  const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
  });

  if (!updateRes.ok) {
    const errorText = await updateRes.text();
    throw new Error(`Google Docs Formatting Failed: ${errorText}`);
  }

  return documentId;
}

/**
 * Creates a complete consolidated Ledger Summary containing all tenders
 */
export async function createFullTendersSummaryGoogleDoc(tenders: Tender[], accessToken: string): Promise<string> {
  const title = `BMSICL Tenders Master Ledger Summary`;
  
  // Create document
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });

  if (!createRes.ok) {
    throw new Error('Google Docs master ledger creation failed');
  }

  const doc = await createRes.json();
  const documentId = doc.documentId;

  // Compile full text summary
  let text = "BIHAR MEDICAL SERVICES AND INFRASTRUCTURE CORPORATION LIMITED\n";
  text += "MASTER TENDER LEDGER SUMMARY REPORT\n";
  text += `Generated on: ${new Date().toLocaleString('en-GB')} UTC\n`;
  text += "----------------------------------------------------------------------------------\n\n";

  tenders.forEach((t, i) => {
    text += `${i + 1}. TENDER NO: ${t.tenderNo}\n`;
    text += `   Equipment Name   : ${t.equipmentName}\n`;
    text += `   Bidder / Status  : ${t.bidderName || 'N/A'} (Bidders: ${t.noOfBidders || 0})\n`;
    text += `   Agreement Stage  : ${t.agreement || 'Draft / In-Progress'}\n`;
    text += `   Pre-Bid Meeting  : ${t.preBidMeeting || 'N/A'}\n`;
    text += `   Final Approved   : ${t.awardOfContract || 'Pending'}\n`;
    text += "----------------------------------------------------------------------------------\n\n";
  });

  text += "\n*** End of Official BMSICL Master Summary Document ***";

  const requests = [
    {
      insertText: {
        text,
        location: { index: 1 },
      }
    },
    {
      updateTextStyle: {
        range: { startIndex: 1, endIndex: 63 },
        textStyle: {
          bold: true,
          fontSize: { size: 14, unit: 'PT' },
          foregroundColor: { rgbColor: { red: 0.117, green: 0.227, blue: 0.541 } }
        },
        fields: 'bold,fontSize,foregroundColor'
      }
    }
  ];

  await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
  });

  return documentId;
}
