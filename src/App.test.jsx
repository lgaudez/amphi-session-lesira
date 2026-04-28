/* @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
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

    const desktopExplorerRow = await screen.findByRole('row', {
      name: /REF-001.*Poste test partage/i,
    })

    await user.click(
      within(desktopExplorerRow).getByRole('button', {
        name: /ajouter une note pour REF-001/i,
      }),
    )

    const desktopExplorerDetailRow = desktopExplorerRow.nextElementSibling
    expect(desktopExplorerDetailRow).not.toBeNull()

    const desktopExplorerNoteField = within(desktopExplorerDetailRow).getByLabelText('Notes pour REF-001')

    fireEvent.change(desktopExplorerNoteField, { target: { value: 'Note partagee' } })

    const visibleDesktopNoteButton = within(desktopExplorerRow).getByRole('button', {
      name: /modifier une note pour REF-001/i,
    })
    expect(visibleDesktopNoteButton.getAttribute('data-has-note')).toBe('true')

    await user.click(visibleDesktopNoteButton)

    expect(document.activeElement).toBe(desktopExplorerNoteField)

    await user.click(screen.getByRole('button', { name: /mon ranking/i }))

    const rankingNoteButton = screen.getByRole('button', {
      name: /modifier une note pour REF-001/i,
    })
    expect(rankingNoteButton.getAttribute('data-has-note')).toBe('true')

    await user.click(rankingNoteButton)

    const rankingNoteField = screen.getByLabelText('Notes pour REF-001')
    expect(rankingNoteField.value).toBe('Note partagee')
  })
})
