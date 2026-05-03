import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';

// Default clinic coordinates — update to actual clinic location
const CLINIC_COORDS = new Coordinates(21.3891, 39.8579); // Mecca, Saudi Arabia
const CALC_PARAMS = CalculationMethod.UmmAlQura();

const PRAYER_LABELS = {
    fajr: 'Fajr',
    dhuhr: 'Dhuhr',
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha',
};

// Approximate prayer duration in minutes used to define the conflict window
const PRAYER_WINDOW_MIN = 20;

function dateToMinutes(date) {
    return date.getHours() * 60 + date.getMinutes();
}

function timeStrToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

/**
 * Returns prayer times for a given date string (yyyy-MM-dd).
 * @param {string} dateStr
 * @returns {{ name: string, time: Date }[]}
 */
export function getPrayerTimesForDate(dateStr) {
    try {
        const date = new Date(`${dateStr}T00:00:00`);
        const times = new PrayerTimes(CLINIC_COORDS, date, CALC_PARAMS);
        return Object.entries(PRAYER_LABELS).map(([key, name]) => ({
            name,
            time: times[key],
        }));
    } catch {
        return [];
    }
}

/**
 * Checks whether an appointment window overlaps with any prayer time window.
 * @param {string} dateStr      - yyyy-MM-dd
 * @param {string} startTime    - HH:mm
 * @param {number} durationMin  - appointment duration in minutes
 * @returns {{ conflicting: boolean, prayers: string[] }}
 */
export function checkPrayerConflict(dateStr, startTime, durationMin) {
    if (!dateStr || !startTime || !durationMin) return { conflicting: false, prayers: [] };

    const prayers = getPrayerTimesForDate(dateStr);
    const aptStart = timeStrToMinutes(startTime);
    const aptEnd = aptStart + Number(durationMin);

    const conflicting = prayers
        .filter(({ time }) => {
            if (!time) return false;
            const pStart = dateToMinutes(time);
            const pEnd = pStart + PRAYER_WINDOW_MIN;
            return aptStart < pEnd && aptEnd > pStart;
        })
        .map(({ name }) => name);

    return { conflicting: conflicting.length > 0, prayers: conflicting };
}
