import React from 'react'

const PostNotesEditor = ({
  value = '',
  onChange,
  label = 'Notes',
  placeholder = 'Ajouter une note personnelle',
}) => (
  <label className="flex flex-col gap-2 text-left">
    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
      {label}
    </span>
    <textarea
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
      placeholder={placeholder}
      rows={4}
      className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
    />
  </label>
)

export default PostNotesEditor
