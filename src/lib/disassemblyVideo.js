export function progressToVideoTime(progress, duration) {
  const safeProgress = Number.isFinite(progress) ? progress : 0
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0
  return Math.min(1, Math.max(0, safeProgress)) * safeDuration
}
