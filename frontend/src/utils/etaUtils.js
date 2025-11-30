export function getConfidenceBadge(etaMinutes) {
  if (etaMinutes <= 3) return { label: 'High', type: 'success' };
  if (etaMinutes <= 7) return { label: 'Medium', type: 'warning' };
  return { label: 'Low', type: 'danger' };
}
