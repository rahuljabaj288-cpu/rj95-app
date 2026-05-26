/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, Users, Clock, CalendarRange, Sparkles } from 'lucide-react';
import { Tender, Language } from '../types';
import GoogleCalendarHub from './GoogleCalendarHub';

interface MeetingsSubpageProps {
  tenders: Tender[];
  lang: Language;
  googleUser: any;
  googleToken: string | null;
  onConnectGoogle: () => void;
  onDisconnectGoogle: () => void;
  onUpdateTender: (tender: Tender) => void;
}

export default function MeetingsSubpage({
  tenders,
  lang,
  googleUser,
  googleToken,
  onConnectGoogle,
  onDisconnectGoogle,
  onUpdateTender
}: MeetingsSubpageProps) {
  
  // Extract upcoming milestone schedules from status texts
  const meetingMentions = tenders.filter(t => {
    const pbm = t.preBidMeeting.toLowerCase();
    const tsc = t.tscMeeting.toLowerCase();
    const tec = t.tecMeeting.toLowerCase();
    const demo = t.demoMeeting.toLowerCase();
    return pbm.includes('schedule') || tsc.includes('schedule') || tec.includes('schedule') || demo.includes('schedule');
  }).map(t => {
    let meetingType = 'Technical Review';
    let scheduleText = 'Scheduled';

    if (t.preBidMeeting.toLowerCase().includes('schedule')) {
      meetingType = 'Pre-Bid Meeting';
      scheduleText = t.preBidMeeting;
    } else if (t.tscMeeting.toLowerCase().includes('schedule')) {
      meetingType = 'TSC Meeting';
      scheduleText = t.tscMeeting;
    } else if (t.tecMeeting.toLowerCase().includes('schedule')) {
      meetingType = 'TEC Meeting';
      scheduleText = t.tecMeeting;
    } else if (t.demoMeeting.toLowerCase().includes('schedule')) {
      meetingType = 'Equipment Live Demo';
      scheduleText = t.demoMeeting;
    }

    return {
      tenderNo: t.tenderNo,
      equipment: t.equipmentName,
      meetingType,
      scheduleText,
      manager: t.manager || 'Girish'
    };
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 sm:p-2 animate-fadeIn select-none">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-50 uppercase tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-rose-500" />
            <span>{lang === 'en' ? 'BMSICL Meeting & Committee Coordinator' : 'बैठक एवं समिति समन्वय केंद्र'}</span>
          </h2>
          <p className="text-3xs text-slate-505 dark:text-slate-400">
            {lang === 'en' ? 'Organize Pre-Bid meetings, TSC discussions, and TEC live demo calendars with secure Google Calendar syncing.' : 'गूगल कैलेंडर समन्वयन के साथ प्री-बिड, टीएससी और टीईसी लाइव प्रदर्शनों का आयोजन करें।'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Google Calendar Hub & Form Scheduler */}
        <div className="lg:col-span-2 space-y-6">
          <GoogleCalendarHub
            googleUser={googleUser}
            googleToken={googleToken}
            onConnectGoogle={onConnectGoogle}
            onDisconnectGoogle={onDisconnectGoogle}
            tenders={tenders}
            onUpdateTender={onUpdateTender}
            lang={lang}
          />
        </div>

        {/* Right 1 Column: Upcoming Meetings Calendar Feed */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-150 dark:border-slate-850 shadow-sm flex flex-col h-full">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-805 flex items-center gap-2 mb-4">
              <CalendarRange className="w-4.5 h-4.5 text-rose-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Ledger Scheduled Postings ({meetingMentions.length})
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 max-h-[580px] pr-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              {meetingMentions.map((meeting, idx) => (
                <div key={idx} className="bg-slate-50/50 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850 space-y-1.5 hover:border-rose-400 dark:hover:border-rose-900 transition-colors">
                  <div className="flex justify-between items-start gap-1">
                    <span className="px-1.5 py-0.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-450 rounded font-mono text-3xs font-extrabold tracking-wider border border-rose-100 dark:border-rose-900/10">
                      {meeting.meetingType}
                    </span>
                    <span className="text-4xs font-mono text-slate-400 uppercase">
                      By: {meeting.manager}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2">
                    {meeting.equipment} ({meeting.tenderNo})
                  </h4>

                  <div className="pt-2 text-[10px] text-slate-500 dark:text-slate-450 font-semibold border-t border-slate-100 dark:border-slate-850/40 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{meeting.scheduleText}</span>
                  </div>
                </div>
              ))}

              {meetingMentions.length === 0 && (
                <div className="text-center py-12 text-slate-450 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <p className="text-3xs font-bold uppercase tracking-wider text-slate-400">
                    No Scheduled Milestones found
                  </p>
                  <p className="text-4xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    All currently logged milestone meetings are either complete or pending scheduling in active tender pipelines.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Helper Advice Card */}
            <div className="mt-6 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-4xs text-slate-400 dark:text-slate-500 leading-relaxed flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Events synchronized above map directly inside BMSICL Procurement Google calendars automatically.</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
