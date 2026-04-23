'use client'

import { useState } from 'react'
import { INTEREST_PRESETS } from '@/lib/constants'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface InterestPickerProps {
  value: string[]
  onChange: (nextValue: string[]) => void
  error?: string
}

export function InterestPicker({ value, onChange, error }: InterestPickerProps) {
  const [customInterest, setCustomInterest] = useState('')

  const toggleInterest = (interest: string) => {
    if (value.includes(interest)) {
      onChange(value.filter(item => item !== interest))
      return
    }

    onChange([...value, interest])
  }

  const addCustomInterest = () => {
    const trimmed = customInterest.trim()
    if (!trimmed || value.includes(trimmed)) {
      return
    }

    onChange([...value, trimmed])
    setCustomInterest('')
  }

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {INTEREST_PRESETS.map(interest => {
          const active = value.includes(interest)
          return (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`px-3 py-2 rounded-lg border text-sm transition text-left ${
                active
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white/5 border-white/10 text-text-muted hover:border-accent'
              }`}
            >
              {interest}
            </button>
          )
        })}
      </div>

      <div className="flex gap-2 mt-3">
        <Input
          id="custom-interest"
          placeholder="Add custom interest"
          value={customInterest}
          onChange={e => setCustomInterest(e.target.value)}
        />
        <Button type="button" onClick={addCustomInterest}>
          +
        </Button>
      </div>

      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  )
}
