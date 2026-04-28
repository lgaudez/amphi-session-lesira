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

const getDesktopExplorerRow = () => {
  const rows = document.querySelectorAll('[data-testid="desktop-post-row-REF-001-desktop"]')
  return rows[rows.length - 1]
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
    const desktopExplorerRow = getDesktopExplorerRow()
    await user.click(desktopExplorerRow)

    const desktopExplorerDetailRow = desktopExplorerRow.nextElementSibling
    expect(desktopExplorerDetailRow).not.toBeNull()

    const desktopExplorerNoteField = within(desktopExplorerDetailRow).getByLabelText('Notes pour REF-001')

    fireEvent.change(desktopExplorerNoteField, { target: { value: 'Note partagee' } })

    expect(within(desktopExplorerRow).getByText('Note')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: /mon ranking/i }))

    const rankingNoteButton = screen.getByRole('button', {
      name: /modifier une note pour REF-001/i,
    })
    expect(rankingNoteButton.getAttribute('data-has-note')).toBe('true')

    await user.click(rankingNoteButton)

    const rankingNoteField = screen.getByLabelText('Notes pour REF-001')
    expect(rankingNoteField.value).toBe('Note partagee')
  })

  it('marks the mobile post as active and uses a wide desktop detail layout when expanded', async () => {
    const user = userEvent.setup()

    render(<App />)

    await screen.findAllByText(TEST_POST['Intitulé du poste'])
    const desktopExplorerRow = getDesktopExplorerRow()
    await user.click(desktopExplorerRow)

    const desktopExplorerDetailRow = desktopExplorerRow.nextElementSibling
    expect(desktopExplorerDetailRow).not.toBeNull()

    const desktopDetailSurface = within(desktopExplorerDetailRow).getByTestId('job-detail-desktop')
    expect(desktopDetailSurface.getAttribute('data-layout')).toBe('wide')
    expect(desktopDetailSurface.querySelector('.max-w-md')).toBeNull()

    const mobileActiveCard = screen.getByTestId('mobile-post-card-REF-001')
    expect(mobileActiveCard.getAttribute('data-expanded')).toBe('true')

    const mobileDetailSurface = screen.getByTestId('job-detail-mobile')
    expect(mobileDetailSurface.className).toMatch(/amber/)
  })

  it('uses the desktop row itself as the note entry point and only shows a passive note badge once a note exists', async () => {
    window.localStorage.setItem(
      STORAGE_KEYS.notes,
      JSON.stringify({ [TEST_POST.Référence]: 'Badge note' }),
    )

    render(<App />)

    await screen.findAllByText(TEST_POST['Intitulé du poste'])
    const desktopExplorerRow = getDesktopExplorerRow()

    expect(
      within(desktopExplorerRow).queryByRole('button', {
        name: /ajouter une note pour REF-001/i,
      }),
    ).toBeNull()

    expect(within(desktopExplorerRow).getByText('Note')).toBeTruthy()
  })
})
