
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
