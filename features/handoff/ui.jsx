'use client'
/* eslint-disable @typescript-eslint/no-unused-vars, react/no-unescaped-entities, @next/next/no-img-element */

import React from 'react'

// SAYE Collective v2 — Design System + UI Components
// Type scale: Hero 96-140px · H1 56-72px · H2 32-48px · H3 24px · Body 15-17px · Label 13px · Meta 12px

export const T = {
  bg:      '#080808',
  bg2:     '#0d0d0d',
  bg3:     '#121212',
  surf:    '#141414',
  surf2:   '#1a1a1a',
  line:    'rgba(255,255,255,0.07)',
  lineB:   'rgba(255,255,255,0.12)',
  text:    '#f2f2f2',
  sub:     '#aaa',
  muted:   '#9a9a9a',
  faint:   '#7a7a7a',
  // Role palette
  artist:  '#9b7ff8',   // purple
  curator: '#c8c8c8',   // silver
  inst:    '#e8e8e8',   // white
  // Derived
  artistDim:  'rgba(155,127,248,0.12)',
  curatorDim: 'rgba(200,200,200,0.08)',
  instDim:    'rgba(232,232,232,0.06)',
};

export const ROLE_CONFIG = {
  Artist:      { color: T.artist,  dim: T.artistDim,  border: 'rgba(155,127,248,0.25)', mark: '◈' },
  Curator:     { color: T.curator, dim: T.curatorDim, border: 'rgba(200,200,200,0.2)',  mark: '⊞' },
  Institution: { color: T.inst,    dim: T.instDim,    border: 'rgba(232,232,232,0.15)', mark: '▣' },
};

// ─── TYPOGRAPHY HELPERS ────────────────────────────────────────────────────

export function Label({ children, color, size, tracking, style: ex }) {
  return (
    <span style={{
      fontFamily: "'DM Mono', monospace",
      fontSize: size || 13,
      letterSpacing: tracking || '0.06em',
      color: color || T.muted,
      textTransform: 'uppercase',
      ...ex,
    }}>{children}</span>
  );
}

export function RuleLine({ color, margin }) {
  return <div style={{ height: 1, background: color || T.line, margin: margin || '0' }} />;
}

// Left-border section marker
export function SectionMark({ n, label, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 3, height: 36, background: color || T.artist, borderRadius: 2, flexShrink: 0 }} />
      <div>
        <Label size={11} color={color || T.artist} tracking="0.12em">{String(n).padStart(2,'0')}</Label>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13, color: T.sub, letterSpacing: '0.04em', marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

// Role badge
export function RoleBadge({ role, size }) {
  const r = ROLE_CONFIG[role] || ROLE_CONFIG.Artist;
  const sz = size || 13;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontFamily: "'DM Mono', monospace", fontSize: sz,
      letterSpacing: '0.06em', textTransform: 'uppercase',
      color: r.color, background: r.dim, border: `1px solid ${r.border}`,
      padding: `${sz < 12 ? 2 : 4}px ${sz < 12 ? 8 : 12}px`, borderRadius: 3,
    }}>
      <span style={{ fontSize: sz + 1 }}>{r.mark}</span>
      {role}
    </span>
  );
}

// ─── NAV ──────────────────────────────────────────────────────────────────

export function SayeNav2({ current, navigate, navState, navigatePath, onSignOut }) {
  const [hov, setHov] = React.useState(null);
  const isAuthenticated = Boolean(navState?.isAuthenticated);
  const profileId = navState?.profileId;
  const ctaLabel = isAuthenticated ? (profileId ? 'Profile ->' : 'Complete Profile ->') : 'Join ->';
  const ctaPath = isAuthenticated ? (profileId ? `/profile/${profileId}` : '/build-profile') : '/build-profile';
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      height: 60, display: 'flex', alignItems: 'center',
      padding: '0 48px', gap: 0,
      background: 'rgba(8,8,8,0.9)', backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${T.line}`,
    }}>
      {/* Wordmark */}
      <div onClick={() => navigate('landing')}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'baseline', gap: 8, marginRight: 48 }}>
        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 15, letterSpacing: '0.18em', color: T.text }}>SAYE</span>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: '0.14em', color: T.artist }}>COLLECTIVE</span>
      </div>

      <div style={{ width: 1, height: 20, background: T.line, marginRight: 48 }} />

      {/* Links */}
      {[['Discover','discover'],['Archive','archive']].map(([lbl,sc]) => (
        <button key={sc} onClick={() => navigate(sc)}
          onMouseEnter={() => setHov(sc)} onMouseLeave={() => setHov(null)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '0 20px', height: 60,
            fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 500,
            color: current === sc ? T.text : hov === sc ? T.sub : T.muted,
            borderBottom: `2px solid ${current === sc ? T.artist : 'transparent'}`,
            transition: 'color 0.15s, border-color 0.15s',
          }}>{lbl}</button>
      ))}

      {/* Right side */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={isAuthenticated ? onSignOut : () => navigate('auth')}
          onMouseEnter={() => setHov('in')} onMouseLeave={() => setHov(null)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, color: hov === 'in' ? T.sub : T.muted, transition: 'color 0.15s' }}>
          {isAuthenticated ? 'Log out' : 'Sign In'}
        </button>
        <Btn2 onClick={() => navigatePath ? navigatePath(ctaPath) : navigate('build-profile')}>{ctaLabel}</Btn2>
      </div>
    </nav>
  );
}

// ─── BUTTONS ──────────────────────────────────────────────────────────────

export function Btn2({ children, variant = 'primary', onClick, full, disabled, style: ex }) {
  const [h, setH] = React.useState(false);
  const base = {
    fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 14,
    letterSpacing: '0.04em', cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none', transition: 'all 0.15s', borderRadius: 3,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: full ? '100%' : 'auto', opacity: disabled ? 0.4 : 1,
  };
  const vs = {
    primary:   { background: h ? '#b49fff' : T.artist, color: '#080808', padding: '12px 28px' },
    secondary: { background: 'transparent', color: h ? T.text : T.sub, padding: '12px 28px', border: `1px solid ${h ? T.lineB : T.line}` },
    ghost:     { background: h ? T.artistDim : 'transparent', color: T.artist, padding: '10px 20px', border: `1px solid ${h ? 'rgba(155,127,248,0.35)' : 'rgba(155,127,248,0.18)'}` },
    outline:   { background: 'transparent', color: h ? T.text : T.muted, padding: '10px 20px', border: `1px solid ${T.line}` },
    connected: { background: h ? '#7c5add' : '#6a4fc9', color: '#f2f2f2', padding: '12px 28px' },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ ...base, ...(vs[variant]||vs.primary), ...ex }}>
      {children}
    </button>
  );
}

// ─── INPUT ────────────────────────────────────────────────────────────────

export function Input2({ label, placeholder, type = 'text', value, onChange, textarea, rows }) {
  const [foc, setFoc] = React.useState(false);
  const sharedStyle = {
    background: T.bg2, border: `1px solid ${foc ? 'rgba(155,127,248,0.4)' : T.line}`,
    borderRadius: 3, padding: '13px 16px', color: T.text,
    fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, outline: 'none',
    transition: 'border-color 0.15s', width: '100%', boxSizing: 'border-box',
    boxShadow: foc ? '0 0 0 3px rgba(155,127,248,0.05)' : 'none',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {label && <Label size={12} color={T.muted}>{label}</Label>}
      {textarea
        ? <textarea placeholder={placeholder} value={value} onChange={onChange}
            onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
            rows={rows || 4}
            style={{ ...sharedStyle, resize: 'vertical', lineHeight: 1.6 }} />
        : <input type={type} placeholder={placeholder} value={value} onChange={onChange}
            onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
            style={sharedStyle} />
      }
    </div>
  );
}

// ─── FILTER CHIP (v2 — minimal, text-forward) ─────────────────────────────

export function Chip2({ label, active, onClick }) {
  const [h, setH] = React.useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: active ? 600 : 400,
        padding: '6px 14px', borderRadius: 2,
        border: `1px solid ${active ? T.artist : h ? T.lineB : T.line}`,
        background: active ? T.artistDim : h ? 'rgba(255,255,255,0.025)' : 'transparent',
        color: active ? T.artist : h ? T.sub : T.muted,
        cursor: 'pointer', transition: 'all 0.13s', whiteSpace: 'nowrap',
      }}>{label}</button>
  );
}

// ─── ROLE CARD (Build Profile — architecturally distinct) ─────────────────

export function RoleCard2({ role, desc, selected, onClick }) {
  const [h, setH] = React.useState(false);
  const r = ROLE_CONFIG[role];
  const on = selected || h;

  const motif = {
    Artist: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="40" r="28" stroke={r.color} strokeWidth="0.75" opacity="0.4"/>
        <circle cx="40" cy="40" r="16" stroke={r.color} strokeWidth="0.75" opacity="0.6"/>
        <path d="M40 12 L40 68 M12 40 L68 40" stroke={r.color} strokeWidth="0.5" opacity="0.3"/>
        <circle cx="40" cy="40" r="5" fill={r.color} opacity={on ? 0.9 : 0.4}/>
      </svg>
    ),
    Curator: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="12" y="12" width="56" height="56" stroke={r.color} strokeWidth="0.75" opacity="0.4"/>
        <rect x="22" y="22" width="36" height="36" stroke={r.color} strokeWidth="0.75" opacity="0.5"/>
        <rect x="32" y="32" width="16" height="16" fill={r.color} opacity={on ? 0.7 : 0.25}/>
        <line x1="12" y1="40" x2="22" y2="40" stroke={r.color} strokeWidth="0.75" opacity="0.4"/>
        <line x1="58" y1="40" x2="68" y2="40" stroke={r.color} strokeWidth="0.75" opacity="0.4"/>
      </svg>
    ),
    Institution: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="30" width="40" height="30" stroke={r.color} strokeWidth="0.75" opacity="0.5"/>
        <path d="M16 30 L40 14 L64 30" stroke={r.color} strokeWidth="0.75" opacity="0.5"/>
        <rect x="32" y="46" width="16" height="14" stroke={r.color} strokeWidth="0.75" opacity="0.4"/>
        <line x1="20" y1="60" x2="60" y2="60" stroke={r.color} strokeWidth="1.5" opacity={on ? 0.8 : 0.3}/>
      </svg>
    ),
  };

  return (
    <div onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        flex: 1, minWidth: 220, padding: '36px 28px 32px',
        background: selected ? `linear-gradient(160deg, rgba(${role==='Artist'?'155,127,248':role==='Curator'?'200,200,200':'232,232,232'},0.05) 0%, ${T.surf} 60%)` : T.surf,
        borderTopStyle: 'solid',
        borderRightStyle: 'solid',
        borderBottomStyle: 'solid',
        borderLeftStyle: 'solid',
        borderTopWidth: 3,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        borderTopColor: selected ? r.color : on ? r.color : T.line,
        borderRightColor: selected ? r.border : on ? T.lineB : T.line,
        borderBottomColor: selected ? r.border : on ? T.lineB : T.line,
        borderLeftColor: selected ? r.border : on ? T.lineB : T.line,
        borderRadius: 4, cursor: 'pointer', transition: 'all 0.2s',
        transform: selected ? 'translateY(-3px)' : 'none',
        boxShadow: selected ? `0 16px 48px rgba(0,0,0,0.4)` : 'none',
      }}>
      <div style={{ marginBottom: 24, opacity: on ? 1 : 0.5, transition: 'opacity 0.2s' }}>{motif[role]}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, color: selected ? r.color : T.text, transition: 'color 0.2s' }}>{role}</span>
        {selected && <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: r.color, letterSpacing: '0.08em' }}>SELECTED</span>}
      </div>
      <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, color: T.muted, lineHeight: 1.65, margin: 0 }}>{desc}</p>
    </div>
  );
}

// ─── DISCOVER CARD v2 ─────────────────────────────────────────────────────

const CARD_BKGS = ['#140820','#081408','#140808','#08081c','#140f00'];

export function DiscoverCard2({ name, role, discipline, location, tags, avatarUrl, onClick }) {
  const [h, setH] = React.useState(false);
  const r = ROLE_CONFIG[role] || ROLE_CONFIG.Artist;
  const bkg = CARD_BKGS[name.charCodeAt(0) % CARD_BKGS.length];

  return (
    <div onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: T.surf, border: `1px solid ${h ? T.lineB : T.line}`,
        borderRadius: 4, overflow: 'hidden', cursor: 'pointer',
        transition: 'all 0.18s', transform: h ? 'translateY(-2px)' : 'none',
        boxShadow: h
          ? `inset 3px 0 0 ${r.color}, 0 8px 32px rgba(0,0,0,0.4)`
          : `inset 3px 0 0 ${r.border}`,
      }}>
      {/* Header strip */}
      <div style={{ height: 64, background: `linear-gradient(135deg,${bkg},${T.surf})`, display: 'flex', alignItems: 'center', padding: '0 18px', gap: 14, position: 'relative' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: r.dim, border: `1px solid ${r.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16, color: r.color, flexShrink: 0, overflow: 'hidden' }}>
          {avatarUrl
            ? <img src={avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : name.charAt(0)}
        </div>
        <div style={{ position: 'absolute', top: 10, right: 12 }}><RoleBadge role={role} size={11} /></div>
      </div>

      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 16, color: T.text, marginBottom: 4 }}>{name}</div>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: T.muted, marginBottom: 14 }}>{discipline} · {location}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {tags.slice(0,3).map(t => <span key={t} style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: T.faint, padding: '2px 7px', border: `1px solid ${T.line}`, borderRadius: 2 }}>#{t}</span>)}
        </div>
        <div style={{
          marginTop: 12,
          fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, color: T.muted,
          opacity: h ? 1 : 0, transition: 'opacity 0.15s',
        }}>View profile →</div>
      </div>
    </div>
  );
}

// ─── ARCHIVE CARD v2 (gallery-grade) ─────────────────────────────────────

export function ArchiveCard2({ type, title, content, author, authorRole, date, link, hint, span, tall, itemId, isOwner, onDelete, onExpand }) {
  const [h, setH] = React.useState(false);
  const r = ROLE_CONFIG[authorRole] || ROLE_CONFIG.Artist;
  const linkHref = type === 'link' && content
    ? (/^https?:\/\//i.test(content) ? content : `https://${content}`)
    : null;

  return (
    <div
      onClick={() => onExpand?.()}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: T.surf, border: `1px solid ${h ? T.lineB : T.line}`,
        borderRadius: 4, overflow: 'hidden', cursor: 'pointer',
        transition: 'all 0.18s', transform: h ? 'translateY(-2px)' : 'none',
        boxShadow: h ? '0 10px 36px rgba(0,0,0,0.45)' : 'none',
        display: 'flex', flexDirection: 'column', height: '100%', position: 'relative',
      }}>

      {/* Expand hint */}
      <div style={{
        position: 'absolute', bottom: 10, right: 12, zIndex: 2,
        fontFamily: "'DM Mono',monospace", fontSize: 10, color: T.faint,
        letterSpacing: '0.06em', pointerEvents: 'none',
        opacity: h ? 1 : 0, transition: 'opacity 0.15s',
      }}>expand ↗</div>

      {/* IMAGE CARD — magazine overlay style */}
      {type === 'image' && (
        <div style={{ flex: 1, minHeight: tall ? 320 : 220, background: `linear-gradient(160deg, #18082e 0%, #0a0a14 100%)`, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          {content && /^https?:\/\//i.test(content) && (
            <img src={content} alt={title || 'Archive item'} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.68 }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(6,6,6,0.8) 0%, rgba(8,8,8,0.34) 38%, rgba(6,6,6,0.9) 100%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 85% at 50% 20%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.5) 100%)', pointerEvents: 'none' }} />
          {/* Diagonal stripe texture */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }} xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id={`stripe-${title.slice(0,4)}`} width="20" height="20" patternTransform="rotate(45)" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="0" y2="20" stroke="white" strokeWidth="1"/></pattern></defs>
            <rect width="100%" height="100%" fill={`url(#stripe-${title.slice(0,4)})`}/>
          </svg>
          {/* Hint label */}
          {hint && (
            <div
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                fontFamily: "'DM Mono',monospace",
                fontSize: 11,
                color: 'rgba(238,238,238,0.82)',
                letterSpacing: '0.06em',
                background: 'rgba(8,8,8,0.62)',
                border: `1px solid ${T.lineB}`,
                borderRadius: 3,
                padding: '4px 8px',
                backdropFilter: 'blur(6px)',
              }}
            >
              {hint}
            </div>
          )}
          {/* Title overlay */}
          <div style={{ padding: '0 20px 20px', background: 'linear-gradient(to top, rgba(8,8,8,0.97) 0%, rgba(8,8,8,0.2) 65%, transparent 100%)', paddingTop: 56 }}>
            <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 8, background: 'rgba(8,8,8,0.64)', border: `1px solid ${T.lineB}`, borderRadius: 6, padding: '10px 12px', backdropFilter: 'blur(8px)', maxWidth: '92%' }}>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: span ? 22 : 17, color: '#f7f7f7', lineHeight: 1.25, textShadow: '0 3px 16px rgba(0,0,0,0.72)' }}>{title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: '#ececec', textShadow: '0 2px 10px rgba(0,0,0,0.68)' }}>{author}</span>
              {authorRole && <RoleBadge role={authorRole} size={11} />}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TEXT CARD — pull-quote style */}
      {type === 'text' && (
        <div style={{ flex: 1, padding: '24px 24px 20px', display: 'flex', flexDirection: 'column' }}>
          {/* Drop cap / quote mark */}
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 72, lineHeight: 0.7, color: T.artist, opacity: 0.18, marginBottom: 20, userSelect: 'none' }}>"</div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 16, color: T.text, lineHeight: 1.45, marginBottom: 12, flex: 1 }}>{title}</div>
          {content && <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, color: T.muted, lineHeight: 1.65, marginBottom: 16 }}>{content}</div>}
          <RuleLine margin="0 0 14px" />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: T.muted }}>{author}</span>
              {authorRole && <RoleBadge role={authorRole} size={11} />}
            </div>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: T.faint }}>{date}</span>
          </div>
        </div>
      )}

      {/* LINK CARD — domain hero */}
      {type === 'link' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${T.line}`, background: T.bg2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.artist, flexShrink: 0 }} />
              <Label size={12} color={T.artist}>{link || 'External Link'}</Label>
            </div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 16, color: T.text, lineHeight: 1.35 }}>{title}</div>
          </div>
          <div style={{ padding: '14px 24px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {content && <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, color: T.muted, lineHeight: 1.6, marginBottom: 14 }}>{content}</div>}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: T.muted }}>{author}</span>
                {authorRole && <RoleBadge role={authorRole} size={11} />}
              </div>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: T.faint }}>{date}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ArchivePrimeCard({ type, title, content, body, imageUrl, referenceUrl, author, authorRole, date, link, onExpand, onHover, expanded }) {
  const r = ROLE_CONFIG[authorRole] || ROLE_CONFIG.Artist;
  const previewImage = imageUrl || (content && /^https?:\/\//i.test(content) && type === 'image' ? content : '');
  const description = body || (type === 'link' ? referenceUrl || link : previewImage ? '' : content);
  const displayTitle = title || '[Untitled]';

  return (
    <div
      data-archive-prime-card="true"
      data-archive-prime-key={String(title || content || link || '')}
      onClick={() => onExpand?.()}
      onMouseEnter={event => onHover?.(event.currentTarget)}
      onFocus={event => onHover?.(event.currentTarget)}
      style={{
        background: T.surf,
        border: `1px solid ${expanded ? T.lineB : T.line}`,
        borderRadius: 4,
        overflow: 'visible',
        cursor: 'pointer',
        transition: 'transform 150ms ease, border-color 150ms ease, box-shadow 150ms ease',
        transform: expanded ? 'translateY(-4px) scale(1.285)' : 'translateY(0) scale(1)',
        transformOrigin: 'top left',
        boxShadow: expanded ? '0 22px 54px rgba(0,0,0,0.64)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        flex: '0 0 auto',
        width: 280,
        height: 158,
        zIndex: expanded ? 20 : 1,
      }}
      tabIndex={0}
      role="button"
    >
      <div style={{ height: '100%', background: `linear-gradient(145deg, ${r.dim}, ${T.bg2})`, position: 'relative', overflow: 'hidden', borderRadius: expanded ? '4px 4px 0 0' : 4 }}>
        {previewImage ? (
          <img src={previewImage} alt={displayTitle} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.86 }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 22, textAlign: 'center', fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, fontWeight: 800, color: T.text, lineHeight: 1.15, overflow: 'hidden' }}>
            <span className="clamp-4">{displayTitle}</span>
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.18), rgba(0,0,0,0))', pointerEvents: 'none' }} />
      </div>
      <div
        style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: '#070707',
          borderTop: `1px solid ${T.line}`,
          borderRadius: '0 0 4px 4px',
          opacity: expanded ? 1 : 0,
          transform: expanded ? 'translateY(0)' : 'translateY(-8px)',
          pointerEvents: expanded ? 'auto' : 'none',
          transition: 'opacity 150ms ease, transform 150ms ease',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '14px 16px 16px' }}>
          <div className="clamp-2" style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 17, color: T.text, lineHeight: 1.22, marginBottom: 8 }}>{displayTitle}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: description ? 10 : 0 }}>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: T.sub }}>{author}</span>
            {authorRole && <RoleBadge role={authorRole} size={10} />}
            {date && <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: T.faint }}>{date}</span>}
          </div>
          {type === 'link' && link && <Label size={10} color={T.artist}>{link}</Label>}
          {description && (
            <div
              className="clamp-3"
              style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: T.muted, lineHeight: 1.55, marginTop: type === 'link' && link ? 8 : 0 }}
            >
              {description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ArchivePrimeRail({ title, items, onExpand }) {
  const railRef = React.useRef(null);
  const wrapperRef = React.useRef(null);
  const pointerRef = React.useRef(null);
  const hoverDelayRef = React.useRef(null);
  const [hoveredKey, setHoveredKey] = React.useState(null);
  const [rowActive, setRowActive] = React.useState(false);
  const [canScroll, setCanScroll] = React.useState(false);

  const updateCanScroll = React.useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    setCanScroll(rail.scrollWidth > rail.clientWidth + 2);
  }, []);

  React.useEffect(() => {
    updateCanScroll();
    window.addEventListener('resize', updateCanScroll);
    return () => window.removeEventListener('resize', updateCanScroll);
  }, [items.length, updateCanScroll]);

  const itemKey = React.useCallback(item => String(item.id || item.title || item.content || item.link || ''), []);

  const showPreview = React.useCallback((item) => {
    setHoveredKey(itemKey(item));
    updateCanScroll();
  }, [itemKey, updateCanScroll]);

  const schedulePreviewFromPointer = React.useCallback((delay = 300) => {
    if (!pointerRef.current) return;
    if (hoverDelayRef.current) window.clearTimeout(hoverDelayRef.current);
    hoverDelayRef.current = window.setTimeout(() => {
      const card = document.elementFromPoint(pointerRef.current.x, pointerRef.current.y)?.closest?.('[data-archive-prime-card]');
      if (!card || !railRef.current?.contains(card)) return;
      const index = Array.from(railRef.current.children).indexOf(card);
      const item = items[index];
      if (item) showPreview(item);
    }, delay);
  }, [items, showPreview]);

  React.useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const onWheel = (event) => {
      const rail = railRef.current;
      if (!rail || rail.scrollWidth <= rail.clientWidth + 2) return;

      const horizontalIntent = Math.abs(event.deltaX) >= Math.abs(event.deltaY);
      const rawDelta = horizontalIntent ? event.deltaX : event.shiftKey ? event.deltaY : 0;
      if (!rawDelta) return;

      const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? rail.clientWidth : 1;
      const speed = 1;
      event.preventDefault();
      event.stopPropagation();
      rail.scrollLeft = Math.max(0, Math.min(rail.scrollLeft + rawDelta * scale * speed, rail.scrollWidth - rail.clientWidth));
      schedulePreviewFromPointer(150);
    };

    wrapper.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      wrapper.removeEventListener('wheel', onWheel);
      if (hoverDelayRef.current) window.clearTimeout(hoverDelayRef.current);
    };
  }, [items, schedulePreviewFromPointer]);

  if (!items.length) return null;

  const scrollRail = (dir) => {
    const rail = railRef.current;
    if (!rail) return;
    const cards = Array.from(rail.children);
    const currentLeft = rail.scrollLeft;
    const visibleRight = currentLeft + rail.clientWidth;
    const margin = 8;
    const target = dir > 0
      ? cards.find(card => card.offsetLeft + margin >= visibleRight)
      : [...cards].reverse().find(card => card.offsetLeft + card.offsetWidth <= currentLeft - margin);

    if (target) {
      const left = dir > 0
        ? target.offsetLeft
        : Math.max(0, target.offsetLeft + target.offsetWidth - rail.clientWidth);
      rail.scrollTo({ left, behavior: 'smooth' });
      return;
    }
    rail.scrollTo({ left: dir > 0 ? rail.scrollWidth : 0, behavior: 'smooth' });
  };

  return (
    <section style={{ marginBottom: -226, position: 'relative' }}>
      <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 22, color: T.text, margin: '0 0 12px' }}>{title}</h2>
      <div
        ref={wrapperRef}
        style={{ position: 'relative', height: 440, overflow: 'visible', overscrollBehaviorX: canScroll ? 'contain' : 'auto', touchAction: canScroll ? 'pan-x' : 'auto' }}
        onMouseEnter={() => setRowActive(true)}
        onMouseMove={event => {
          pointerRef.current = { x: event.clientX, y: event.clientY };
        }}
        onMouseLeave={() => {
          setRowActive(false);
          setHoveredKey(null);
          pointerRef.current = null;
          if (hoverDelayRef.current) window.clearTimeout(hoverDelayRef.current);
        }}
      >
        {rowActive && canScroll && (
          <button
            type="button"
            onClick={() => scrollRail(-1)}
            aria-label={`Previous ${title}`}
            className="archive-rail-arrow"
            style={{
              position: 'absolute',
              left: -18,
              top: 52,
              zIndex: 24,
              width: 42,
              height: 64,
              border: `1px solid ${T.lineB}`,
              borderRadius: 4,
              background: 'rgba(8,8,8,0.78)',
              color: T.text,
              fontSize: 30,
              cursor: 'pointer',
            }}
          >
            &lsaquo;
          </button>
        )}
        <div
          ref={railRef}
          className="archive-prime-strip"
          style={{
            display: 'flex',
            gap: 14,
            overflowX: 'auto',
            overflowY: 'hidden',
            padding: '4px 28px 18px 0',
            scrollbarWidth: 'none',
            height: 440,
            overscrollBehaviorX: canScroll ? 'contain' : 'auto',
          }}
          onScroll={() => {
            updateCanScroll();
          }}
        >
          {items.map(item => (
            <ArchivePrimeCard
              key={item.id || item.title}
              {...item}
              onExpand={() => onExpand(item)}
              onHover={() => showPreview(item)}
              expanded={hoveredKey === itemKey(item)}
            />
          ))}
        </div>
        {rowActive && canScroll && (
          <button
            type="button"
            onClick={() => scrollRail(1)}
            aria-label={`Next ${title}`}
            className="archive-rail-arrow"
            style={{
              position: 'absolute',
              right: -18,
              top: 52,
              zIndex: 24,
              width: 42,
              height: 64,
              border: `1px solid ${T.lineB}`,
              borderRadius: 4,
              background: 'rgba(8,8,8,0.78)',
              color: T.text,
              fontSize: 30,
              cursor: 'pointer',
            }}
          >
            &rsaquo;
          </button>
        )}
      </div>
      <style jsx>{`
        .archive-prime-strip::-webkit-scrollbar {
          display: none;
        }

        .archive-rail-arrow:hover {
          background: rgba(20, 20, 20, 0.94) !important;
          border-color: rgba(255, 255, 255, 0.24) !important;
        }
      `}</style>
    </section>
  );
}
