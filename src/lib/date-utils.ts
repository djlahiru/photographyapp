export function getGreeting(name?: string): string {
  const now = new Date();
  const hours = now.getHours();
  let greetingText: string;

  if (hours < 12) {
    greetingText = "Good morning";
  } else if (hours < 18) {
    greetingText = "Good afternoon";
  } else {
    greetingText = "Good evening";
  }

  return name ? `${greetingText}, ${name}!` : `${greetingText}!`;
}
