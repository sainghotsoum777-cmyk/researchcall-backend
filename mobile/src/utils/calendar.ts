import * as Calendar from 'expo-calendar';
import { parseISO, addHours } from 'date-fns';
import { Call } from '../services/api';

export async function addCallToCalendar(call: Call): Promise<boolean> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') return false;

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const defaultCalendar =
    calendars.find((c) => c.allowsModifications && c.isPrimary) ?? calendars[0];

  if (!defaultCalendar) return false;

  const deadline = parseISO(call.submissionDeadline);

  await Calendar.createEventAsync(defaultCalendar.id, {
    title: `ðŸ“‹ Deadline: ${call.title}`,
    startDate: deadline,
    endDate: addHours(deadline, 1),
    notes: [
      `Type: ${call.type}`,
      call.locationCountry ? `Pays: ${call.locationCountry}` : '',
      call.contactEmail ? `Contact: ${call.contactEmail}` : '',
      call.externalUrl ? `Lien: ${call.externalUrl}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    alarms: [
      { relativeOffset: -60 * 24 * 7 }, // 1 week before
      { relativeOffset: -60 * 24 * 3 }, // 3 days before
      { relativeOffset: -60 * 24 },      // 1 day before
    ],
    url: call.externalUrl ?? undefined,
  });

  return true;
}

export async function addEventToCalendar(call: Call): Promise<boolean> {
  if (!call.eventStartDate) return false;

  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') return false;

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const defaultCalendar =
    calendars.find((c) => c.allowsModifications && c.isPrimary) ?? calendars[0];

  if (!defaultCalendar) return false;

  const start = parseISO(call.eventStartDate);
  const end = call.eventEndDate ? parseISO(call.eventEndDate) : addHours(start, 2);

  await Calendar.createEventAsync(defaultCalendar.id, {
    title: `ðŸ›ï¸ ${call.title}`,
    startDate: start,
    endDate: end,
    location: [call.locationCity, call.locationCountry].filter(Boolean).join(', '),
    notes: call.description.slice(0, 500),
    url: call.externalUrl ?? undefined,
  });

  return true;
}