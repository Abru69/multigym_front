import { describe, expect, it } from 'vitest'
import {
  featuresToInput,
  featuresToJson,
  getSubscriptionDateRange,
} from './planFeatures'

describe('plan feature serialization', () => {
  it('serializes comma-separated features as a JSON array', () => {
    expect(featuresToJson(' WiFi, Estacionamiento, Locker ')).toBe(
      '["WiFi","Estacionamiento","Locker"]'
    )
  })

  it('removes empty features and returns undefined when empty', () => {
    expect(featuresToJson('WiFi, , Locker,')).toBe('["WiFi","Locker"]')
    expect(featuresToJson('  , ')).toBeUndefined()
  })

  it('converts JSON stored in the database to editable text', () => {
    expect(featuresToInput('["WiFi","Locker"]')).toBe('WiFi, Locker')
  })

  it('keeps legacy plain text values editable', () => {
    expect(featuresToInput('WiFi, Locker')).toBe('WiFi, Locker')
    expect(featuresToInput(null)).toBe('')
  })
})

describe('subscription dates', () => {
  it('uses the start date and plan duration in months', () => {
    expect(getSubscriptionDateRange(new Date(2026, 0, 15), 3)).toEqual({
      startDate: '2026-01-15',
      endDate: '2026-04-15',
    })
  })
})
