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

    expect(within(desktopExplorerRow).getByLabelText('Note')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: /mon ranking/i }))

    const rankingRow = screen.getByTestId('ranking-post-row-REF-001')
    expect(within(rankingRow).getByLabelText('Note')).toBeTruthy()

    let rankingNoteField = screen.queryByLabelText('Notes pour REF-001')
    if (!rankingNoteField) {
      await user.click(rankingRow)
      rankingNoteField = screen.getByLabelText('Notes pour REF-001')
    }

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

    expect(within(desktopExplorerRow).getByLabelText('Note')).toBeTruthy()
  })

  it('does not render a separate chevron affordance in desktop rows', async () => {
    render(<App />)

    await screen.findAllByText(TEST_POST['Intitulé du poste'])
    const desktopExplorerRow = getDesktopExplorerRow()
    expect(desktopExplorerRow.querySelector('.lucide-chevron-down')).toBeNull()

    await userEvent.setup().click(screen.getAllByRole('button', { name: /mon ranking/i })[0])

    const rankingRow = screen.getByTestId('ranking-post-row-REF-001')
    expect(rankingRow.querySelector('.lucide-chevron-down')).toBeNull()
  })

  it('keeps the desktop note indicator in the post cell and the sheet CTA outside the note panel', async () => {
    const user = userEvent.setup()

    window.localStorage.setItem(
      STORAGE_KEYS.notes,
      JSON.stringify({ [TEST_POST.Référence]: 'Badge note' }),
    )

    render(<App />)

    await screen.findAllByText(TEST_POST['Intitulé du poste'])
    const desktopExplorerRow = getDesktopExplorerRow()
    const postCell = desktopExplorerRow.children[1]
    const actionCell = desktopExplorerRow.children[4]

    expect(within(postCell).getByLabelText('Note')).toBeTruthy()
    expect(within(actionCell).queryByLabelText('Note')).toBeNull()

    await user.click(desktopExplorerRow)

    const desktopExplorerDetailRow = desktopExplorerRow.nextElementSibling
    const desktopNotePanel = within(desktopExplorerDetailRow).getByTestId('desktop-note-panel')
    const desktopSheetCta = within(desktopExplorerDetailRow).getByTestId('desktop-sheet-cta')

    expect(desktopNotePanel.contains(desktopSheetCta)).toBe(false)
  })

  it('keeps ranking desktop actions aligned when a note exists', async () => {
    window.localStorage.setItem(
      STORAGE_KEYS.notes,
      JSON.stringify({ [TEST_POST.Référence]: 'Badge note' }),
    )

    render(<App />)

    await screen.findAllByText(TEST_POST['Intitulé du poste'])
    await userEvent.setup().click(screen.getAllByRole('button', { name: /mon ranking/i })[0])

    const rankingRow = screen.getByTestId('ranking-post-row-REF-001')
    if (!within(rankingRow).queryByTitle('Voir la fiche')) {
      await userEvent.setup().click(rankingRow)
    }

    const rankingActions = within(rankingRow).getByTestId('ranking-row-actions')

    expect(within(rankingActions).getByLabelText('Note')).toBeTruthy()
    expect(within(rankingActions).getByTitle('Voir la fiche')).toBeTruthy()
  })
})
