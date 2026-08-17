import { describe, expect, it } from 'vitest'
import { getResponseItems } from './api'

describe('getResponseItems', () => {
  it('reads items from lista responses', () => {
    expect(getResponseItems({ estatus: 'OK', mensaje: 'OK', lista: [{ id: 'one' }] })).toEqual([
      { id: 'one' },
    ])
  })

  it('reads items from paginated dto.data responses', () => {
    expect(
      getResponseItems({ estatus: 'OK', mensaje: 'OK', dto: { data: [{ id: 'one' }] } })
    ).toEqual([{ id: 'one' }])
  })

  it('returns an empty array for unsupported responses', () => {
    expect(getResponseItems(null)).toEqual([])
    expect(getResponseItems({ estatus: 'OK', mensaje: 'OK', dto: { value: 'not-a-list' } })).toEqual([])
  })
})
