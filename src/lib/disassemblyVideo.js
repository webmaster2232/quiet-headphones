export function progressToVideoTime(progress, duration) {
  const safeProgress = Number.isFinite(progress) ? progress : 0
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0
  return Math.min(1, Math.max(0, safeProgress)) * safeDuration
}

export function smoothVideoTime(currentTime, targetTime, maxStep = 1 / 24) {
  const current = Number.isFinite(currentTime) ? currentTime : 0
  const target = Number.isFinite(targetTime) ? targetTime : current
  const delta = target - current
  if (Math.abs(delta) <= 1 / 60) return target
  return current + Math.sign(delta) * Math.min(Math.abs(delta) * 0.28, maxStep)
}
