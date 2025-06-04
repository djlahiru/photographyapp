
// Returns a translation key and optionally the name
export function getGreetingParts(name?: string): { greetingKey: string; name?: string } {
  const now = new Date();
  const hours = now.getHours();
  let greetingKey: string;

  if (hours < 12) {
    greetingKey = "greeting.morning";
  } else if (hours < 18) {
    greetingKey = "greeting.afternoon";
  } else {
    greetingKey = "greeting.evening";
  }

  return { greetingKey, name };
}
