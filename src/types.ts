/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Tender {
  id: string; // Internal unique ID
  slNo?: number; // Serial Number
  department?: string; // Department name
  tenderNo: string;
  equipmentName: string;
  openedDate?: string; // Opened Date from PDF
  endDate?: string; // End Date from PDF
  statusText?: string; // Full Status description as of 13.05.2026
  manager?: string; // Manager name (e.g. Girish)
  
  // Existing milestones (mapped)
  preBidMeeting: string;
  tscMeeting: string;
  technicalOpening: string;
  bidderName: string;
  noOfBidders: number;
  tecMeeting: string;
  postTecMeeting: string;
  tec2Meeting: string;
  demoMeeting: string;
  postDemoMeeting: string;
  financialOpening: string;
  priceJustificationMeeting: string;
  awardOfContract: string;
  agreement: string;
}

export type Language = 'en' | 'hi';
export type AppTheme = 'light' | 'dark';

export interface UserSession {
  username: string;
  isLoggedIn: boolean;
  role: 'Administrator' | 'Officer' | 'Guest';
}
