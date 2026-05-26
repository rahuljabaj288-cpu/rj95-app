/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Trash2, 
  Loader2, 
  Sparkles, 
  RefreshCw, 
  CalendarDays, 
  ExternalLink,
  CheckCircle2,
  CalendarCheck2,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { Tender, Language } from '../types';
import { 
  listCalendarEvents, 
  createCalendarEvent, 
  deleteCalendarEvent, 
  GoogleCalendarEvent 
} from '../utils/googleCalendar';
import DateTimePicker from './DateTimePicker';

interface GoogleCalendarHubProps {
  googleUser: any;
  googleToken: string | null;
  onConnectGoogle: () => void;
  onDisconnectGoogle: () => void;
  tenders: Tender[];
  onUpdateTender: (tender: Tender) => void;
  lang: Language;
}

export default function GoogleCalendarHub({
  googleUser,
  googleToken,
  onConnectGoogle,
  onDisconnectGoogle,
  tenders,
  onUpdateTender,
  lang,
}: GoogleCalendarHubProps) {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [scheduling, setScheduling] = useState(false);

  // Form states for new event
  const [selectedTenderId, setSelectedTenderId] = useState<string>('');
  const [milestoneType, setMilestoneType] = useState<string>('Pre-Bid Meeting');
  const [meetingDate, setMeetingDate] = useState<string>(() => {
    // Default to tomorrow in custom DD-MM-YYYY 10:30 AM format
    const tom = new Date();
    tom.setDate(tom.getDate() + 1);
    const d = String(tom.getDate()).padStart(2, '0');
    const m = String(tom.getMonth() + 1).padStart(2, '0');
    const y = tom.getFullYear();
    return `${d}-${m}-${y} 10:30 AM`;
  });
  const [meetingLocation, setMeetingLocation] = useState<string>('BMSICL Corporate Office, Patna, Bihar');
  const [customNotes, setCustomNotes] = useState<string>('');

  // Load calendar items
  const fetchEvents = async () => {
    if (!googleToken) return;
    setLoading(true);
    try {
      const items = await listCalendarEvents(googleToken, 10);
      setEvents(items);
    } catch (err: any) {
      console.error(err);
      setStatusMessage(lang === 'en' ? 'Could not load upcoming calendar events.' : 'आगामी कैलेंडर ईवेंट लोड नहीं किए जा सके।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (googleToken) {
      fetchEvents();
    } else {
      setEvents([]);
    }
  }, [googleToken]);

  // Handle selected tender to prepopulate form as helpful smart fill
  useEffect(() => {
    if (selectedTenderId) {
      const tender = tenders.find(t => t.id === selectedTenderId);
      if (tender) {
        // Pre-fill notes
        setCustomNotes(`BMSICL Procurement Tracking\nTender No: ${tender.tenderNo}\nEquipment: ${tender.equipmentName}\nManager in Charge: ${tender.manager}`);
      }
    }
  }, [selectedTenderId]);

  // Custom 12-hour format parser to Date object
  const parseCustomDateTime = (str: string): Date => {
    const parts = str.split(' ');
    if (parts.length < 3) return new Date();
    const datePart = parts[0]; // DD-MM-YYYY
    const timePart = parts[1]; // hh:mm
    const ampmPart = parts[2]; // AM/PM

    const dParts = datePart.split('-');
    const tParts = timePart.split(':');

    if (dParts.length !== 3 || tParts.length !== 2) return new Date();

    const day = parseInt(dParts[0]);
    const month = parseInt(dParts[1]) - 1;
    const year = parseInt(dParts[2]);

    let hour = parseInt(tParts[0]);
    const min = parseInt(tParts[1]);

    if (ampmPart.toUpperCase() === 'PM' && hour < 12) {
      hour += 12;
    } else if (ampmPart.toUpperCase() === 'AM' && hour === 12) {
      hour = 0;
    }

    return new Date(year, month, day, hour, min);
  };

  // Handle event creation
  const handleScheduleEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleToken) return;

    const tender = tenders.find(t => t.id === selectedTenderId);
    if (!tender) {
      alert(lang === 'en' ? 'Please select a Tender item first.' : 'कृपया पहले एक निविदा आइटम चुनें।');
      return;
    }

    setScheduling(true);
    setStatusMessage(lang === 'en' ? 'Creating Google Calendar meeting...' : 'गूगल कैलेंडर बैठक बनाई जा रही है...');

    try {
      // 1-hour duration default parsed safely from DD-MM-YYYY hh:mm AM/PM
      const startVal = parseCustomDateTime(meetingDate);
      const startIso = startVal.toISOString();
      const endObj = new Date(startVal);
      endObj.setHours(endObj.getHours() + 1);
      const endIso = endObj.toISOString();

      const summary = `BMSICL: ${milestoneType} - ${tender.equipmentName}`;
      const description = `${customNotes}\n\nGenerated secure sync via BMSICL Tender Ledgers Portal.`;

      const createdEvent = await createCalendarEvent(googleToken, {
        summary,
        description,
        location: meetingLocation,
        startDateStr: startIso,
        endDateStr: endIso,
        hasTime: true,
      });

      // Update tender's history or milestones text to show calendar synced event
      const updatedTender: Tender = {
        ...tender,
        statusText: `${tender.statusText || ''}\n[Scheduled: ${milestoneType} on ${parseCustomDateTime(meetingDate).toLocaleDateString('en-IN')}]`.trim(),
      };
      onUpdateTender(updatedTender);

      setStatusMessage(lang === 'en' ? `Meeting scheduled successfully for ${tender.equipmentName}!` : `${tender.equipmentName} के लिए बैठक सफलतापूर्वक निर्धारित की गई!`);
      
      // Reset
      setSelectedTenderId('');
      setCustomNotes('');
      // Refresh events
      await fetchEvents();
    } catch (err: any) {
      console.error(err);
      setStatusMessage(lang === 'en' ? `Scheduling failed: ${err.message}` : `शेड्यूलिंग विफल रही: ${err.message}`);
    } finally {
      setScheduling(false);
      setTimeout(() => setStatusMessage(''), 5000);
    }
  };

  // Delete event with user confirmation (Workspace Guidelines mandate user confirmation for destructive operations)
  const handleDeleteEvent = async (eventId: string, summary: string) => {
    if (!googleToken) return;

    const confirmMsg = lang === 'en'
      ? `🚨 DELETE CALENDAR EVENT 🚨\nAre you sure you want to permanently delete "${summary}" from your Google Calendar?\nThis will remove the event for all invited participants.`
      : `🚨 कैलेंडर ईवेंट हटाएं 🚨\nक्या आप वास्तव में अपने गूगल कैलेंडर से "${summary}" को स्थायी रूप से हटाना चाहते हैं?\nयह सभी आमंत्रित लोगों के लिए ईवेंट हटा देगा।`;

    if (window.confirm(confirmMsg)) {
      setLoading(true);
      setStatusMessage(lang === 'en' ? 'Deleting event...' : 'ईवेंट हटाया जा रहा है...');
      try {
        await deleteCalendarEvent(googleToken, eventId);
        setStatusMessage(lang === 'en' ? 'Successfully deleted event!' : 'ईवेंट सफलतापूर्वक हटा दिया गया!');
        await fetchEvents();
      } catch (err: any) {
        console.error(err);
        setStatusMessage(lang === 'en' ? `Failed to delete: ${err.message}` : `हटाने में विफल: ${err.message}`);
      } finally {
        setLoading(false);
        setTimeout(() => setStatusMessage(''), 4000);
      }
    }
  };

  const formatEventTime = (ev: GoogleCalendarEvent) => {
    const startStr = ev.start.dateTime || ev.start.date || '';
    if (!startStr) return '—';
    try {
      const d = new Date(startStr);
      const isAllDay = !!ev.start.date;
      if (isAllDay) {
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' (All Day)';
      }
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return startStr;
    }
  };

  return (
    <div id="google-calendar-hub-panel" className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 p-5 rounded-2xl shadow-sm space-y-4 select-none no-print">
      
      {/* Block Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/45 text-indigo-600 dark:text-indigo-400">
            <Calendar className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
              {lang === 'en' ? 'Tender Google Calendar scheduler' : 'निविदा गूगल कैलेंडर शेड्यूलर'}
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
              {lang === 'en' ? 'BMSICL Official Meetings & Milestones' : 'BMSICL आधिकारिक बैठकें और माइलस्टोन्स'}
            </p>
          </div>
        </div>

        {/* Authentication State */}
        <div>
          {googleToken ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/35 text-blue-800 dark:text-blue-300 text-[9px] font-black uppercase border border-blue-100 dark:border-blue-900/30">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>{lang === 'en' ? 'Calendar Linked' : 'कैलेंडर लिंक्ड'}</span>
              </span>
              <button
                id="btn-disconnect-gcalendar-session"
                onClick={onDisconnectGoogle}
                className="text-3xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/20 px-2 py-1 rounded border border-rose-100 dark:border-rose-900/30 transition-all active:scale-[0.98]"
                title={googleUser?.email || ''}
              >
                {lang === 'en' ? 'Disconnect' : 'डिस्कनेक्ट'}
              </button>
            </div>
          ) : (
            <button
              id="btn-connect-gcalendar-session"
              onClick={onConnectGoogle}
              className="inline-flex items-center gap-1 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm hover:from-indigo-700 hover:to-indigo-850 transition-all active:scale-[0.98]"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Connect Google Calendar' : 'गूगल कैलेंडर कनेक्ट करें'}</span>
            </button>
          )}
        </div>
      </div>

      {googleToken ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* Section 1: Interactive Scheduler Form */}
          <div className="space-y-3 bg-slate-50/50 dark:bg-slate-950/15 p-4 rounded-2xl border border-slate-100 dark:border-slate-850/60">
            <span className="text-3xs font-bold uppercase tracking-widest text-slate-400 block mb-1">
              {lang === 'en' ? 'Schedule a Tender Milestone Meeting' : 'एक निविदा मील का पत्थर बैठक निर्धारित करें'}
            </span>

            <form onSubmit={handleScheduleEvent} className="space-y-3">
              {/* Select Tender */}
              <div className="space-y-1">
                <label className="text-3xs font-extrabold text-slate-500 uppercase block">
                  {lang === 'en' ? 'Select Target Equipment' : 'लक्ष्य उपकरण चुनें'}
                </label>
                <select
                  required
                  value={selectedTenderId}
                  onChange={(e) => setSelectedTenderId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">{lang === 'en' ? 'Select a Tender equipment...' : 'एक निविदा उपकरण चुनें...'}</option>
                  {tenders.map((t) => (
                    <option key={t.id} value={t.id}>
                      Sl. {t.slNo} - {t.equipmentName.slice(0, 32)}... ({t.tenderNo.slice(0, 15)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Form Row: Milestone Type & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-3xs font-extrabold text-slate-500 uppercase block">
                    {lang === 'en' ? 'Milestone Meeting' : 'बैठक का प्रकार'}
                  </label>
                  <select
                    value={milestoneType}
                    onChange={(e) => setMilestoneType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Pre-Bid Meeting">Pre-Bid Meeting</option>
                    <option value="TSC Evaluation">TSC Technical Evaluation</option>
                    <option value="Technical Opening">Technical Envelope Opening</option>
                    <option value="TEC Debate Session">TEC Meeting</option>
                    <option value="Physical Demonstration">Equipment Demonstration</option>
                    <option value="Financial Envelope Opening">Financial Opening</option>
                    <option value="Price Justification">Price Justification Session</option>
                    <option value="Award of Contract Review">Award of Contract</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-3xs font-extrabold text-slate-500 uppercase block">
                    {lang === 'en' ? 'Meeting Date & Time' : 'बैठक की तिथि और समय'}
                  </label>
                  <DateTimePicker
                    type="datetime"
                    value={meetingDate}
                    onChange={(val) => setMeetingDate(val)}
                    lang={lang}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="text-3xs font-extrabold text-slate-500 uppercase block">
                  {lang === 'en' ? 'Meeting Location' : 'बैठक का स्थान'}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={meetingLocation}
                    onChange={(e) => setMeetingLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none"
                    placeholder="BMSICL Office, Patna"
                  />
                </div>
              </div>

              {/* Additional Context description / Notes */}
              <div className="space-y-1">
                <label className="text-3xs font-extrabold text-slate-500 uppercase block">
                  {lang === 'en' ? 'Calendar Description / Notes' : 'बैठक विवरण / अतिरिक्त नोट्स'}
                </label>
                <textarea
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-3xs text-slate-600 dark:text-slate-355 font-medium focus:outline-none resize-none"
                  placeholder="Review specifications, check bidder credentials..."
                />
              </div>

              {/* Submit trigger with loading support */}
              <button
                type="submit"
                disabled={scheduling || !selectedTenderId}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-indigo-600 hover:bg-indigo-750 disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-slate-850 dark:disabled:text-slate-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer active:scale-98"
              >
                {scheduling ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Plus className="w-4 h-4 text-white" />
                )}
                <span>{lang === 'en' ? 'Authorize & Sync as Event' : 'अधिकृत करें और ईवेंट के रूप में सिंक करें'}</span>
              </button>
            </form>
          </div>

          {/* Section 2: Live Events Stream */}
          <div className="space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/30 p-2 rounded-lg">
                <span className="text-3xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lang === 'en' ? 'Live Calendar Agenda Stream' : 'लाइव कैलेंडर एजेंडा स्ट्रीम'} ({events.length})</span>
                </span>
                <button
                  onClick={fetchEvents}
                  disabled={loading}
                  className="p-1 rounded bg-white dark:bg-slate-850 hover:bg-slate-100 text-slate-500 hover:text-slate-700 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/60 shadow-2xs active:scale-95 duration-200 cursor-pointer"
                  title="Reload events"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {loading && events.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-505" />
                  <span className="text-3xs font-medium uppercase tracking-wider">Syncing workspace agenda...</span>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-10 border border-slate-100 dark:border-slate-850 rounded-2xl bg-slate-50/45 dark:bg-slate-950/10">
                  <CalendarCheck2 className="w-8 h-8 text-slate-300 dark:text-slate-750 mx-auto" />
                  <p className="text-xs font-semibold text-slate-400 mt-2">
                    {lang === 'en' ? 'No scheduled events found.' : 'कोई निर्धारित कार्यक्रम नहीं मिला।'}
                  </p>
                  <p className="text-3xs text-slate-400 mt-0.5 px-4 leading-relaxed">
                    Create meetings using the scheduler to automatically publish vital milestone coordinates directly onto your Google Calendar.
                  </p>
                </div>
              ) : (
                <div className="max-h-[280px] overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                  {events.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 hover:border-slate-200 dark:hover:border-slate-800 transition-all flex flex-col justify-between gap-2"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <h4 className="text-[11px] font-black text-slate-850 dark:text-slate-200 leading-tight block truncate" title={ev.summary}>
                            {ev.summary}
                          </h4>
                          <span className="inline-flex items-center gap-1 text-3xs font-bold text-slate-400 mt-1">
                            <Clock className="w-3 h-3 text-indigo-500 shrink-0" />
                            <span>{formatEventTime(ev)}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {ev.htmlLink && (
                            <a
                              href={ev.htmlLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-500 transition-all shrink-0"
                              title="Open Event in Calendar App"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => handleDeleteEvent(ev.id, ev.summary)}
                            className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-600 transition-all shrink-0"
                            title="Remove event permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {ev.description && (
                        <p className="text-3xs text-slate-500 dark:text-slate-400 font-semibold line-clamp-2 leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-1.5 rounded-lg">
                          {ev.description}
                        </p>
                      )}

                      {ev.location && (
                        <div className="flex items-center gap-1 text-3xs font-semibold text-slate-400">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{ev.location}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bar */}
            {statusMessage && (
              <div className="bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850/60 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-350 font-bold">
                  {statusMessage.includes('Creating') || statusMessage.includes('Deleting') ? (
                    <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  )}
                  <span>{statusMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStatusMessage('')}
                  className="text-slate-400 hover:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 text-3xs font-extrabold px-1.5 py-0.5 rounded leading-none transition-all"
                >
                  Ok
                </button>
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-950/30 p-6 rounded-2xl text-center space-y-3">
          <CalendarDays className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto animate-pulse" />
          <div className="space-y-1 max-w-sm mx-auto">
            <h4 className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">
              {lang === 'en' ? 'Google Calendar Sync Pending' : 'गूगल कैलेंडर सिंक्रनाइज़ेशन लंबित है'}
            </h4>
            <p className="text-[11px] text-slate-400 px-1 leading-relaxed">
              {lang === 'en' 
                ? 'Connect your Google Account to automatically publish procurement milestones, TSC hearings, demonstration schedules, and TEC debates to Google Calendar.' 
                : 'खरीद मील के पत्थर, टीएससी सुनवाई, उपकरण प्रदर्शन और टीईसी बैठक तिथियों को अपने गूगल कैलेंडर पर सीधे प्रकाशित करने के लिए अपने गूगल खाते को लिंक करें।'}
            </p>
          </div>

          <button
            id="gcalendar-oauth-connect-prompt"
            onClick={onConnectGoogle}
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-750 duration-200 font-bold text-white text-xs px-4 py-2 rounded-xl shadow-sm active:scale-95 select-none shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>{lang === 'en' ? 'Link Calendar' : 'कैलेंडर लिंक करें'}</span>
          </button>
        </div>
      )}

      {/* Info footer */}
      <div className="flex justify-between items-center text-3xs font-medium text-slate-400 pt-1">
        <span>✅ Safe Event Scheduling Interface</span>
        <span>Secure Active Connection</span>
      </div>
    </div>
  );
}
