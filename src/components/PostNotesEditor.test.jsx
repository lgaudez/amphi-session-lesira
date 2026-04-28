/* @vitest-environment jsdom */

import React, { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import PostNotesEditor from './PostNotesEditor'

const ControlledEditorHarness = ({ initialValue, onChange, placeholder, ...props }) => {
  const [value, setValue] = useState(initialValue)

  const handleChange = (nextValue) => {
    setValue(nextValue)
    onChange(nextValue)
  }

  return (
    <PostNotesEditor
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      {...props}
    />
  )
}

describe('PostNotesEditor', () => {
  it('renders the current note, exposes the placeholder, and emits changes', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(
      <ControlledEditorHarness
        initialValue="Current note"
        onChange={handleChange}
        placeholder="Ajouter une note personnelle"
        name="post-notes"
        maxLength={120}
      />,
    )

    const textarea = screen.getByLabelText('Notes')

    expect(textarea.value).toBe('Current note')
    expect(textarea.getAttribute('placeholder')).toBe('Ajouter une note personnelle')
    expect(textarea.getAttribute('name')).toBe('post-notes')
    expect(textarea.maxLength).toBe(120)

    await user.clear(textarea)
    await user.type(textarea, 'Updated note')

    expect(handleChange).toHaveBeenLastCalledWith('Updated note')
    expect(textarea.value).toBe('Updated note')
  })
})
