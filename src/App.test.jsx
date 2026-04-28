/* @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import App from './App'
import { STORAGE_KEYS } from './lib/sessionState'

vi.mock('papaparse', () => ({
  default: {
    parse: vi.fn(),
  },
}))

import Papa from 'papaparse'

const TEST_POST = {
  Référence: 'REF-001',
  'Intitulé du poste': 'Poste test partage',
  'Lien vers la fiche de poste': 'https://example.com/poste',
  Ministère: 'Ministère test',
  'Localisation (Commune ou adresse exacte)': 'Paris',
  'Code postal': '75001',
  Région: 'Île-de-France',
  'Env.': 'AC',
  Thématique: 'Transformation',
}

describe('App shared notes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
    window.localStorage.setItem(STORAGE_KEYS.shortlisted, JSON.stringify([TEST_POST.Référence]))
    window.scrollTo = vi.fn()

    Papa.parse.mockImplementation((_url, options) => {
      options.complete({ data: [TEST_POST] })
    })
  })

  it('shares a post note between Explorer and Ranking and reflects note presence in both views', async () => {
    const user = userEvent.setup()

    render(<App />)

    await screen.findAllByText(TEST_POST['Intitulé du poste'])

    await user.click(screen.getAllByTitle('Ajouter une note')[0])

    const explorerNoteField = screen.getAllByLabelText('Notes pour REF-001')[0]

    fireEvent.change(explorerNoteField, { target: { value: 'Note partagee' } })

    const explorerNoteButton = screen.getAllByTitle('Modifier la note')[0]
    expect(explorerNoteButton.getAttribute('data-has-note')).toBe('true')

    await user.click(screen.getByRole('button', { name: /mon ranking/i }))

    const rankingNoteButton = screen.getByTitle('Modifier la note')
    expect(rankingNoteButton.getAttribute('data-has-note')).toBe('true')

    await user.click(rankingNoteButton)

    const rankingNoteField = screen.getByLabelText('Notes pour REF-001')
    expect(rankingNoteField.value).toBe('Note partagee')
  })
})
