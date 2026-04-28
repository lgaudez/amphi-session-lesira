/* @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
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

const SECOND_TEST_POST = {
  Référence: 'REF-002',
  'Intitulé du poste': 'Poste test secondaire',
  'Lien vers la fiche de poste': 'https://example.com/poste-2',
  Ministère: 'Ministère secondaire',
  'Localisation (Commune ou adresse exacte)': 'Lyon',
  'Code postal': '69001',
  Région: 'Auvergne-Rhône-Alpes',
  'Env.': 'ATE',
  Thématique: 'Budget',
}

const getDesktopExplorerRow = () => {
  const rows = document.querySelectorAll('[data-testid="desktop-post-row-REF-001-desktop"]')
  return rows[rows.length - 1]
}

const getMobileExplorerCard = () => {
  const cards = document.querySelectorAll('[data-testid="mobile-post-card-REF-001"]')
  return cards[cards.length - 1]
}

describe('App shared notes', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
    window.localStorage.setItem(STORAGE_KEYS.shortlisted, JSON.stringify([TEST_POST.Référence]))
    window.scrollTo = vi.fn()

    Papa.parse.mockImplementation((_url, options) => {
      options.complete({ data: [TEST_POST, SECOND_TEST_POST] })
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
    expect(within(rankingRow).getAllByLabelText('Note').length).toBeGreaterThan(0)

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
    expect(desktopExplorerRow.className).toMatch(/59,130,246/)
    expect(desktopExplorerRow.className).not.toMatch(/amber/)
    expect(desktopDetailSurface.className).toMatch(/59,130,246/)
    expect(desktopDetailSurface.className).not.toMatch(/amber/)

    const mobileActiveCard = screen.getByTestId('mobile-post-card-REF-001')
    expect(mobileActiveCard.getAttribute('data-expanded')).toBe('true')
    expect(mobileActiveCard.parentElement?.className).toMatch(/59,130,246/)
    expect(mobileActiveCard.parentElement?.className).not.toMatch(/amber/)

    const mobileDetailSurface = screen.getByTestId('job-detail-mobile')
    expect(mobileDetailSurface.className).not.toMatch(/amber/)
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
    const rankingActions = within(rankingRow).getByTestId('ranking-row-actions')

    expect(within(rankingActions).getByLabelText('Note')).toBeTruthy()
    expect(within(rankingRow).getAllByTitle('Voir la fiche').length).toBeGreaterThan(0)
  })

  it('does not collapse the ranking row when interacting with the note editor', async () => {
    const user = userEvent.setup()

    render(<App />)

    await screen.findAllByText(TEST_POST['Intitulé du poste'])
    await user.click(screen.getAllByRole('button', { name: /mon ranking/i })[0])

    const rankingRow = screen.getByTestId('ranking-post-row-REF-001')
    fireEvent.click(within(rankingRow).getByText(TEST_POST['Intitulé du poste']))

    const rankingNoteField = await screen.findByLabelText('Notes pour REF-001')
    await user.click(rankingNoteField)
    await user.type(rankingNoteField, 'abc')

    expect(await screen.findByLabelText('Notes pour REF-001')).toBeTruthy()
    expect(screen.getByLabelText('Notes pour REF-001').value).toContain('abc')
  })

  it('keeps only one row expanded at a time while still allowing collapse on re-click', async () => {
    const user = userEvent.setup()

    render(<App />)

    await screen.findAllByText(TEST_POST['Intitulé du poste'])

    const firstRow = getDesktopExplorerRow()
    const secondRow = document.querySelector('[data-testid="desktop-post-row-REF-002-desktop"]')

    await user.click(firstRow)
    const firstDetailRow = firstRow.nextElementSibling
    expect(firstDetailRow).not.toBeNull()
    expect(within(firstDetailRow).getByLabelText('Notes pour REF-001')).toBeTruthy()

    await user.click(secondRow)
    expect(screen.getAllByTestId('job-detail-desktop')).toHaveLength(1)
    expect(within(firstDetailRow).queryByLabelText('Notes pour REF-001')).toBeNull()
    const secondDetailRow = secondRow.nextElementSibling
    expect(secondDetailRow).not.toBeNull()
    expect(within(secondDetailRow).getByLabelText('Notes pour REF-002')).toBeTruthy()

    await user.click(secondRow)
    expect(screen.queryAllByTestId('job-detail-desktop')).toHaveLength(0)
  })

  it('uses stronger row separators in both desktop lists', async () => {
    render(<App />)

    await screen.findAllByText(TEST_POST['Intitulé du poste'])

    const explorerTableBody = document.querySelector('tbody')
    expect(explorerTableBody?.className).toMatch(/divide-slate-200/)

    await userEvent.setup().click(screen.getAllByRole('button', { name: /mon ranking/i })[0])

    const rankingList = screen.getByTestId('ranking-post-row-REF-001').parentElement
    expect(rankingList?.className).toMatch(/divide-slate-200/)
  })

  it('uses the same passive mobile note logic as desktop', async () => {
    render(<App />)

    await screen.findAllByText(TEST_POST['Intitulé du poste'])

    const mobileCard = getMobileExplorerCard()
    expect(
      within(mobileCard).queryByRole('button', {
        name: /ajouter une note pour REF-001/i,
      }),
    ).toBeNull()
    expect(within(mobileCard).queryByLabelText('Note')).toBeNull()
  })

  it('shows a passive mobile note indicator only when a note exists', async () => {
    window.localStorage.setItem(
      STORAGE_KEYS.notes,
      JSON.stringify({ [TEST_POST.Référence]: 'Note mobile' }),
    )

    render(<App />)

    await screen.findAllByText(TEST_POST['Intitulé du poste'])

    const mobileCard = getMobileExplorerCard()
    expect(within(mobileCard).getByLabelText('Note')).toBeTruthy()
    expect(
      within(mobileCard).queryByRole('button', {
        name: /modifier une note pour REF-001/i,
      }),
    ).toBeNull()
  })

  it('uses the same passive mobile note logic in ranking rows', async () => {
    const user = userEvent.setup()

    render(<App />)

    await screen.findAllByText(TEST_POST['Intitulé du poste'])
    await user.click(screen.getAllByRole('button', { name: /mon ranking/i })[0])

    const rankingRow = screen.getByTestId('ranking-post-row-REF-001')
    expect(
      within(rankingRow).queryByRole('button', {
        name: /ajouter une note pour REF-001/i,
      }),
    ).toBeNull()
  })

  it('shows a passive ranking mobile note indicator only when a note exists', async () => {
    window.localStorage.setItem(
      STORAGE_KEYS.notes,
      JSON.stringify({ [TEST_POST.Référence]: 'Note ranking mobile' }),
    )

    render(<App />)

    await screen.findAllByText(TEST_POST['Intitulé du poste'])
    await userEvent.setup().click(screen.getAllByRole('button', { name: /mon ranking/i })[0])

    const rankingRow = screen.getByTestId('ranking-post-row-REF-001')
    expect(within(rankingRow).getAllByLabelText('Note').length).toBeGreaterThan(0)
    expect(
      within(rankingRow).queryByRole('button', {
        name: /modifier une note pour REF-001/i,
      }),
    ).toBeNull()
  })

  it('hides the ranking row title and keeps the detail title in the expanded panel', async () => {
    const user = userEvent.setup()

    render(<App />)

    await screen.findAllByText(TEST_POST['Intitulé du poste'])
    await user.click(screen.getAllByRole('button', { name: /mon ranking/i })[0])

    const rankingRow = screen.getByTestId('ranking-post-row-REF-001')
    fireEvent.click(within(rankingRow).getByText(TEST_POST['Intitulé du poste']))

    expect(within(rankingRow).queryByRole('heading', { level: 3 })).toBeNull()
    expect(within(rankingRow).getByText(TEST_POST['Intitulé du poste'])).toBeTruthy()
  })

  it('uses a small header icon instead of a bottom sheet CTA in expanded ranking mobile view', async () => {
    const user = userEvent.setup()

    render(<App />)

    await screen.findAllByText(TEST_POST['Intitulé du poste'])
    await user.click(screen.getAllByRole('button', { name: /mon ranking/i })[0])

    const rankingRow = screen.getByTestId('ranking-post-row-REF-001')
    fireEvent.click(within(rankingRow).getByText(TEST_POST['Intitulé du poste']))

    expect(rankingRow.className).toMatch(/59,130,246/)
    expect(rankingRow.className).not.toMatch(/amber/)
    expect(within(rankingRow).queryByText(/consulter la fiche de poste/i)).toBeNull()
    const rankingDetailSurface = await screen.findByTestId('job-detail-desktop')
    expect(rankingDetailSurface.className).not.toMatch(/amber/)

    const rankingDetailHeader = within(rankingDetailSurface).getByTestId('detail-header')
    const rankingDetailMeta = within(rankingDetailHeader).getByTestId('detail-header-meta')
    const rankingDetailTitle = within(rankingDetailHeader).getByTestId('detail-header-title')

    expect(within(rankingDetailMeta).getByText(/détails du poste/i)).toBeTruthy()
    expect(within(rankingDetailMeta).getByTitle('Voir la fiche')).toBeTruthy()
    expect(within(rankingDetailTitle).getByText(TEST_POST['Intitulé du poste'])).toBeTruthy()
    expect(within(rankingDetailHeader).queryByText(/consulter la fiche de poste/i)).toBeNull()
  })
})
