import type { ProfileRole } from '@/lib/types'

interface RoleCardProps {
  role: ProfileRole
  tagline: string
  selected: boolean
  onSelect: (role: ProfileRole) => void
}

const glyphs: Record<ProfileRole, string> = {
  Artist: '◈',
  Curator: '◎',
  Institution: '▣',
}

export function RoleCard({ role, tagline, selected, onSelect }: RoleCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(role)}
      onKeyDown={e => e.key === 'Enter' && onSelect(role)}
      style={{
        flex: 1, minWidth: 220, padding: '40px 32px',
        background: selected ? 'rgba(155,127,248,0.07)' : '#111111',
        border: `1px solid ${selected ? '#9b7ff8' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 8, cursor: 'pointer', transition: 'all 0.22s',
        position: 'relative', overflow: 'hidden',
        outline: 'none',
      }}
      className={!selected ? 'hover:!bg-[rgba(255,255,255,0.025)] hover:!border-[rgba(255,255,255,0.1)]' : ''}
    >
      {selected && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 0%, rgba(155,127,248,0.1) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
      )}
      <div style={{ fontSize: 40, marginBottom: 24, transition: 'transform 0.22s' }}>
        {glyphs[role]}
      </div>
      <div style={{
        fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20,
        color: selected ? '#9b7ff8' : '#f0f0f0',
        marginBottom: 10, transition: 'color 0.22s',
      }}>
        {role}
      </div>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: '#9a9a9a', lineHeight: 1.65 }}>
        {tagline}
      </div>
      {selected && (
        <div style={{
          marginTop: 20, fontFamily: 'var(--font-mono)', fontSize: 9,
          letterSpacing: '0.12em', color: '#9b7ff8',
        }}>
          SELECTED ✓
        </div>
      )}
    </div>
  )
}
