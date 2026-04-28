export const STORAGE_KEYS = {
  shortlisted: 'shortlistedPosts',
  taken: 'takenPosts',
  notes: 'postNotes',
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

export function parseImportedSession(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return emptySessionState()
  }

  return {
    shortlisted: Array.isArray(payload.shortlisted) ? payload.shortlisted : [],
    taken: Array.isArray(payload.taken) ? payload.taken : [],
    notes: payload.notes && typeof payload.notes === 'object' && !Array.isArray(payload.notes)
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
