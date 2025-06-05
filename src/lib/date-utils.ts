
import { DATE_FORMAT_LS_KEY, DEFAULT_DATE_FORMAT, type DateFormatValue, CLOCK_FORMAT_LS_KEY, DEFAULT_CLOCK_FORMAT_VALUE, CLOCK_FORMATS, type ClockFormatValue } from './constants';

// Returns a translation key, optionally the name, and an icon name
export function getGreetingParts(name?: string): { greetingKey: string; name?: string; iconName: 'Sunrise' | 'Sun' | 'Sunset' | 'Moon' } {
  const now = new Date();
  const hours = now.getHours();
  let greetingKey: string;
  let iconName: 'Sunrise' | 'Sun' | 'Sunset' | 'Moon';

  if (hours >= 5 && hours < 12) { // Morning: 5 AM - 11:59 AM
    greetingKey = "greeting.morning";
    iconName = "Sunrise";
  } else if (hours >= 12 && hours < 17) { // Afternoon: 12 PM - 4:59 PM (includes noon)
    greetingKey = "greeting.afternoon";
    iconName = "Sun";
  } else if (hours >= 17 && hours < 21) { // Evening: 5 PM - 8:59 PM
    greetingKey = "greeting.evening";
    iconName = "Sunset";
  } else { // Night: 9 PM - 4:59 AM
    greetingKey = "greeting.night";
    iconName = "Moon";
  }

  return { greetingKey, name, iconName };
}

export function getSelectedDateFormat(): DateFormatValue {
  if (typeof window === 'undefined') {
    return DEFAULT_DATE_FORMAT;
  }
  const storedFormat = localStorage.getItem(DATE_FORMAT_LS_KEY) as DateFormatValue | null;
  return storedFormat || DEFAULT_DATE_FORMAT;
}

export function getSelectedClockFormatValue(): ClockFormatValue {
  if (typeof window === 'undefined') {
    return DEFAULT_CLOCK_FORMAT_VALUE;
  }
  const storedFormat = localStorage.getItem(CLOCK_FORMAT_LS_KEY) as ClockFormatValue | null;
  return storedFormat || DEFAULT_CLOCK_FORMAT_VALUE;
}

export function getActualClockFormatString(formatValue?: ClockFormatValue): string {
  const valueToUse = formatValue || getSelectedClockFormatValue();
  const formatObject = CLOCK_FORMATS.find(f => f.value === valueToUse);
  return formatObject ? formatObject.exampleFormat : CLOCK_FORMATS.find(f => f.value === DEFAULT_CLOCK_FORMAT_VALUE)!.exampleFormat;
}

export function getActualClockFormatParts(formatValue?: ClockFormatValue): { hours: string; minutes: string; ampm: string } {
  const valueToUse = formatValue || getSelectedClockFormatValue();
  const formatObject = CLOCK_FORMATS.find(f => f.value === valueToUse);
  const defaultFormatObject = CLOCK_FORMATS.find(f => f.value === DEFAULT_CLOCK_FORMAT_VALUE)!;

  if (formatObject && formatObject.parts) {
    const { hours, minutes, ampm } = formatObject.parts;
    return { hours, minutes, ampm: ampm || '' };
  }
  const { hours, minutes, ampm } = defaultFormatObject.parts;
  return { hours, minutes, ampm: ampm || '' };
}
