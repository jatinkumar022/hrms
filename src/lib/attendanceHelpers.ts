// Parse "HH:mm:ss" to total seconds
export function parseDurationToSeconds(duration: string | undefined) {
  if (!duration) return 0;
  const parts = duration.split(":").map(Number);
  const h = parts[0] || 0;
  const m = parts[1] || 0;
  const s = parts[2] || 0;
  return h * 3600 + m * 60 + s;
}

// Convert total seconds to "HH:mm:ss"
export function secondsToDuration(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const remainingSecondsAfterHours = totalSeconds % 3600;
  const m = Math.floor(remainingSecondsAfterHours / 60);
  const s = remainingSecondsAfterHours % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")}`;
}

// Add seconds to a duration string ("HH:mm:ss")
export function addSecondsToDuration(
  duration: string | undefined,
  secondsToAdd: number
) {
  const total = parseDurationToSeconds(duration) + secondsToAdd;
  return secondsToDuration(total);
}
