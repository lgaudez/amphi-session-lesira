import { describe, expect, it } from 'vitest'

import {
  STORAGE_KEYS,
  emptySessionState,
  normalizeNoteValue,
  parseImportedSession,
  parseStoredArray,
  parseStoredNotes,
  serializeSession,
  updateNotesMap,
} from './sessionState'

describe('STORAGE_KEYS', () => {
  it('preserves the existing app storage contract', () => {
    expect(STORAGE_KEYS).toEqual({
      shortlisted: 'ira_shortlisted',
      taken: 'ira_taken',
      notes: 'ira_notes',
    })
  })
})

describe('normalizeNoteValue', () => {
  it('trims note text and drops whitespace-only notes', () => {
    expect(normalizeNoteValue('  Important note  ')).toBe('Important note')
    expect(normalizeNoteValue('   \n\t  ')).toBeNull()
  })
})

describe('updateNotesMap', () => {
  it('stores normalized notes and removes empty ones', () => {
    expect(updateNotesMap({ alpha: 'keep' }, 'beta', '  Added note  ')).toEqual({
      alpha: 'keep',
      beta: 'Added note',
    })

    expect(updateNotesMap({ alpha: 'keep', beta: 'remove me' }, 'beta', '   ')).toEqual({
      alpha: 'keep',
    })
  })
})

describe('parseStoredArray', () => {
  it('returns an empty array on invalid JSON', () => {
    expect(parseStoredArray('{"broken":true')).toEqual([])
  })
})

describe('parseStoredNotes', () => {
  it('keeps only trimmed string notes', () => {
    expect(
      parseStoredNotes(
        JSON.stringify({
          a: '  first  ',
          b: '   ',
          c: 123,
          d: null,
          e: 'second',
        }),
      ),
    ).toEqual({
      a: 'first',
      e: 'second',
    })
  })
})

describe('parseImportedSession', () => {
  it('accepts legacy sessions without notes', () => {
    expect(
      parseImportedSession({
        shortlisted: ['a', 'b'],
        taken: ['c'],
      }),
    ).toEqual({
      shortlisted: ['a', 'b'],
      taken: ['c'],
      notes: {},
    })
  })

  it('returns empty state on malformed payload', () => {
    expect(parseImportedSession('bad payload')).toEqual(emptySessionState())
    expect(parseImportedSession(null)).toEqual(emptySessionState())
  })
})

describe('serializeSession', () => {
  it('exports shortlisted, taken, and notes together', () => {
    expect(
      JSON.parse(
        serializeSession({
          shortlisted: ['a'],
          taken: ['b'],
          notes: { a: 'Saved note' },
        }),
      ),
    ).toEqual({
      shortlisted: ['a'],
      taken: ['b'],
      notes: { a: 'Saved note' },
    })
  })
})
