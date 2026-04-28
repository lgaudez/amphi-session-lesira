import { isValidElement } from 'react'
import { describe, expect, it, vi } from 'vitest'

import PostNotesEditor from './PostNotesEditor'

const findElement = (node, type) => {
  if (!isValidElement(node)) {
    return null
  }

  if (node.type === type) {
    return node
  }

  const children = Array.isArray(node.props.children)
    ? node.props.children
    : [node.props.children]

  for (const child of children) {
    const match = findElement(child, type)

    if (match) {
      return match
    }
  }

  return null
}

describe('PostNotesEditor', () => {
  it('renders the current note, exposes the placeholder, and emits changes', () => {
    const handleChange = vi.fn()
    const tree = PostNotesEditor({
      value: 'Current note',
      onChange: handleChange,
      placeholder: 'Ajouter une note personnelle',
    })
    const label = findElement(tree, 'label')
    const labelText = findElement(tree, 'span')
    const textarea = findElement(tree, 'textarea')

    expect(label).not.toBeNull()
    expect(labelText?.props.children).toBe('Notes')
    expect(textarea).not.toBeNull()
    expect(textarea.props.value).toBe('Current note')
    expect(textarea.props.placeholder).toBe('Ajouter une note personnelle')

    textarea.props.onChange({ target: { value: 'Updated note' } })

    expect(handleChange).toHaveBeenCalledWith('Updated note')
  })
})
