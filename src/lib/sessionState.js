export const STORAGE_KEYS = {
  shortlisted: 'ira_shortlisted',
  taken: 'ira_taken',
  notes: 'ira_notes',
}

export function emptySessionState() {
  return {
    shortlisted: [],
    taken: [],
    notes: {},
  }
}

export function normalizeNoteValue(value) {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim()
  return normalized ? normalized : null
}

export function parseStoredArray(rawValue) {
  if (typeof rawValue !== 'string') {
    return []
  }

  try {
    const parsed = JSON.parse(rawValue)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function parseStoredNotes(rawValue) {
  if (typeof rawValue !== 'string') {
    return {}
  }

  try {
    const parsed = JSON.parse(rawValue)

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {}
    }

    return Object.entries(parsed).reduce((notes, [postId, value]) => {
      const normalized = normalizeNoteValue(value)

      if (normalized) {
        notes[postId] = normalized
      }

      return notes
    }, {})
  } catch {
    return {}
  }
}

export function updateNotesMap(previousNotes, postId, nextValue) {
  const notes = previousNotes && typeof previousNotes === 'object' && !Array.isArray(previousNotes)
    ? { ...previousNotes }
    : {}

  const normalized = normalizeNoteValue(nextValue)

  if (normalized) {
    notes[postId] = normalized
  } else {
    delete notes[postId]
  }

  return notes
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function parseImportedSession(payload) {
  if (!isPlainObject(payload)) {
    return null
  }

  const hasShortlisted = Object.hasOwn(payload, 'shortlisted')
  const hasTaken = Object.hasOwn(payload, 'taken')
  const hasNotes = Object.hasOwn(payload, 'notes')

  if (!hasShortlisted && !hasTaken) {
    return null
  }

  if (hasShortlisted && !Array.isArray(payload.shortlisted)) {
    return null
  }

  if (hasTaken && !Array.isArray(payload.taken)) {
    return null
  }

  if (hasNotes && !isPlainObject(payload.notes)) {
    return null
  }

  return {
    shortlisted: hasShortlisted ? payload.shortlisted : [],
    taken: hasTaken ? payload.taken : [],
    notes: hasNotes
      ? Object.entries(payload.notes).reduce((notes, [postId, value]) => {
          const normalized = normalizeNoteValue(value)

          if (normalized) {
            notes[postId] = normalized
          }

          return notes
        }, {})
      : {},
  }
}

export function serializeSession({ shortlisted, taken, notes }) {
  return JSON.stringify({
    shortlisted: Array.isArray(shortlisted) ? shortlisted : [],
    taken: Array.isArray(taken) ? taken : [],
    notes: notes && typeof notes === 'object' && !Array.isArray(notes)
      ? Object.entries(notes).reduce((normalizedNotes, [postId, value]) => {
          const normalized = normalizeNoteValue(value)

          if (normalized) {
            normalizedNotes[postId] = normalized
          }

          return normalizedNotes
        }, {})
      : {},
  })
}
