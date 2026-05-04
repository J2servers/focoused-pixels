// Time helpers (BRT-aware)
export function isQuietHours(): boolean {
  const now = new Date();
  const brtHour = (now.getUTCHours() - 3 + 24) % 24;
  return brtHour >= 22 || brtHour < 7;
}

export function calcScheduleDelay(hour: number, minute: number): number {
  const now = new Date();
  const brtOffset = -3 * 60;
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const brtMinutes = utcMinutes + brtOffset;
  const targetMinutes = hour * 60 + minute;

  let diffMinutes = targetMinutes - (brtMinutes >= 0 ? brtMinutes : brtMinutes + 1440);
  if (diffMinutes <= 0) diffMinutes += 1440;
  return diffMinutes * 60 * 1000;
}
