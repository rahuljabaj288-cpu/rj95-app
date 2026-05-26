/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  htmlLink?: string;
}

/**
 * Lists upcoming events from the primary calendar.
 */
export async function listCalendarEvents(accessToken: string, pageSize: number = 20): Promise<GoogleCalendarEvent[]> {
  try {
    const timeMin = new Date().toISOString(); // Only show active/upcoming events
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&orderBy=startTime&singleEvents=true&maxResults=${pageSize}`;
    
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Google Calendar Fetch Failed: ${errorText}`);
    }

    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error("Error fetching Calendar events:", error);
    throw error;
  }
}

/**
 * Creates an event in the user's primary calendar.
 */
export async function createCalendarEvent(
  accessToken: string,
  event: {
    summary: string;
    description: string;
    location?: string;
    startDateStr: string; // ISO date string or yyyy-mm-dd
    endDateStr: string;   // ISO date string or yyyy-mm-dd
    hasTime?: boolean;    // If false, it's an all-day event
  }
): Promise<GoogleCalendarEvent> {
  try {
    const isAllDay = !event.hasTime;
    
    const requestBody: any = {
      summary: event.summary,
      description: event.description,
      location: event.location || 'BMSICL Corporate Office, Patna, Bihar',
    };

    if (isAllDay) {
      requestBody.start = { date: event.startDateStr.split('T')[0] };
      requestBody.end = { date: event.endDateStr.split('T')[0] };
    } else {
      requestBody.start = { dateTime: event.startDateStr, timeZone: 'Asia/Kolkata' };
      requestBody.end = { dateTime: event.endDateStr, timeZone: 'Asia/Kolkata' };
    }

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Google Calendar Event Creation Failed: ${errorText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error creating Calendar event:", error);
    throw error;
  }
}

/**
 * Deletes an event from the user's primary calendar.
 */
export async function deleteCalendarEvent(accessToken: string, eventId: string): Promise<void> {
  try {
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Google Calendar Event Deletion Failed: ${errorText}`);
    }
  } catch (error) {
    console.error("Error deleting Calendar event:", error);
    throw error;
  }
}
