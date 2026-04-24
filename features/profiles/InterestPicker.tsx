'use client'

import { useState } from 'react'
import { INTEREST_PRESETS } from '@/lib/constants'

interface InterestPickerProps {
  value: string[]
  onChange: (nextValue: string[]) => void
  error?: string
}

export function InterestPicker({ value, onChange, error }: InterestPickerProps) {
  const [customInterest, setCustomInterest] = useState('')
  const [focused, setFocused] = useState(false)

  const toggleInterest = (interest: string) => {
    onChange(value.includes(interest) ? value.filter(i => i !== interest) : [...value, interest])
  }

  const addCustomInterest = () => {
    const trimmed = customInterest.trim()
    if (!trimmed || value.includes(trimmed)) return
    onChange([...value, trimmed])
    setCustomInterest('')
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {INTEREST_PRESETS.map(interest => {
          const active = value.includes(interest)
          return (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em',
                padding: '6px 14px', borderRadius: 100,
                border: `1px solid ${active ? '#9b7ff8' : 'rgba(255,255,255,0.07)'}`,
                background: active ? 'rgba(155,127,248,0.12)' : 'transparent',
                color: active ? '#9b7ff8' : '#555',
                cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}
            >
              {interest}
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          type="text"
          placeholder="Add custom interest"
          value={customInterest}
          onChange={e => setCustomInterest(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomInterest())}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, background: '#0c0c0c',
            border: `1px solid ${focused ? 'rgba(155,127,248,0.45)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 3, padding: '10px 14px', color: '#f0f0f0',
            fontFamily: 'var(--font-heading)', fontSize: 13, outline: 'none',
            transition: 'border-color 0.18s',
          }}
        />
        <button
          type="button"
          onClick={addCustomInterest}
          style={{
            background: 'transparent', border: '1px solid rgba(155,127,248,0.25)',
            borderRadius: 3, padding: '10px 16px',
            fontFamily: 'var(--font-mono)', fontSize: 12, color: '#9b7ff8', cursor: 'pointer',
          }}
        >
          +
        </button>
      </div>

      {error && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#f87171', letterSpacing: '0.04em', marginTop: 8 }}>
          {error}
        </p>
      )}
    </div>
  )
}
