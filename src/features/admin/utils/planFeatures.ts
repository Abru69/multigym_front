export function featuresToInput(value: string | null | undefined): string {
  if (!value) return ''

  try {
    const parsed = JSON.parse(value) as unknown
    if (Array.isArray(parsed)) {
      return parsed.filter((feature): feature is string => typeof feature === 'string').join(', ')
    }
  } catch {
    // Keep legacy plain-text values editable.
  }

  return value
}

export function featuresToJson(value: string): string | undefined {
  const features = value
    .split(',')
    .map((feature) => feature.trim())
    .filter(Boolean)

  return features.length > 0 ? JSON.stringify(features) : undefined
}

export function formatDateOnly(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getSubscriptionDateRange(startDate: Date, durationMonths: number) {
  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + durationMonths)

  return {
    startDate: formatDateOnly(startDate),
    endDate: formatDateOnly(endDate),
  }
}
