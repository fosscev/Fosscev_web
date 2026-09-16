/**
 * Centralized event status computation.
 *
 * The database `status` column is only used for the manual "Draft" state.
 * All other public-facing statuses are computed from `date`, `start_time`,
 * and `end_time` at render time — nothing is written back to the database.
 */

export type ComputedEventStatus =
    | 'Registration Open'
    | 'Event Ongoing'
    | 'Event Concluded'
    | 'Draft';

export interface EventForStatus {
    date: string;                   // YYYY-MM-DD
    start_time?: string | null;     // HH:MM (24-hour)
    end_time?: string | null;       // HH:MM (24-hour)
    status?: string | null;         // only "Draft" is meaningful
}

/**
 * Compute a time-aware display status for an event.
 *
 * Rules:
 *  - `Draft` in the database  →  `Draft` (hidden from public).
 *  - Before a supplied start time  →  Registration Open
 *  - After a supplied end time  →  Event Concluded
 *  - Otherwise, on the event date  →  Event Ongoing
 *
 * Missing times are never replaced by arbitrary defaults. Date-only events
 * remain active for their calendar day, preserving existing event behaviour.
 */
export function getComputedEventStatus(event: EventForStatus, now = new Date()): ComputedEventStatus {
    if (event.status === 'Draft') return 'Draft';

    const eventMidnight = new Date(`${event.date}T00:00:00`);
    if (Number.isNaN(eventMidnight.getTime())) return 'Event Concluded';

    const hasStart = !!event.start_time;
    const hasEnd = !!event.end_time;

    const startDT = hasStart ? dateAtTime(event.date, event.start_time!) : null;
    const endDT = hasEnd ? dateAtTime(event.date, event.end_time!) : null;

    // Use an explicit boundary whenever it exists. Missing boundaries are
    // deliberately not replaced with made-up times or durations.
    if (startDT && now < startDT) return 'Registration Open';
    if (endDT && now > endDT) return 'Event Concluded';

    const nextDay = new Date(eventMidnight);
    nextDay.setDate(nextDay.getDate() + 1);
    if (now < eventMidnight) return 'Registration Open';
    if (now >= nextDay) return 'Event Concluded';

    // On the event date, with no known boundary proving otherwise, it is live.
    return 'Event Ongoing';
}

function dateAtTime(date: string, time: string): Date | null {
    const match = /^(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/.exec(time);
    if (!match) return null;

    const value = new Date(`${date}T${match[1]}:${match[2]}:00`);
    return Number.isNaN(value.getTime()) ? null : value;
}

/**
 * Whether the event should appear in the "active / upcoming" list.
 * An event is active until its end time (or end of day if no end time).
 */
export function isEventActive(event: EventForStatus): boolean {
    const status = getComputedEventStatus(event);
    return status === 'Registration Open' || status === 'Event Ongoing';
}
