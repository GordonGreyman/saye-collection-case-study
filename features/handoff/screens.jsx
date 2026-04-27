'use client'
/* eslint-disable @typescript-eslint/no-unused-vars, react-hooks/set-state-in-effect */

import React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ArchivePrimeRail, Btn2, Chip2, DiscoverCard2, Input2, Label, ROLE_CONFIG, RoleBadge, RoleCard2, RuleLine, SectionMark, T } from '@/features/handoff/ui'
import { createClient } from '@/lib/supabase/client'
import { buildDiscoverUrl } from '@/features/discover/filters'
import { useToast } from '@/components/ui/ToastProvider'
import { connectProfiles, disconnectProfiles, saveProfileAvatar, saveProfileBanner, upsertProfile } from '@/features/profiles/actions'
import { uploadAvatarImage } from '@/features/profiles/avatar'
import { DISCIPLINE_PRESETS, GEOGRAPHY_PRESETS, PROFILE_BANNER_COLORS } from '@/lib/constants'
import { AnimatePresence, motion } from 'framer-motion'
import { draftFromArchiveEntry, domainFromUrl, resolveArchiveEntry } from '@/features/archive/entry'
import { PostDetailOverlay } from '@/features/archive/PostDetailOverlay'
import { ArchiveComposerOverlay } from '@/features/archive/ArchiveComposerOverlay'
import { uploadArchiveImage } from '@/features/archive/upload'
import { Camera, Image as ImageIcon, Move, X } from 'lucide-react'

function formatArchiveDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(new Date(value))
}

function archiveTitle(item) {
  return resolveArchiveEntry(item).title
}

function archiveDraftFromItem(item) {
  return draftFromArchiveEntry(item)
}

function archiveRowsFor(items) {
  return [
    { id: 'text', title: 'Texts', items: items.filter(item => item.type === 'text') },
    { id: 'image', title: 'Images', items: items.filter(item => item.type === 'image') },
    { id: 'link', title: 'Links', items: items.filter(item => item.type === 'link') },
  ]
}

function bannerNumber(value, fallback = 50) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

const ROLE_PROFILE_COPY = {
  Artist: {
    heading: 'Shape your',
    accent: 'practice.',
    bio: 'Describe your practice, materials, questions, or current body of work...',
    location: 'Where your practice is based',
    submit: 'Create Artist Profile',
  },
  Curator: {
    heading: 'Frame your',
    accent: 'curatorial lens.',
    bio: 'Describe your research interests, exhibition focus, or the conversations you are building...',
    location: 'Where you curate from',
    submit: 'Create Curator Profile',
  },
  Institution: {
    heading: 'Present your',
    accent: 'program.',
    bio: 'Describe your space, program, residency, collection, or public mission...',
    location: 'City, region, or communities served',
    submit: 'Create Institution Profile',
  },
}

function profileCopyFor(role) {
  return ROLE_PROFILE_COPY[role] ?? {
    heading: 'Shape your',
    accent: 'identity.',
    bio: 'A brief statement about your practice, approach, or institution...',
    location: 'City, Country',
    submit: 'Create Profile',
  }
}

// SAYE Collective v2 — Screen Components
// Font sizes: Hero 96-140px · H1 56-72px · H2 32-48px · Body 15-17px · Label 13px · Meta 12px (min)

// --- LANDING ---------------------------------------------------------------
export function LandingScreen2({ navigate }) {
  const [hov, setHov] = React.useState(null);

  const stats = [
    { n: '2.4K', label: 'Artists' },
    { n: '380',  label: 'Curators' },
    { n: '120',  label: 'Institutions' },
    { n: '14',   label: 'Countries' },
  ];

  const features = [
    {
      n: 1, color: T.artist, label: 'Smart Profiles',
      title: 'Build your creative identity.',
      body: 'Choose your role — Artist, Curator, or Institution — and shape a profile that travels. Rich media, discipline tags, geographic reach.',
      cta: 'Build Profile', screen: 'build-profile',
    },
    {
      n: 2, color: T.curator, label: 'Triple-Filter Search',
      title: 'Find exactly who you need.',
      body: 'Filter simultaneously by geography, discipline, and interest. Real-time results surface the right collaborators instantly.',
      cta: 'Discover', screen: 'discover',
    },
    {
      n: 3, color: T.inst, label: 'The Archive',
      title: 'A living exhibition wall.',
      body: 'Share text, images, and links in a curated grid. Each post becomes part of a collective document — searchable, citable, enduring.',
      cta: 'Browse Archive', screen: 'archive',
    },
  ];

  const featureVis = [
    // 1 — Smart Profiles: identity network
    <svg key="f1" width="100%" viewBox="0 0 440 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: 400, opacity: 0.75 }}>
      <circle cx="220" cy="150" r="110" stroke={T.artist} strokeWidth="0.5" opacity="0.1"/>
      <circle cx="220" cy="150" r="60" stroke={T.artist} strokeWidth="0.5" opacity="0.15"/>
      <line x1="220" y1="150" x2="118" y2="80"  stroke={T.artist} strokeWidth="0.75" strokeDasharray="5 9" opacity="0.22"/>
      <line x1="220" y1="150" x2="338" y2="88"  stroke={T.artist} strokeWidth="0.75" strokeDasharray="5 9" opacity="0.22"/>
      <line x1="220" y1="150" x2="108" y2="234" stroke={T.artist} strokeWidth="0.75" strokeDasharray="5 9" opacity="0.22"/>
      <line x1="220" y1="150" x2="338" y2="232" stroke={T.artist} strokeWidth="0.75" strokeDasharray="5 9" opacity="0.22"/>
      <line x1="220" y1="150" x2="220" y2="44"  stroke={T.artist} strokeWidth="0.75" strokeDasharray="5 9" opacity="0.18"/>
      <line x1="118" y1="80"  x2="220" y2="44"  stroke={T.artist} strokeWidth="0.5"  opacity="0.1"/>
      <line x1="338" y1="88"  x2="338" y2="232" stroke={T.artist} strokeWidth="0.5"  opacity="0.1"/>
      <circle cx="220" cy="150" r="22" fill={T.artistDim} stroke={T.artist} strokeWidth="1"/>
      <circle cx="220" cy="150" r="7"  fill={T.artist} opacity="0.8"/>
      <circle cx="118" cy="80"  r="14" fill="rgba(155,127,248,0.06)" stroke={T.artist} strokeWidth="0.75" opacity="0.65"/>
      <text x="118" y="84"  textAnchor="middle" fontFamily="DM Mono,monospace" fontSize="9" fill={T.artist} opacity="0.5">A</text>
      <circle cx="338" cy="88"  r="12" fill="rgba(155,127,248,0.06)" stroke={T.artist} strokeWidth="0.75" opacity="0.55"/>
      <text x="338" y="92"  textAnchor="middle" fontFamily="DM Mono,monospace" fontSize="9" fill={T.artist} opacity="0.45">C</text>
      <circle cx="108" cy="234" r="16" fill="rgba(155,127,248,0.06)" stroke={T.artist} strokeWidth="0.75" opacity="0.5"/>
      <text x="108" y="238" textAnchor="middle" fontFamily="DM Mono,monospace" fontSize="9" fill={T.artist} opacity="0.4">I</text>
      <circle cx="338" cy="232" r="10" fill="rgba(155,127,248,0.06)" stroke={T.artist} strokeWidth="0.75" opacity="0.45"/>
      <circle cx="220" cy="44"  r="8"  fill="rgba(155,127,248,0.06)" stroke={T.artist} strokeWidth="0.75" opacity="0.4"/>
    </svg>,
    // 2 — Triple-Filter: converging filter bars
    <svg key="f2" width="100%" viewBox="0 0 440 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: 400, opacity: 0.75 }}>
      <rect x="58"  y="72"  width="324" height="38" rx="3" stroke={T.curator} strokeWidth="0.75" fill={T.curator} fillOpacity="0.03" opacity="0.5"/>
      <text x="78"  y="96"  fontFamily="DM Mono,monospace" fontSize="10" fill={T.curator} opacity="0.28" letterSpacing="3">GEOGRAPHY</text>
      <circle cx="362" cy="91" r="9" fill={T.curator} opacity="0.28"/>
      <rect x="98"  y="134" width="244" height="38" rx="3" stroke={T.curator} strokeWidth="0.75" fill={T.curator} fillOpacity="0.05" opacity="0.6"/>
      <text x="118" y="158" fontFamily="DM Mono,monospace" fontSize="10" fill={T.curator} opacity="0.33" letterSpacing="3">DISCIPLINE</text>
      <circle cx="322" cy="153" r="9" fill={T.curator} opacity="0.36"/>
      <rect x="152" y="196" width="136" height="38" rx="3" stroke={T.curator} strokeWidth="0.75" fill={T.curator} fillOpacity="0.07" opacity="0.7"/>
      <text x="168" y="220" fontFamily="DM Mono,monospace" fontSize="10" fill={T.curator} opacity="0.38" letterSpacing="3">INTEREST</text>
      <circle cx="268" cy="215" r="9" fill={T.artist} opacity="0.85"/>
      <line x1="58"  y1="91"  x2="152" y2="215" stroke={T.curator} strokeWidth="0.5" opacity="0.1" strokeDasharray="3 7"/>
      <line x1="382" y1="91"  x2="288" y2="215" stroke={T.curator} strokeWidth="0.5" opacity="0.1" strokeDasharray="3 7"/>
      <line x1="220" y1="234" x2="220" y2="270" stroke={T.artist} strokeWidth="0.75" opacity="0.5"/>
      <circle cx="220" cy="278" r="6" fill={T.artist} opacity="0.9"/>
    </svg>,
    // 3 — Archive: editorial grid
    <svg key="f3" width="100%" viewBox="0 0 440 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: 400, opacity: 0.75 }}>
      <rect x="58"  y="58"  width="196" height="128" rx="3" stroke={T.inst} strokeWidth="0.75" fill={T.inst} fillOpacity="0.02" opacity="0.45"/>
      <line x1="58"  y1="148" x2="254" y2="148" stroke={T.inst} strokeWidth="0.5" opacity="0.15"/>
      <text x="76" y="142" fontFamily="DM Mono,monospace" fontSize="9" fill={T.inst} opacity="0.18" letterSpacing="2">IMAGE</text>
      <rect x="270" y="58"  width="112" height="56" rx="3" stroke={T.inst} strokeWidth="0.75" fill={T.inst} fillOpacity="0.02" opacity="0.4"/>
      <text x="287" y="91"  fontFamily="DM Mono,monospace" fontSize="9" fill={T.inst} opacity="0.18" letterSpacing="2">TEXT</text>
      <rect x="270" y="130" width="112" height="56" rx="3" stroke={T.inst} strokeWidth="0.75" fill={T.inst} fillOpacity="0.02" opacity="0.4"/>
      <text x="287" y="163" fontFamily="DM Mono,monospace" fontSize="9" fill={T.inst} opacity="0.18" letterSpacing="2">LINK</text>
      <rect x="58"  y="204" width="96"  height="52" rx="3" stroke={T.inst} strokeWidth="0.75" opacity="0.3"/>
      <rect x="168" y="204" width="96"  height="52" rx="3" stroke={T.inst} strokeWidth="0.75" opacity="0.3"/>
      <rect x="278" y="204" width="104" height="52" rx="3" stroke={T.inst} strokeWidth="0.75" opacity="0.3"/>
      <circle cx="382" cy="58" r="5" fill={T.artist} opacity="0.65"/>
    </svg>,
  ];

  return (
    <div style={{ background: T.bg }}>
      {/* -- Hero -- */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 48px 64px', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle background grid */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.025, pointerEvents: 'none' }}>
          <defs>
            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>

        {/* Single purple accent: left vertical bar */}
        <div style={{ position: 'absolute', left: 0, top: '15%', bottom: '15%', width: 3, background: `linear-gradient(to bottom, transparent, ${T.artist}, transparent)` }} />

        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48, animation: 'fadeUp 0.5s ease both', animationDelay: '60ms' }}>
          <Label size={12} color={T.artist} tracking="0.16em">Discovery Engine · Open Beta</Label>
        </div>

        {/* Headline — editorial, full width */}
        <h1 style={{
          fontFamily: "'Space Grotesk',sans-serif",
          fontWeight: 800,
          fontSize: 'clamp(72px, 9.5vw, 136px)',
          lineHeight: 0.9,
          letterSpacing: '-0.04em',
          color: T.text,
          margin: '0 0 48px',
          maxWidth: 1100,
        }}>
          {[
            { text: 'Where the',   color: T.text   },
            { text: 'creative',    color: T.artist  },
            { text: 'world finds', color: T.text   },
            { text: 'itself.',     color: T.muted   },
          ].map((line, i) => (
            <span key={i} style={{ display: 'block', color: line.color, animation: 'fadeUp 0.55s ease both', animationDelay: `${120 + i * 85}ms` }}>
              {line.text}
            </span>
          ))}
        </h1>

        {/* Descriptor + CTAs — two column */}
        <div style={{ display: 'flex', gap: 64, flexWrap: 'wrap', alignItems: 'flex-start', animation: 'fadeUp 0.5s ease both', animationDelay: '480ms' }}>
          <div style={{ maxWidth: 420 }}>
            <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 17, color: T.sub, lineHeight: 1.7, margin: '0 0 32px' }}>
              A platform for artists, curators, and institutions to discover, connect, and build — across disciplines, borders, and media.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Btn2 onClick={() => navigate('build-profile')}>Join the Collective →</Btn2>
              <Btn2 variant="secondary" onClick={() => navigate('discover')}>Explore Profiles</Btn2>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 0, border: `1px solid ${T.line}`, borderRadius: 4, overflow: 'hidden', alignSelf: 'flex-end' }}>
            {stats.map((s, i) => (
              <div key={s.label} style={{ padding: '20px 28px', borderRight: i < stats.length - 1 ? `1px solid ${T.line}` : 'none' }}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 28, color: T.text, lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: T.muted, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- Feature Sections -- */}
      {features.map((f, i) => (
        <section key={i}
          onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
          style={{
            padding: '72px 48px',
            borderTop: `1px solid ${T.line}`,
            display: 'grid',
            gridTemplateColumns: i % 2 === 0 ? '1fr 1.6fr' : '1.6fr 1fr',
            gap: 80,
            alignItems: 'center',
            background: hov === i ? T.bg2 : T.bg,
            transition: 'background 0.2s',
          }}>
          {i % 2 !== 0 && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{featureVis[i]}</div>}
          <div>
            <SectionMark n={f.n} label={f.label} color={f.color} />
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 'clamp(32px,4vw,48px)', lineHeight: 1.1, color: T.text, margin: '28px 0 16px', letterSpacing: '-0.02em' }}>{f.title}</h2>
            <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, color: T.sub, lineHeight: 1.7, margin: '0 0 28px', maxWidth: 380 }}>{f.body}</p>
            <Btn2 variant="ghost" onClick={() => navigate(f.screen)}>{f.cta} →</Btn2>
          </div>
          {i % 2 === 0 && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{featureVis[i]}</div>}
        </section>
      ))}
    </div>
  );
}

// --- AUTH ------------------------------------------------------------------
export function AuthScreen2({ navigate, nextPath = '/discover' }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [mode, setMode] = React.useState('in');
  const [email, setEmail] = React.useState('');
  const [pass, setPass]   = React.useState('');
  const [name, setName]   = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleGoogle = async () => {
    const supabase = createClient()
    const callbackUrl = new URL('/auth/callback', location.origin)
    callbackUrl.searchParams.set('next', nextPath)
    setLoading(true)
    setError('')
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl.toString() },
    })
    if (authError) {
      setError(authError.message)
      showToast(authError.message, 'error')
      setLoading(false)
    }
  };

  const handleEmail = async () => {
    const supabase = createClient()
    const callbackUrl = new URL('/auth/callback', location.origin)
    callbackUrl.searchParams.set('next', nextPath)
    setLoading(true)
    setError('')

    const { error: authError } = mode === 'in'
      ? await supabase.auth.signInWithPassword({ email, password: pass })
      : await supabase.auth.signUp({
          email,
          password: pass,
          options: { data: { full_name: name }, emailRedirectTo: callbackUrl.toString() },
        })

    if (authError) {
      setError(authError.message)
      showToast(authError.message, 'error')
      setLoading(false)
      return
    }

    setLoading(false)
    showToast(mode === 'in' ? 'Signed in successfully.' : 'Account created successfully.', 'success')
    router.replace(nextPath)
    router.refresh()
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      {/* Left — brand panel */}
      <div style={{ padding: '80px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: `1px solid ${T.line}`, position: 'relative', overflow: 'hidden' }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.025 }}>
          <defs><pattern id="auth-grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#auth-grid)"/>
        </svg>
        <div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: '0.18em', color: T.text, marginBottom: 4 }}>SAYE</div>
          <Label size={12} color={T.artist} tracking="0.18em">COLLECTIVE</Label>
        </div>
        <div>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 'clamp(40px,4vw,64px)', lineHeight: 1.05, letterSpacing: '-0.03em', color: T.text, margin: '0 0 20px' }}>
            Your place<br />in the<br /><span style={{ color: T.artist }}>creative<br />world.</span>
          </h2>
          <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, color: T.muted, lineHeight: 1.65, maxWidth: 320, margin: 0 }}>
            Join 3,000+ artists, curators, and institutions already on the platform.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Artist','Curator','Institution'].map(role => <RoleBadge key={role} role={role} size={12} />)}
        </div>
      </div>

      {/* Right — form */}
      <div style={{ padding: '80px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ maxWidth: 360, width: '100%' }}>
          {/* Toggle */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 40, borderBottom: `1px solid ${T.line}` }}>
            {[['in','Sign In'],['up','Create Account']].map(([m,lbl]) => (
              <button key={m} onClick={() => setMode(m)}
                style={{ padding: '12px 0', marginRight: 32, background: 'none', border: 'none', borderBottom: `2px solid ${mode===m ? T.artist : 'transparent'}`, marginBottom: -1, fontFamily: "'Space Grotesk',sans-serif", fontWeight: mode===m ? 600 : 400, fontSize: 15, color: mode===m ? T.text : T.muted, cursor: 'pointer', transition: 'all 0.15s' }}>
                {lbl}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {mode === 'up' && <Input2 label="Full Name" placeholder="Your name or alias" value={name} onChange={e => setName(e.target.value)} />}
            <Input2 label="Email" placeholder="hello@example.com" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            <Input2 label="Password" placeholder="Min. 8 characters" type="password" value={pass} onChange={e => setPass(e.target.value)} />
            {mode === 'in' && <div style={{ textAlign: 'right', marginTop: -4 }}><span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: T.muted, cursor: 'pointer' }}>Forgot password?</span></div>}
            {error && <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:'#f87171' }}>{error}</div>}
            <div style={{ marginTop: 4 }}><Btn2 full disabled={loading} onClick={handleEmail}>{loading ? 'Working...' : mode==='in' ? 'Sign In →' : 'Create Account →'}</Btn2></div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '28px 0' }}>
            <div style={{ flex: 1, height: 1, background: T.line }} />
            <Label size={12} color={T.muted}>or</Label>
            <div style={{ flex: 1, height: 1, background: T.line }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={handleGoogle}
              style={{ width: '100%', padding: '12px', background: 'transparent', border: `1px solid ${T.line}`, borderRadius: 3, color: T.muted, fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.lineB; e.currentTarget.style.color = T.sub; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.line; e.currentTarget.style.color = T.muted; }}>
              Continue with Google
            </button>
          </div>

          <div style={{ marginTop: 28, fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: T.muted }}>
            {mode==='in' ? 'New here? ' : 'Already a member? '}
            <span onClick={() => setMode(mode==='in'?'up':'in')} style={{ color: T.artist, cursor: 'pointer' }}>
              {mode==='in' ? 'Create account' : 'Sign in'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- BUILD PROFILE ---------------------------------------------------------
export function BuildProfileScreen2({ navigate, defaultValues = null }) {
  const router = useRouter();
  const { showToast } = useToast();
  const isEditMode = Boolean(defaultValues);
  const [step, setStep] = React.useState(1);
  const [role, setRole] = React.useState(defaultValues?.role ?? null);
  const [form, setForm] = React.useState({
    name: defaultValues?.display_name ?? '',
    bio: defaultValues?.bio ?? '',
    location: defaultValues?.geography ?? '',
    website: defaultValues?.website_url ?? '',
  });
  const [disc, setDisc] = React.useState(() => {
    const values = [defaultValues?.discipline, ...(defaultValues?.interests ?? [])].filter(Boolean)
    return Array.from(new Set(values))
  });
  const [customLocationOpen, setCustomLocationOpen] = React.useState(
    () => Boolean(defaultValues?.geography && !GEOGRAPHY_PRESETS.includes(defaultValues.geography))
  );
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  const roles = [
    { role:'Artist',      desc:'You create. Build a portfolio that travels — across galleries, institutions, and collections.' },
    { role:'Curator',     desc:'You shape context. Connect with artists, build exhibition concepts, find institutional partners.' },
    { role:'Institution', desc:'You hold space. List your programs, find artists for residencies, connect with aligned curators.' },
  ];
  const disciplines = role && DISCIPLINE_PRESETS[role] ? DISCIPLINE_PRESETS[role] : ['Painting','Sculpture','Photography','Video','Performance','Installation','Digital Art','Ceramics','Textile','Sound','Drawing','Print','Mixed Media'];
  const profileCopy = profileCopyFor(role);
  const geographyOptions = Array.from(new Set([
    ...GEOGRAPHY_PRESETS,
    ...(form.location && !GEOGRAPHY_PRESETS.includes(form.location) ? [form.location] : []),
  ]));

  const setD = v => setDisc(d => d.includes(v) ? d.filter(x=>x!==v) : [...d,v]);
  const saveDraft = () => {
    if (!isEditMode) localStorage.setItem('saye_profile_draft', JSON.stringify({ role, form, disc }))
  }
  const completeProfile = async () => {
    setError('')
    if (!role || !form.name.trim() || !form.location.trim() || disc.length === 0) {
      const message = 'Choose a role, name, location, and at least one discipline.'
      setError(message)
      showToast(message, 'error')
      return
    }
    setSaving(true)
    const result = await upsertProfile({
      role,
      display_name: form.name,
      bio: form.bio,
      website_url: form.website,
      geography: form.location,
      discipline: disc[0],
      interests: disc.length ? disc : [disc[0]],
    })
    setSaving(false)
    if ('error' in result) {
      setError(result.error)
      showToast(result.error, 'error')
      return
    }
    localStorage.removeItem('saye_profile_draft')
    showToast(isEditMode ? 'Profile updated successfully.' : 'Profile saved successfully.', 'success')
    if (isEditMode && result.profileId) {
      router.replace(`/profile/${result.profileId}`)
      return
    }
    router.push('/discover')
    router.refresh()
  }

  React.useEffect(() => {
    if (isEditMode) return
    const saved = localStorage.getItem('saye_profile_draft')
    if (!saved) return
    try {
      const draft = JSON.parse(saved)
      if (draft.role) setRole(draft.role)
      if (draft.form) setForm(current => ({ ...current, ...draft.form }))
      if (Array.isArray(draft.disc)) setDisc(draft.disc)
    } catch {
      localStorage.removeItem('saye_profile_draft')
    }
  }, [isEditMode])

  return (
    <div style={{ minHeight: '100vh', background: T.bg, padding: '88px 48px 80px' }}>
      {/* Progress bar */}
      <div style={{ maxWidth: 760, margin: '0 auto 56px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 48, borderBottom: `1px solid ${T.line}`, paddingBottom: 24 }}>
          {[['01','Select Role'],['02','Your Details']].map(([n,lbl],i) => (
            <React.Fragment key={n}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: step > i+1 ? T.artist : step === i+1 ? T.artistDim : 'transparent', border: `1px solid ${step >= i+1 ? T.artist : T.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Label size={12} color={step >= i+1 ? (step > i+1 ? T.bg : T.artist) : T.muted}>{n}</Label>
                </div>
                <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, color: step === i+1 ? T.text : T.muted }}>{lbl}</span>
              </div>
              {i < 1 && <div style={{ flex: 1, height: 1, background: step > 1 ? T.artist : T.line, margin: '0 20px' }} />}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && <>
          <Label size={12} color={T.artist} tracking="0.14em">Step 01 / Who are you?</Label>
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:'clamp(40px,5vw,68px)', lineHeight:1.0, color:T.text, margin:'16px 0 40px', letterSpacing:'-0.03em' }}>
            Define your<br /><span style={{ color:T.artist }}>creative role.</span>
          </h1>
          <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:36 }}>
            {roles.map(r => <RoleCard2 key={r.role} {...r} selected={role===r.role} onClick={() => setRole(r.role)} />)}
          </div>
          <Btn2 disabled={!role} onClick={() => { saveDraft(); setStep(2); }}>Continue as {role||'...'} →</Btn2>
        </>}

        {step === 2 && <>
          <Label size={12} color={role ? ROLE_CONFIG[role]?.color : T.artist} tracking="0.14em">Step 02 / {role} Profile</Label>
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:'clamp(36px,4vw,56px)', lineHeight:1.0, color:T.text, margin:'16px 0 40px', letterSpacing:'-0.03em' }}>
            {profileCopy.heading}<br /><span style={{ color:role ? ROLE_CONFIG[role]?.color : T.artist }}>{profileCopy.accent}</span>
          </h1>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            <div style={{ gridColumn:'span 2' }}><Input2 label="Display Name" placeholder="Your name or alias" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
            <div style={{ gridColumn:'span 2' }}><Input2 label="Bio" placeholder={profileCopy.bio} textarea value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} rows={4} /></div>
            <div>
              <Label size={12} color={T.muted} style={{ display:'block', marginBottom:10 }}>Location</Label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, maxHeight:150, overflow:'auto', paddingRight:4 }}>
                {geographyOptions.map(place => (
                  <Chip2
                    key={place}
                    label={place}
                    active={!customLocationOpen && form.location === place}
                    onClick={() => {
                      setCustomLocationOpen(false)
                      setForm({ ...form, location: place })
                    }}
                  />
                ))}
                <Chip2
                  label="Other"
                  active={customLocationOpen}
                  onClick={() => {
                    setCustomLocationOpen(true)
                    if (GEOGRAPHY_PRESETS.includes(form.location)) setForm({ ...form, location: '' })
                  }}
                />
              </div>
              {customLocationOpen && (
                <div style={{ marginTop:12 }}>
                  <Input2 label="Custom location" placeholder={profileCopy.location} value={form.location} onChange={e=>setForm({...form,location:e.target.value})} />
                </div>
              )}
            </div>
            <Input2 label="Website" placeholder="yoursite.com" value={form.website} onChange={e=>setForm({...form,website:e.target.value})} />
            <div style={{ gridColumn:'span 2' }}>
              <Label size={12} color={T.muted} style={{ display:'block', marginBottom:10 }}>Disciplines</Label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {disciplines.map(d => <Chip2 key={d} label={d} active={disc.includes(d)} onClick={() => setD(d)} />)}
              </div>
            </div>
            <div style={{ gridColumn:'span 2', display:'flex', gap:12, marginTop:8 }}>
              <Btn2 variant="outline" onClick={() => setStep(1)}>← Back</Btn2>
              <Btn2 disabled={saving} onClick={completeProfile}>{saving ? 'Saving...' : isEditMode ? 'Save Profile →' : `${profileCopy.submit} →`}</Btn2>
            </div>
            {error && <div style={{ gridColumn:'span 2', fontFamily:"'DM Mono',monospace", fontSize:11, color:'#f87171' }}>{error}</div>}
          </div>
        </>}
      </div>
    </div>
  );
}

// --- DISCOVER -------------------------------------------------------------
function DiscoverFilterSearch({ label, chips, active, filterKey, onToggle }) {
  const [query, setQuery] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef(null)
  const inputRef = React.useRef(null)

  const normalized = query.trim().toLowerCase()
  const popular = chips.slice(0, 4)
  const suggestions = normalized
    ? chips.filter(c => String(c).toLowerCase().includes(normalized))
    : chips.slice(0, 6)

  React.useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = (chip) => {
    onToggle(active, filterKey, chip)
    setQuery('')
    setOpen(false)
  }

  const highlight = (text, q) => {
    if (!q) return text
    const idx = text.toLowerCase().indexOf(q)
    if (idx === -1) return text
    return <>{text.slice(0, idx)}<strong style={{ color: T.text }}>{text.slice(idx, idx + q.length)}</strong>{text.slice(idx + q.length)}</>
  }

  return (
    <div ref={containerRef} style={{ flex: '1 1 200px', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Label size={12} color={T.muted}>{label}</Label>
        {active.length > 0 && <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:T.artist }}>{active.length} active</span>}
      </div>

      {active.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:8 }}>
          {active.map(a => (
            <button key={a} type="button" onClick={() => onToggle(active, filterKey, a)}
              style={{ display:'inline-flex', alignItems:'center', gap:5, fontFamily:"'DM Mono',monospace", fontSize:11, color:T.artist, background:T.artistDim, border:'1px solid rgba(155,127,248,0.25)', borderRadius:2, padding:'2px 8px', cursor:'pointer' }}>
              {a} <span style={{ opacity:0.7 }}>×</span>
            </button>
          ))}
        </div>
      )}

      <div style={{ position:'relative' }}>
        <svg style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:T.faint }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          ref={inputRef}
          placeholder={`Search ${label.toLowerCase()}…`}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          style={{ width:'100%', boxSizing:'border-box', background:T.bg2, border:`1px solid ${open ? 'rgba(155,127,248,0.35)' : T.line}`, borderRadius: open ? '3px 3px 0 0' : 3, padding:'8px 12px 8px 30px', color:T.text, fontFamily:"'Space Grotesk',sans-serif", fontSize:13, outline:'none', transition:'border-color 0.15s' }}
        />
        {open && (
          <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'#0d0d0d', border:`1px solid rgba(155,127,248,0.35)`, borderTop:'none', borderRadius:'0 0 3px 3px', zIndex:50, maxHeight:220, overflowY:'auto', boxShadow:'0 12px 32px rgba(0,0,0,0.6)' }}>
            {suggestions.length === 0
              ? <div style={{ padding:'12px 14px', fontFamily:"'Space Grotesk',sans-serif", fontSize:13, color:T.muted }}>No matches</div>
              : suggestions.map(s => (
                <div key={s} onMouseDown={() => select(s)}
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 14px', cursor:'pointer', background: active.includes(s) ? T.artistDim : 'transparent', transition:'background 0.1s' }}
                  onMouseEnter={e => { if (!active.includes(s)) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                  onMouseLeave={e => { if (!active.includes(s)) e.currentTarget.style.background = active.includes(s) ? T.artistDim : 'transparent' }}
                >
                  <span style={{ color:T.faint, fontSize:13, flexShrink:0, fontFamily:'monospace' }}>⌕</span>
                  <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:13, color: active.includes(s) ? T.artist : T.sub }}>
                    {highlight(s, normalized)}
                  </span>
                  {active.includes(s) && <span style={{ marginLeft:'auto', fontFamily:"'DM Mono',monospace", fontSize:10, color:T.artist }}>✓</span>}
                </div>
              ))
            }
          </div>
        )}
      </div>

      {!open && (
        <div style={{ display:'flex', alignItems:'center', gap:7, marginTop:10, flexWrap:'wrap' }}>
          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:T.faint, flexShrink:0 }}>Popular:</span>
          {popular.filter(p => !active.includes(p)).map(p => (
            <button key={p} type="button" onClick={() => onToggle(active, filterKey, p)}
              style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:12, color:T.muted, background:'transparent', border:`1px solid ${T.line}`, borderRadius:20, padding:'3px 10px', cursor:'pointer', transition:'all 0.13s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.lineB; e.currentTarget.style.color = T.sub }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.line; e.currentTarget.style.color = T.muted }}
            >{p}</button>
          ))}
        </div>
      )}
    </div>
  )
}

const DISCOVER_MOTIFS = {
  Photography:  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="28" stroke="currentColor" strokeWidth="0.7"/><circle cx="40" cy="40" r="16" stroke="currentColor" strokeWidth="0.7"/><circle cx="40" cy="40" r="5" fill="currentColor"/><line x1="12" y1="40" x2="68" y2="40" stroke="currentColor" strokeWidth="0.4" opacity="0.4"/><line x1="40" y1="12" x2="40" y2="68" stroke="currentColor" strokeWidth="0.4" opacity="0.4"/></svg>,
  Contemporary: <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="12" y="12" width="56" height="56" stroke="currentColor" strokeWidth="0.7"/><rect x="24" y="24" width="32" height="32" stroke="currentColor" strokeWidth="0.7"/><rect x="34" y="34" width="12" height="12" fill="currentColor" opacity="0.5"/></svg>,
  Installation: <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="68" x2="40" y2="12" stroke="currentColor" strokeWidth="0.7"/><line x1="40" y1="12" x2="68" y2="68" stroke="currentColor" strokeWidth="0.7"/><line x1="12" y1="68" x2="68" y2="68" stroke="currentColor" strokeWidth="0.7"/><circle cx="40" cy="12" r="3" fill="currentColor"/></svg>,
  Performance:  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="40" cy="40" rx="28" ry="18" stroke="currentColor" strokeWidth="0.7"/><ellipse cx="40" cy="40" rx="14" ry="28" stroke="currentColor" strokeWidth="0.7"/><circle cx="40" cy="40" r="3" fill="currentColor"/></svg>,
  Textile:      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">{[0,1,2,3,4].map(i=><line key={'v'+i} x1={14+i*13} y1="14" x2={14+i*13} y2="66" stroke="currentColor" strokeWidth="0.6" opacity="0.7"/>)}{[0,1,2,3,4].map(i=><line key={'h'+i} x1="14" y1={14+i*13} x2="66" y2={14+i*13} stroke="currentColor" strokeWidth="0.6" opacity="0.7"/>)}</svg>,
  Drawing:      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 58 Q28 12 40 40 Q52 68 68 24" stroke="currentColor" strokeWidth="1" fill="none"/><circle cx="40" cy="40" r="2.5" fill="currentColor"/></svg>,
  Ceramics:     <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M28 16 Q20 40 24 60 Q28 68 40 68 Q52 68 56 60 Q60 40 52 16 Z" stroke="currentColor" strokeWidth="0.7" fill="none"/><line x1="28" y1="16" x2="52" y2="16" stroke="currentColor" strokeWidth="0.7"/></svg>,
  Sound:        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">{[0,1,2,3,4,5,6].map(i=><line key={i} x1={10+i*10} y1={40-Math.sin(i*0.9)*22} x2={10+i*10} y2={40+Math.sin(i*0.9)*22} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>)}</svg>,
  default:      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="40,12 68,62 12,62" stroke="currentColor" strokeWidth="0.7" fill="none"/><circle cx="40" cy="46" r="8" stroke="currentColor" strokeWidth="0.5" fill="none"/></svg>,
};
const getDiscoverMotif = d => DISCOVER_MOTIFS[d] || DISCOVER_MOTIFS.default;

function InFocusPanelItem({ entry, idx, onNavigate }) {
  const [h, setH] = React.useState(false);
  if (!entry) return null;
  const r = ROLE_CONFIG[entry.role] || ROLE_CONFIG.Artist;
  const bkg = { Artist: '#110820', Curator: '#0c1410', Institution: '#0a0a18' }[entry.role] || '#110820';
  const disc = entry.discipline || '';
  const loc  = entry.geography  || '';
  const line = entry.featuredWorkTitle || '';
  const name = entry.display_name || '';
  const role = entry.role || 'Artist';
  const navigable = Boolean(entry.id);

  const imageLayer = entry.featuredImageUrl ? (
    <>
      <div
        role="img"
        aria-label={name}
        style={{ position:'absolute', inset:0, backgroundImage:`url(${entry.featuredImageUrl})`, backgroundSize:'cover', backgroundPosition:'center', opacity:h?0.55:0.38, transition:'opacity 0.3s' }}
      />
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(8,8,8,0.12) 0%, rgba(8,8,8,0.48) 40%, rgba(8,8,8,0.92) 100%)' }} />
    </>
  ) : (
    <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:200, height:200, color:r.color, opacity:h?0.14:0.06, transition:'opacity 0.3s', pointerEvents:'none' }}>
      {getDiscoverMotif(disc)}
    </div>
  );

  const base = { background:bkg, cursor:navigable?'pointer':'default', position:'relative', overflow:'hidden', transition:'all 0.22s' };

  if (idx === 0) return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      onClick={()=>navigable&&onNavigate(`/profile/${entry.id}`)}
      style={{ ...base, display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:'36px 32px' }}>
      {imageLayer}
      <div style={{ position:'absolute', top:24, left:32, zIndex:2 }}><RoleBadge role={role} size={12} /></div>
      <div style={{ position:'relative', zIndex:2 }}>
        {line && <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontStyle:'italic', fontSize:16, color:T.sub, lineHeight:1.5, margin:'0 0 24px', whiteSpace:'pre-line' }}>{line}</p>}
        <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:'clamp(32px,3vw,46px)', lineHeight:1.0, letterSpacing:'-0.03em', color:T.text, margin:'0 0 8px' }}>{name}</h2>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:h?r.color:T.muted, transition:'color 0.2s' }}>{disc}{loc?` · ${loc}`:''}</span>
      </div>
    </div>
  );

  if (idx === 1) return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      onClick={()=>navigable&&onNavigate(`/profile/${entry.id}`)}
      style={{ ...base, display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'28px 28px' }}>
      {imageLayer}
      <div style={{ position:'relative', zIndex:2 }}><RoleBadge role={role} size={12} /></div>
      <div style={{ position:'relative', zIndex:2 }}>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:80, lineHeight:0.75, color:r.color, opacity:0.15, marginBottom:12, userSelect:'none' }}>&quot;</div>
        {line && <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:18, lineHeight:1.4, color:T.text, margin:'0 0 20px', whiteSpace:'pre-line' }}>{line}</p>}
        <h3 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:22, color:T.sub, margin:'0 0 4px', letterSpacing:'-0.01em' }}>{name}</h3>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:h?r.color:T.muted, transition:'color 0.2s' }}>{disc}{loc?` · ${loc}`:''}</span>
      </div>
    </div>
  );

  return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      onClick={()=>navigable&&onNavigate(`/profile/${entry.id}`)}
      style={{ ...base, display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'28px 22px' }}>
      {imageLayer}
      {!entry.featuredImageUrl && (
        <div style={{ position:'absolute', bottom:-16, right:-16, width:120, height:120, color:r.color, opacity:h?0.14:0.05, transition:'opacity 0.3s', pointerEvents:'none', zIndex:1 }}>
          {getDiscoverMotif(disc)}
        </div>
      )}
      <div style={{ position:'relative', zIndex:2 }}><RoleBadge role={role} size={12} /></div>
      <div style={{ position:'relative', zIndex:2 }}>
        <h3 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:'clamp(18px,1.8vw,26px)', lineHeight:1.1, letterSpacing:'-0.02em', color:T.text, margin:'0 0 12px', wordBreak:'break-word' }}>{name}</h3>
        {line && <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontStyle:'italic', fontSize:13, lineHeight:1.55, color:T.muted, margin:'0 0 20px', whiteSpace:'pre-line' }}>{line}</p>}
      </div>
      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:h?r.color:T.muted, transition:'color 0.2s', position:'relative', zIndex:2 }}>{loc}</span>
    </div>
  );
}

export function DiscoverScreen2({ navigate, profiles = [], filterOptions = null, filters = null, totalProfiles = 0, inFocusData = null }) {
  const router = useRouter();
  const [geo,  setGeo]  = React.useState(filters?.geography ?? []);
  const [disc, setDisc] = React.useState(filters?.discipline ?? []);
  const [int_, setInt]  = React.useState(filters?.interests  ?? []);
  const [search,    setSearch]    = React.useState(filters?.q ?? '');
  const [searchFoc, setSearchFoc] = React.useState(false);
  const [roleFilter, setRoleFilter] = React.useState('All');
  const [hovRow,  setHovRow]  = React.useState(null);
  const [pressedRow, setPressedRow] = React.useState(null);
  const [dirPage, setDirPage] = React.useState(1);
  const [leavingPath, setLeavingPath] = React.useState('');
  const searchInputRef = React.useRef(null);
  const DIR_PAGE_SIZE = 12;

  const discs       = ['Painting','Sculpture','Photography','Video','Performance','Installation','Digital Art','Sound','Ceramics','Drawing'];
  const ints        = ['Collaboration','Residency','Exhibition','Commission','Research','Publication','Mentorship','Collection'];
  const filterGeos  = filterOptions?.geographies?.length ? filterOptions.geographies : GEOGRAPHY_PRESETS;
  const filterDiscs = filterOptions?.disciplines?.length ? filterOptions.disciplines : discs;
  const filterInts  = filterOptions?.interests?.length   ? filterOptions.interests   : ints;

  React.useEffect(() => {
    setGeo(filters?.geography ?? [])
    setDisc(filters?.discipline ?? [])
    setInt(filters?.interests ?? [])
    setSearch(filters?.q ?? '')
  }, [filters?.geography, filters?.discipline, filters?.interests, filters?.q])

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      if ((filters?.q ?? '') === search.trim()) return
      window.history.replaceState(null, '', buildDiscoverUrl({
        geography: geo, discipline: disc, interests: int_,
        q: search.trim(), sort: filters?.sort ?? 'newest', page: 1,
      }))
    }, 350)
    return () => window.clearTimeout(timeout)
  }, [disc, filters?.q, filters?.sort, geo, int_, search])

  React.useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const updateFilters = (next) => {
    const merged = {
      geography: geo, discipline: disc, interests: int_,
      q: search.trim(), sort: filters?.sort ?? 'newest', page: 1, ...next,
    }
    setGeo(merged.geography)
    setDisc(merged.discipline)
    setInt(merged.interests)
    router.replace(buildDiscoverUrl(merged), { scroll: false })
  }

  const tog = (arr, key, v) => {
    const next = arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]
    updateFilters({ [key]: next })
  }

  const PINNED_IDS = ['3ba0792b-f910-4e67-84a6-9500146c89d4', 'b4e16628-2539-4a44-a3d9-f700b5736709'];
  const rawPeople = profiles.map(profile => ({
    id:         profile.id,
    name:       profile.display_name,
    role:       profile.role,
    discipline: profile.discipline || 'Unspecified',
    location:   profile.geography  || 'Global',
    bio:        profile.bio        || null,
    tags:       profile.interests?.length ? profile.interests : [],
    avatar_url: profile.avatar_url || null,
  }));

  const hasActiveFilter = search.trim() || geo.length > 0 || disc.length > 0 || int_.length > 0;
  const orderedPeople = !hasActiveFilter ? [
    ...PINNED_IDS.map(id => rawPeople.find(p => p.id === id)).filter(Boolean),
    ...rawPeople.filter(p => !PINNED_IDS.includes(p.id)),
  ] : rawPeople;

  const q = search.trim().toLowerCase();
  const filtered = orderedPeople.filter(p => {
    if (roleFilter !== 'All' && p.role !== roleFilter) return false;
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.discipline.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.tags.some(t => String(t).toLowerCase().includes(q))
    );
  });

  React.useEffect(() => { setDirPage(1) }, [roleFilter, q, geo, disc, int_]);

  const totalDirPages = Math.ceil(filtered.length / DIR_PAGE_SIZE);
  const pagedFiltered = filtered.slice((dirPage - 1) * DIR_PAGE_SIZE, dirPage * DIR_PAGE_SIZE);
  const totalActive   = geo.length + disc.length + int_.length;
  const onNavigate = React.useCallback((path) => {
    if (!path || leavingPath) return
    setLeavingPath(path)
    window.setTimeout(() => {
      router.push(path)
    }, 180)
  }, [leavingPath, router]);

  const inFocusList = inFocusData
    ? [inFocusData.artist, inFocusData.curator, inFocusData.institution].filter(Boolean)
    : [];

  return (
    <div style={{ minHeight:'100vh', background:T.bg, opacity:leavingPath?0:1, transform:leavingPath?'translateY(8px)':'none', transition:'opacity 0.18s ease, transform 0.18s ease', pointerEvents:leavingPath?'none':'auto' }}>

      {/* ── Page header ── */}
      <div style={{ padding:'88px 48px 0', position:'relative' }}>
        <div style={{ position:'absolute', left:0, top:'20%', bottom:'20%', width:3, background:`linear-gradient(to bottom, transparent, ${T.artist}, transparent)` }} />
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:20, flexWrap:'wrap' }}>
          <div>
            <Label size={12} color={T.artist} tracking="0.14em">Discover</Label>
            <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:'clamp(48px,6vw,84px)', color:T.text, margin:'12px 0 0', letterSpacing:'-0.04em', lineHeight:0.92 }}>
              Find your<br /><span style={{ color:T.artist }}>constellation.</span>
            </h1>
          </div>
          <div style={{ textAlign:'right', paddingBottom:4 }}>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:64, color:T.surf2, lineHeight:1, letterSpacing:'-0.04em', userSelect:'none' }}>2.4K</div>
            <Label size={12} color={T.faint}>Members worldwide</Label>
          </div>
        </div>
      </div>

      {/* ── In Focus — three editorial panels ── */}
      {inFocusList.length > 0 && (
        <div style={{ padding:'48px 48px 0' }}>
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
            <Label size={11} color={T.muted} tracking="0.14em">In Focus</Label>
            <div style={{ flex:1, height:1, background:T.line }} />
            <Label size={11} color={T.faint}>Selected members</Label>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1.8fr 1.2fr 0.9fr', gap:2, height:420 }}>
            {inFocusList.map((entry, i) => (
              <InFocusPanelItem key={entry.id} entry={entry} idx={i} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      )}

      {/* ── Filters (deployed design) ── */}
      <div style={{ padding:'36px 48px 0' }}>
        <div style={{ position:'relative', maxWidth:560, marginBottom:24 }}>
          <input ref={searchInputRef} placeholder="Search by name, discipline, keyword…"
            value={search} onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFoc(true)} onBlur={() => setSearchFoc(false)}
            style={{ width:'100%', background:T.surf, border:`1px solid ${searchFoc?'rgba(155,127,248,0.4)':T.line}`, borderRadius:3, padding:'13px 48px 13px 18px', color:T.text, fontFamily:"'Space Grotesk',sans-serif", fontSize:15, outline:'none', boxSizing:'border-box', transition:'border-color 0.15s', boxShadow:searchFoc?'0 0 0 3px rgba(155,127,248,0.05)':'none' }} />
          <span style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', fontFamily:"'DM Mono',monospace", fontSize:12, color:T.muted }}>⌘K</span>
        </div>
        <div style={{ marginBottom:12, padding:'24px 28px', background:T.surf, border:`1px solid ${T.line}`, borderRadius:4, display:'flex', gap:40, flexWrap:'wrap' }}>
          <DiscoverFilterSearch label="Geography" chips={filterGeos} active={geo} filterKey="geography" onToggle={tog} />
          <div style={{ width:1, background:T.line, flexShrink:0 }} />
          <DiscoverFilterSearch label="Discipline" chips={filterDiscs} active={disc} filterKey="discipline" onToggle={tog} />
          <div style={{ width:1, background:T.line, flexShrink:0 }} />
          <DiscoverFilterSearch label="Interest" chips={filterInts} active={int_} filterKey="interests" onToggle={tog} />
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16, minHeight:32, flexWrap:'wrap' }}>
          {totalActive > 0 && <>
            <Label size={12} color={T.faint}>Active:</Label>
            {[...geo, ...disc, ...int_].map(f => (
              <span key={f} style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:13, color:T.artist, background:T.artistDim, border:`1px solid rgba(155,127,248,0.2)`, padding:'3px 12px', borderRadius:2 }}>{f}</span>
            ))}
            <button onClick={() => { setGeo([]); setDisc([]); setInt([]); router.replace('/discover', { scroll: false }); }}
              style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif", fontSize:13, color:T.muted }}>
              Clear all ×
            </button>
          </>}
        </div>
        <div style={{ display:'flex', gap:0, borderBottom:`1px solid ${T.line}` }}>
          {['All','Artist','Curator','Institution'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              style={{ padding:'10px 20px', background:'none', border:'none', borderBottom:`2px solid ${roleFilter===r?(r==='Artist'?T.artist:r==='Curator'?T.curator:r==='Institution'?T.inst:T.text):'transparent'}`, marginBottom:-1, fontFamily:"'Space Grotesk',sans-serif", fontSize:14, color:roleFilter===r?T.text:T.muted, cursor:'pointer', transition:'all 0.15s' }}>
              {r}
            </button>
          ))}
          <Label size={12} color={T.muted} style={{ marginLeft:'auto', alignSelf:'center', paddingRight:4 }}>{filtered.length} results</Label>
        </div>
      </div>

      {/* ── Directory — typographic list ── */}
      <div style={{ padding:'56px 48px 100px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:0 }}>
          <Label size={11} color={T.muted} tracking="0.14em">Directory</Label>
          <div style={{ flex:1, height:1, background:T.line }} />
          <Label size={11} color={T.faint}>{filtered.length} members</Label>
        </div>

        {/* Column headers */}
        <div style={{ display:'grid', gridTemplateColumns:'48px 44px 1fr 160px 150px 120px', gap:0, padding:'16px 0', borderBottom:`1px solid ${T.line}`, marginTop:0 }}>
          {['#', '', 'Name', 'Discipline', 'Location', 'Role'].map(h => (
            <Label key={h} size={11} color={T.faint}>{h}</Label>
          ))}
        </div>

        {filtered.length > 0 ? (
          pagedFiltered.map((p, i) => {
            const r = ROLE_CONFIG[p.role] || ROLE_CONFIG.Artist;
            const absIdx = (dirPage - 1) * DIR_PAGE_SIZE + i;
            const isHov  = hovRow === absIdx;
            const isPressed = pressedRow === absIdx;
            const navigable = Boolean(p.id);
            return (
              <div key={p.id || p.name}
                onMouseEnter={() => setHovRow(absIdx)}
                onMouseLeave={() => { setHovRow(null); setPressedRow(null); }}
                onMouseDown={() => navigable && setPressedRow(absIdx)}
                onMouseUp={() => setPressedRow(null)}
                onClick={() => navigable && onNavigate(`/profile/${p.id}`)}
                style={{
                  display:'grid', gridTemplateColumns:'48px 44px 1fr 160px 150px 120px',
                  gap:0, borderBottom:`1px solid ${T.line}`,
                  cursor:navigable?'pointer':'default',
                  transition:'background 0.15s, filter 0.12s',
                  background:isHov?T.surf:'transparent',
                  filter:isPressed?'brightness(1.12)':'none',
                  margin:'0 -48px', padding:'22px 48px',
                  position:'relative',
                }}>
                {/* Catalog number */}
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:13, color:isHov?r.color:T.faint, transition:'color 0.15s', alignSelf:'center' }}>
                  {String(absIdx + 1).padStart(2, '0')}
                </span>
                {/* Avatar */}
                <div style={{ alignSelf:'center', width:34, height:34, borderRadius:'50%', background:r.dim, border:`1px solid ${r.border}`, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
                  {p.avatar_url
                    ? <div role="img" aria-label={p.name} style={{ width:'100%', height:'100%', backgroundImage:`url(${p.avatar_url})`, backgroundSize:'cover', backgroundPosition:'center' }} />
                    : <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, color:r.color }}>{p.name.charAt(0).toUpperCase()}</span>
                  }
                </div>
                {/* Name + bio on hover */}
                <div style={{ alignSelf:'center' }}>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:25, color:isHov?T.text:'#bbb', lineHeight:1.02, letterSpacing:'-0.01em', transition:'color 0.15s, transform 0.15s', transform:isHov?'translateX(6px)':'none', display:'inline-block' }}>
                    {p.name}
                  </div>
                  {isHov && p.bio && <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontStyle:'italic', fontSize:14, color:T.muted, marginTop:5, lineHeight:1.45 }}>{p.bio}</div>}
                </div>
                {/* Discipline */}
                <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:15, color:isHov?T.sub:T.muted, alignSelf:'center', transition:'color 0.15s' }}>{p.discipline}</span>
                {/* Location */}
                <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:15, color:isHov?T.sub:T.muted, alignSelf:'center', transition:'color 0.15s' }}>{p.location}</span>
                {/* Role badge */}
                <div style={{ alignSelf:'center' }}><RoleBadge role={p.role} size={12} /></div>
                {/* Discipline motif on hover */}
                {isHov && (
                  <div style={{ position:'absolute', right:48, top:'50%', transform:'translateY(-50%)', width:64, height:64, color:r.color, opacity:0.18, pointerEvents:'none' }}>
                    {getDiscoverMotif(p.discipline)}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div style={{ padding:'80px 0', textAlign:'center', borderTop:`1px solid ${T.line}` }}>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:32, color:T.faint, marginBottom:20 }}>∅</div>
            <Label size={13} color={T.muted}>No results</Label>
            <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:15, color:T.muted, marginTop:10, lineHeight:1.6 }}>
              Try different filters or clear your search.
            </p>
            {(totalActive > 0 || q) && (
              <button onClick={() => { setGeo([]); setDisc([]); setInt([]); setSearch(''); setRoleFilter('All'); router.replace('/discover', { scroll: false }); }}
                style={{ marginTop:20, background:'none', border:`1px solid ${T.line}`, borderRadius:3, cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif", fontSize:13, color:T.muted, padding:'8px 20px', transition:'all 0.15s' }}>
                Clear everything
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalDirPages > 1 && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:4, marginTop:32 }}>
            <button onClick={() => setDirPage(p => Math.max(1, p - 1))} disabled={dirPage === 1}
              style={{ padding:'7px 14px', background:'none', border:`1px solid ${T.line}`, borderRadius:3, cursor:dirPage===1?'default':'pointer', fontFamily:"'DM Mono',monospace", fontSize:12, color:dirPage===1?T.faint:T.muted, transition:'all 0.15s' }}>
              ←
            </button>
            {Array.from({ length: totalDirPages }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setDirPage(n)}
                style={{ padding:'7px 12px', borderRadius:3, border:`1px solid ${n===dirPage?T.artist:T.line}`, background:n===dirPage?T.artist:'none', fontFamily:"'DM Mono',monospace", fontSize:12, color:n===dirPage?T.bg:T.muted, cursor:'pointer', transition:'all 0.15s', fontWeight:n===dirPage?700:400 }}>
                {n}
              </button>
            ))}
            <button onClick={() => setDirPage(p => Math.min(totalDirPages, p + 1))} disabled={dirPage === totalDirPages}
              style={{ padding:'7px 14px', background:'none', border:`1px solid ${T.line}`, borderRadius:3, cursor:dirPage===totalDirPages?'default':'pointer', fontFamily:"'DM Mono',monospace", fontSize:12, color:dirPage===totalDirPages?T.faint:T.muted, transition:'all 0.15s' }}>
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- ARCHIVE ---------------------------------------------------------------
export function ArchiveScreen2({ navigate, items = [], userProfileId = null, profile = null, state = 'ready' }) {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const [composerDraft, setComposerDraft] = React.useState(null);
  const [composerEditTarget, setComposerEditTarget] = React.useState(null);
  const [localItems, setLocalItems] = React.useState(items);
  const [overlayFullscreen, setOverlayFullscreen] = React.useState(false);

  React.useEffect(() => {
    setLocalItems(items)
  }, [items])

  const refreshLocalArchiveItems = React.useCallback(async () => {
    if (!userProfileId) return
    const supabase = createClient()
    const { data } = await supabase
      .from('archive_items')
      .select('id, profile_id, type, content, created_at')
      .eq('profile_id', userProfileId)
      .order('created_at', { ascending: false })
    if (data) setLocalItems(data)
  }, [userProfileId])

  const ownerName = profile?.display_name || 'Your profile';
  const ownerRole = profile?.role || 'Artist';
  const isSignedOut = state === 'signedOut';
  const isMissingProfile = state === 'missingProfile';
  const archiveItems = localItems.map(item => {
    const entry = resolveArchiveEntry(item)
    const coverUrl = entry.thumbnailUrl || entry.imageUrl
    return {
      id: item.id,
      type: entry.primaryType,
      title: entry.title,
      content: coverUrl || entry.body || entry.referenceUrl || '',
      body: entry.body,
      imageUrl: coverUrl,
      referenceUrl: entry.referenceUrl,
      author: ownerName,
      authorRole: ownerRole,
      date: formatArchiveDate(item.created_at),
      link: entry.referenceUrl ? domainFromUrl(entry.referenceUrl) : undefined,
      hint: coverUrl ? 'image' : undefined,
    }
  });

  const archiveRows = archiveRowsFor(archiveItems);
  const ctaLabel = isSignedOut ? 'Join to Build Archive' : isMissingProfile ? 'Complete Profile' : '+ Add to Archive';
  const isOwner = !isSignedOut && !isMissingProfile
  const onPrimaryAction = () => {
    if (isSignedOut) {
      router.push('/login?next=/build-profile')
      return
    }
    if (isMissingProfile) {
      router.push('/build-profile')
      return
    }
    router.push(userProfileId ? `/profile/${userProfileId}?compose=1` : '/build-profile')
  };

  const editInArchiveComposer = (item) => {
    setSelectedItem(null)
    setComposerEditTarget({ id: item.id, type: item.type })
    setComposerDraft(archiveDraftFromItem(item))
    setAddOpen(true)
  }

  const openRelatedArchiveItem = (item, options = { fullscreen: false }) => {
    setSelectedItem(null)
    if (userProfileId && item.profile_id === userProfileId) {
      setOverlayFullscreen(options.fullscreen)
      window.setTimeout(() => setSelectedItem(item), 140)
      return
    }
    router.push(`/profile/${item.profile_id}?work=${item.id}${options.fullscreen ? '&view=full' : ''}`)
  }

  return (
    <div style={{ minHeight:'100vh', background:T.bg, padding:'88px 48px 80px' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:40, gap:20, flexWrap:'wrap' }}>
        <div>
          <Label size={12} color={T.artist} tracking="0.14em">{profile ? `${ownerName}'s Archive` : 'Your Archive'}</Label>
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:'clamp(40px,5.5vw,72px)', color:T.text, margin:'12px 0 0', letterSpacing:'-0.03em', lineHeight:1.0 }}>
            A living<br /><span style={{ color:T.artist }}>exhibition wall.</span>
          </h1>
        </div>
        <Btn2 variant="ghost" onClick={onPrimaryAction}>{ctaLabel}</Btn2>
      </div>

      {/* Prime-style archive rails */}
      {archiveItems.length > 0 ? (
        <div>
          {archiveRows.map(row => (
            <ArchivePrimeRail
              key={row.id}
              title={row.title}
              items={row.items}
              onExpand={card => {
                const raw = localItems.find(item => item.id === card.id)
                if (raw) setSelectedItem(raw)
              }}
            />
          ))}
        </div>
      ) : (
        <div style={{ padding:'80px 0', textAlign:'center', borderTop:`1px solid ${T.line}` }}>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:32, color:T.faint, marginBottom:20 }}>∅</div>
          <Label size={13} color={T.muted}>
            {isSignedOut ? 'Sign in to build your archive' : isMissingProfile ? 'Create a profile first' : 'No archive entries yet'}
          </Label>
          <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:15, color:T.muted, marginTop:10, lineHeight:1.6 }}>
            {isSignedOut
              ? 'Archives are attached to individual profiles, not a global feed.'
              : isMissingProfile
                ? 'Your archive unlocks once your role and profile are live.'
                : 'Add text, images, or links from your profile page.'}
          </p>
          <button onClick={onPrimaryAction}
            style={{ marginTop:20, background:'none', border:`1px solid ${T.line}`, borderRadius:3, cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif", fontSize:13, color:T.muted, padding:'8px 20px', transition:'all 0.15s' }}>
            {ctaLabel}
          </button>
        </div>
      )}
      <AnimatePresence>
        {selectedItem && (
          <PostDetailOverlay
            key={selectedItem.id}
            item={selectedItem}
            items={localItems}
            onClose={() => setSelectedItem(null)}
            isOwner={isOwner}
            onEditInComposer={isOwner ? editInArchiveComposer : undefined}
            onOpenRelated={openRelatedArchiveItem}
            initialFullscreen={overlayFullscreen}
            profile={profile}
          />
        )}
      </AnimatePresence>

      {isOwner && userProfileId && (
        <ArchiveComposerOverlay
          open={addOpen}
          profileId={userProfileId}
          initialDraft={composerDraft ?? undefined}
          editTarget={composerEditTarget}
          onClose={() => {
            setAddOpen(false)
            setComposerEditTarget(null)
            setComposerDraft(null)
          }}
          onSaved={async () => {
            setComposerEditTarget(null)
            setComposerDraft(null)
            await refreshLocalArchiveItems()
            router.refresh()
          }}
        />
      )}
    </div>
  );
}

// --- PROFILE ---------------------------------------------------------------
export function ProfileScreen2({ navigate, profile = null, archiveItems = [], isOwner = false, viewerIsAuthenticated = false, isConnected = false, connectedProfiles = [], suggestedProfiles = [] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [tab, setTab] = React.useState('work');
  const [addOpen, setAddOpen] = React.useState(false);
  const [archiveError, setArchiveError] = React.useState('');
  const [selectedArchiveItem, setSelectedArchiveItem] = React.useState(null);
  const [composerDraft, setComposerDraft] = React.useState(null);
  const [composerEditTarget, setComposerEditTarget] = React.useState(null);
  const [localArchiveItems, setLocalArchiveItems] = React.useState(archiveItems);
  const [connected, setConnected] = React.useState(isConnected);
  const [connectionSaving, setConnectionSaving] = React.useState(false);
  const [overlayFullscreen, setOverlayFullscreen] = React.useState(false);
  const bannerRef = React.useRef(null);
  const bannerDragRef = React.useRef(null);
  const bannerPanelPreviewRef = React.useRef(null);
  const bannerPanelDragRef = React.useRef(null);


  React.useEffect(() => {
    setLocalArchiveItems(archiveItems)
  }, [archiveItems])

  React.useEffect(() => {
    const workId = searchParams.get('work')
    if (!workId) return

    const item = localArchiveItems.find(entry => entry.id === workId)
    if (!item) return

    const timer = window.setTimeout(() => {
      setTab('work')
      setArchiveError('')
      setOverlayFullscreen(searchParams.get('view') === 'full')
      setSelectedArchiveItem(item)
      window.history.replaceState(null, '', pathname)
    }, 260)

    return () => window.clearTimeout(timer)
  }, [localArchiveItems, pathname, searchParams])

  const work = [
    { type:'image', title:'Untitled (After the Rain)', authorRole:'Artist', date:'Apr 2026', hint:'photograph', author:'Amara Osei' },
    { type:'text',  title:'Notes on presence and distance', content:'The camera creates distance. This is not a failure. This is the condition.', author:'Amara Osei', authorRole:'Artist', date:'Mar 2026' },
    { type:'image', title:'Borrowed Light Series I–III', authorRole:'Artist', date:'Feb 2026', hint:'triptych', author:'Amara Osei' },
    { type:'link',  title:'Artist Statement — 2026', author:'Amara Osei', authorRole:'Artist', date:'Jan 2026', link:'amaraosei.com' },
  ];
  const currentProfile = profile ?? {
    id: 'demo',
    role: 'Artist',
    display_name: 'Amara Osei',
    bio: 'Amara Osei is a Lagos-based photographer working at the intersection of documentary practice and conceptual art. Her work explores the gap between presence and record — what photographs preserve, and what they inevitably destroy.',
    geography: 'Lagos, Nigeria',
    discipline: 'Photography',
    interests: ['conceptual','documentary','large-format','silver-gelatin','africa','diaspora'],
    website_url: null,
    banner_color: null,
    banner_image_url: null,
    banner_position_x: null,
    banner_position_y: null,
  };
  const currentProfileId = currentProfile.id
  React.useEffect(() => {
    setConnected(isConnected)
  }, [isConnected, currentProfileId])

  const [localAvatarUrl, setLocalAvatarUrl] = React.useState(() => currentProfile.avatar_url ?? null);
  const [avatarPanelOpen, setAvatarPanelOpen] = React.useState(false);
  const [avatarFile, setAvatarFile] = React.useState(null);
  const [avatarPreview, setAvatarPreview] = React.useState('');
  const [avatarUrlInput, setAvatarUrlInput] = React.useState('');
  const [avatarSaving, setAvatarSaving] = React.useState(false);
  const [avatarError, setAvatarError] = React.useState('');
  const [avatarHovering, setAvatarHovering] = React.useState(false);

  const [profileBanner, setProfileBanner] = React.useState(() => ({
    color: currentProfile.banner_color ?? null,
    imageUrl: currentProfile.banner_image_url ?? null,
    x: bannerNumber(currentProfile.banner_position_x),
    y: bannerNumber(currentProfile.banner_position_y),
  }))
  const [bannerPanelOpen, setBannerPanelOpen] = React.useState(false)
  const [bannerMode, setBannerMode] = React.useState(currentProfile.banner_image_url ? 'image' : currentProfile.banner_color ? 'color' : 'none')
  const [draftBannerColor, setDraftBannerColor] = React.useState(currentProfile.banner_color ?? PROFILE_BANNER_COLORS[0].value)
  const [bannerFile, setBannerFile] = React.useState(null)
  const [bannerPreview, setBannerPreview] = React.useState('')
  const [bannerUrlInput, setBannerUrlInput] = React.useState('')
  const [bannerError, setBannerError] = React.useState('')
  const [bannerSaving, setBannerSaving] = React.useState(false)
  const [isBannerRepositioning, setIsBannerRepositioning] = React.useState(false)
  const [draftBannerPosition, setDraftBannerPosition] = React.useState({ x: profileBanner.x, y: profileBanner.y })

  React.useEffect(() => {
    setProfileBanner({
      color: currentProfile.banner_color ?? null,
      imageUrl: currentProfile.banner_image_url ?? null,
      x: bannerNumber(currentProfile.banner_position_x),
      y: bannerNumber(currentProfile.banner_position_y),
    })
    setBannerMode(currentProfile.banner_image_url ? 'image' : currentProfile.banner_color ? 'color' : 'none')
    setDraftBannerColor(currentProfile.banner_color ?? PROFILE_BANNER_COLORS[0].value)
    setDraftBannerPosition({
      x: bannerNumber(currentProfile.banner_position_x),
      y: bannerNumber(currentProfile.banner_position_y),
    })
    setIsBannerRepositioning(false)
    setBannerError('')
  }, [currentProfile.id, currentProfile.banner_color, currentProfile.banner_image_url, currentProfile.banner_position_x, currentProfile.banner_position_y])

  React.useEffect(() => {
    return () => {
      if (bannerPreview) URL.revokeObjectURL(bannerPreview)
    }
  }, [bannerPreview])

  const pendingBannerImage = bannerPanelOpen && bannerMode === 'image' ? bannerPreview : ''
  const bannerImage = bannerPanelOpen && bannerMode !== 'image' ? '' : pendingBannerImage || profileBanner.imageUrl
  const previewBannerColor = bannerPanelOpen ? (bannerMode === 'color' ? draftBannerColor : null) : profileBanner.color
  const visibleBannerPosition = isBannerRepositioning ? draftBannerPosition : profileBanner
  const heroHasBanner = Boolean(bannerImage || previewBannerColor)
  const heroBackground = previewBannerColor && !bannerImage
    ? `linear-gradient(135deg, ${previewBannerColor}44 0%, ${T.bg} 54%, #080808 100%)`
    : T.bg
  const mappedArchiveItems = localArchiveItems.map(item => {
    const entry = resolveArchiveEntry(item)
    const coverUrl = entry.thumbnailUrl || entry.imageUrl
    return {
      id: item.id,
      type: entry.primaryType,
      title: entry.title,
      content: coverUrl || entry.body || entry.referenceUrl || '',
      body: entry.body,
      imageUrl: coverUrl,
      referenceUrl: entry.referenceUrl,
      author: currentProfile.display_name,
      authorRole: currentProfile.role,
      date: formatArchiveDate(item.created_at),
      link: entry.referenceUrl ? domainFromUrl(entry.referenceUrl) : undefined,
      hint: coverUrl ? 'image' : undefined,
    }
  });
  const profileWork = localArchiveItems.length ? mappedArchiveItems : profile ? [] : work;
  const profileRows = archiveRowsFor(profileWork);
  const initials = currentProfile.display_name?.charAt(0)?.toUpperCase() || 'S';
  const roleNoun = currentProfile.role === 'Curator'
    ? 'research note'
    : currentProfile.role === 'Institution'
      ? 'program'
      : 'work';
  const stats = [
    [String(localArchiveItems.length), currentProfile.role === 'Institution' ? 'Programs' : currentProfile.role === 'Curator' ? 'Notes' : 'Works'],
    [String(currentProfile.interests?.length ?? 0), 'Interests'],
    [currentProfile.discipline ? '1' : '0', 'Focus'],
    [currentProfile.geography ? '1' : '0', 'Place'],
  ];
  const connectionsByRole = {
    Artist: [
      { name:'Lena Richter',   role:'Curator',     discipline:'Contemporary', location:'Berlin',   tags:['new-media','feminist'] },
      { name:'The Serpentine', role:'Institution', discipline:'Cross-discipl.',location:'London',   tags:['residency','public'] },
      { name:'Marcus Webb',    role:'Curator',     discipline:'Photography',  location:'New York', tags:['street','identity'] },
    ],
    Curator: [
      { name:'Amara Osei',     role:'Artist',      discipline:'Photography',  location:'Lagos',    tags:['documentary','archive'] },
      { name:'Dar Al Funun',   role:'Institution', discipline:'Visual Art',   location:'Cairo',    tags:['residency','education'] },
      { name:'Priya Nair',     role:'Artist',      discipline:'Textile',      location:'Mumbai',   tags:['craft','decolonial'] },
    ],
    Institution: [
      { name:'Kenji Tanaka',   role:'Artist',      discipline:'Installation', location:'Tokyo',    tags:['sound','space'] },
      { name:'Sofia Marin',    role:'Artist',      discipline:'Performance',  location:'Mexico City', tags:['body','ritual'] },
      { name:'Lena Richter',   role:'Curator',     discipline:'Contemporary', location:'Berlin',   tags:['programming','research'] },
    ],
  };
  const connectionSuggestions = connectionsByRole[currentProfile.role] ?? connectionsByRole.Artist;

  const closeBannerPanel = () => {
    if (bannerPreview) URL.revokeObjectURL(bannerPreview)
    setBannerPreview('')
    setBannerFile(null)
    setBannerUrlInput('')
    setBannerMode(profileBanner.imageUrl ? 'image' : profileBanner.color ? 'color' : 'none')
    setDraftBannerColor(profileBanner.color ?? PROFILE_BANNER_COLORS[0].value)
    setBannerError('')
    setBannerPanelOpen(false)
  }

  const openBannerPanel = () => {
    if (bannerPanelOpen) {
      closeBannerPanel()
      return
    }
    setBannerPanelOpen(open => {
      const next = !open
      if (next) {
        setBannerMode(profileBanner.imageUrl ? 'image' : profileBanner.color ? 'color' : 'none')
        setDraftBannerColor(profileBanner.color ?? PROFILE_BANNER_COLORS[0].value)
        setBannerError('')
      }
      return next
    })
  }

  const selectBannerFile = file => {
    if (bannerPreview) URL.revokeObjectURL(bannerPreview)
    setBannerFile(file)
    setBannerPreview(file ? URL.createObjectURL(file) : '')
    setBannerMode(file ? 'image' : (profileBanner.imageUrl ? 'image' : 'none'))
    setBannerError('')
  }

  const saveBannerSettings = async () => {
    setBannerSaving(true)
    setBannerError('')

    let imageUrl = profileBanner.imageUrl
    if (bannerMode === 'image' && bannerFile) {
      const result = await uploadArchiveImage(bannerFile, currentProfile.id)
      if ('error' in result) {
        setBannerSaving(false)
        setBannerError(result.error)
        showToast(result.error, 'error')
        return
      }
      imageUrl = result.url
    } else if (bannerMode === 'image' && bannerUrlInput.trim()) {
      imageUrl = bannerUrlInput.trim()
    }
    if (bannerMode === 'image' && !imageUrl) {
      const message = 'Upload a banner photo or paste a URL first.'
      setBannerSaving(false)
      setBannerError(message)
      showToast(message, 'error')
      return
    }

    const payload = bannerMode === 'image'
      ? {
          banner_color: null,
          banner_image_url: imageUrl,
          banner_position_x: profileBanner.x,
          banner_position_y: profileBanner.y,
        }
      : bannerMode === 'color'
        ? {
            banner_color: draftBannerColor,
            banner_image_url: null,
            banner_position_x: null,
            banner_position_y: null,
          }
        : {
            banner_color: null,
            banner_image_url: null,
            banner_position_x: null,
            banner_position_y: null,
          }

    const result = await saveProfileBanner(payload)
    setBannerSaving(false)
    if ('error' in result) {
      setBannerError(result.error)
      showToast(result.error, 'error')
      return
    }

    if (bannerPreview) URL.revokeObjectURL(bannerPreview)
    setBannerPreview('')
    setBannerFile(null)
    setBannerUrlInput('')
    setProfileBanner({
      color: payload.banner_color,
      imageUrl: payload.banner_image_url,
      x: bannerNumber(payload.banner_position_x),
      y: bannerNumber(payload.banner_position_y),
    })
    setBannerPanelOpen(false)
    showToast(bannerMode === 'none' ? 'Profile banner removed.' : 'Profile banner saved.', 'success')
    router.refresh()
  }

  const beginBannerReposition = () => {
    setDraftBannerPosition({ x: profileBanner.x, y: profileBanner.y })
    setIsBannerRepositioning(true)
    setBannerError('')
  }

  const saveBannerPosition = async () => {
    if (!profileBanner.imageUrl) return
    setBannerSaving(true)
    setBannerError('')
    const result = await saveProfileBanner({
      banner_color: null,
      banner_image_url: profileBanner.imageUrl,
      banner_position_x: draftBannerPosition.x,
      banner_position_y: draftBannerPosition.y,
    })
    setBannerSaving(false)
    if ('error' in result) {
      setBannerError(result.error)
      showToast(result.error, 'error')
      return
    }
    setProfileBanner(current => ({ ...current, x: draftBannerPosition.x, y: draftBannerPosition.y }))
    setIsBannerRepositioning(false)
    showToast('Banner position saved.', 'success')
    router.refresh()
  }

  const cancelBannerPosition = () => {
    setDraftBannerPosition({ x: profileBanner.x, y: profileBanner.y })
    setIsBannerRepositioning(false)
  }

  const startBannerDrag = e => {
    if (!isBannerRepositioning) return
    e.preventDefault()
    bannerDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: draftBannerPosition.x,
      startPosY: draftBannerPosition.y,
    }
    const onMove = ev => {
      if (!bannerDragRef.current || !bannerRef.current) return
      const rect = bannerRef.current.getBoundingClientRect()
      const dx = ((ev.clientX - bannerDragRef.current.startX) / rect.width) * 100
      const dy = ((ev.clientY - bannerDragRef.current.startY) / rect.height) * 100
      setDraftBannerPosition({
        x: Math.max(0, Math.min(100, bannerDragRef.current.startPosX - dx)),
        y: Math.max(0, Math.min(100, bannerDragRef.current.startPosY - dy)),
      })
    }
    const onUp = () => {
      bannerDragRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const startPanelBannerDrag = e => {
    if (!isBannerRepositioning) return
    e.preventDefault()
    bannerPanelDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: draftBannerPosition.x,
      startPosY: draftBannerPosition.y,
    }
    const onMove = ev => {
      if (!bannerPanelDragRef.current || !bannerPanelPreviewRef.current) return
      const rect = bannerPanelPreviewRef.current.getBoundingClientRect()
      const dx = ((ev.clientX - bannerPanelDragRef.current.startX) / rect.width) * 100
      const dy = ((ev.clientY - bannerPanelDragRef.current.startY) / rect.height) * 100
      setDraftBannerPosition({
        x: Math.max(0, Math.min(100, bannerPanelDragRef.current.startPosX - dx)),
        y: Math.max(0, Math.min(100, bannerPanelDragRef.current.startPosY - dy)),
      })
    }
    const onUp = () => {
      bannerPanelDragRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const closeAvatarPanel = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    setAvatarFile(null)
    setAvatarPreview('')
    setAvatarUrlInput('')
    setAvatarError('')
    setAvatarPanelOpen(false)
  }

  const selectAvatarFile = file => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    setAvatarFile(file)
    setAvatarPreview(file ? URL.createObjectURL(file) : '')
    setAvatarUrlInput('')
    setAvatarError('')
  }

  const saveAvatar = async () => {
    setAvatarSaving(true)
    setAvatarError('')

    let url = null
    if (avatarFile) {
      const result = await uploadAvatarImage(avatarFile, currentProfile.id)
      if ('error' in result) {
        setAvatarSaving(false)
        setAvatarError(result.error)
        showToast(result.error, 'error')
        return
      }
      url = result.url
    } else if (avatarUrlInput.trim()) {
      url = avatarUrlInput.trim()
    } else {
      const message = 'Upload a photo or paste a URL first.'
      setAvatarSaving(false)
      setAvatarError(message)
      showToast(message, 'error')
      return
    }

    const result = await saveProfileAvatar(url)
    setAvatarSaving(false)
    if ('error' in result) {
      setAvatarError(result.error)
      showToast(result.error, 'error')
      return
    }
    setLocalAvatarUrl(url)
    closeAvatarPanel()
    showToast('Profile photo saved.', 'success')
    router.refresh()
  }

  const removeAvatar = async () => {
    setAvatarSaving(true)
    setAvatarError('')
    const result = await saveProfileAvatar(null)
    setAvatarSaving(false)
    if ('error' in result) {
      setAvatarError(result.error)
      showToast(result.error, 'error')
      return
    }
    setLocalAvatarUrl(null)
    closeAvatarPanel()
    showToast('Profile photo removed.', 'success')
    router.refresh()
  }

  const refreshLocalProfileArchiveItems = React.useCallback(async () => {
    if (!currentProfileId) return
    const supabase = createClient()
    const { data } = await supabase
      .from('archive_items')
      .select('id, profile_id, type, content, created_at')
      .eq('profile_id', currentProfileId)
      .order('created_at', { ascending: false })
    if (data) setLocalArchiveItems(data)
  }, [currentProfileId])

  const openArchiveComposer = () => {
    setTab('work')
    setArchiveError('')
    setComposerEditTarget(null)
    setComposerDraft({ title: '', body: '', link: '', imageUrl: '' })
    setAddOpen(true)
  }

  React.useEffect(() => {
    if (!isOwner || searchParams.get('compose') !== '1') return

    const timer = window.setTimeout(() => {
      openArchiveComposer()
      window.history.replaceState(null, '', pathname)
    }, 260)

    return () => window.clearTimeout(timer)
  }, [isOwner, pathname, searchParams])

  const editInArchiveComposer = (item) => {
    setTab('work')
    setArchiveError('')
    setSelectedArchiveItem(null)
    setComposerEditTarget({ id: item.id, type: item.type })
    setComposerDraft(archiveDraftFromItem(item))
    setAddOpen(true)
  }

  const openRelatedArchiveItem = (item, options = { fullscreen: false }) => {
    setArchiveError('')
    setSelectedArchiveItem(null)
    if (item.profile_id === currentProfileId) {
      setOverlayFullscreen(options.fullscreen)
      window.setTimeout(() => {
        setTab('work')
        setSelectedArchiveItem(item)
      }, 140)
      return
    }
    router.push(`/profile/${item.profile_id}?work=${item.id}${options.fullscreen ? '&view=full' : ''}`)
  }

  const [copied, setCopied] = React.useState(false)

  const copyProfileLink = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      showToast('Profile link copied.', 'success')
      setTimeout(() => setCopied(false), 1800)
    } catch {
      showToast('Unable to copy link in this browser.', 'error')
    }
  }

  const connectToProfile = async () => {
    if (!viewerIsAuthenticated) {
      router.push(`/login?next=/profile/${currentProfile.id}`)
      return
    }
    if (connectionSaving) return

    setConnectionSaving(true)
    setArchiveError('')
    const result = connected
      ? await disconnectProfiles(currentProfile.id)
      : await connectProfiles(currentProfile.id)
    setConnectionSaving(false)
    if ('error' in result) {
      setArchiveError(result.error)
      showToast(result.error, 'error')
      return
    }
    showToast(connected ? 'Profile disconnected.' : 'Profile connected.', 'success')
    setConnected(!connected)
    router.refresh()
  }

  return (
    <div style={{ background:T.bg, minHeight:'100vh' }}>
      {/* Hero */}
      <div
        ref={bannerRef}
        onMouseDown={startBannerDrag}
        style={{
          padding:'80px 48px 48px',
          borderBottom:`1px solid ${T.line}`,
          position:'relative',
          background: heroBackground,
          cursor: isBannerRepositioning ? 'grab' : 'default',
          userSelect: isBannerRepositioning ? 'none' : 'auto',
        }}
      >
        {bannerImage && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bannerImage}
              alt=""
              draggable={false}
              style={{
                position:'absolute',
                inset:0,
                width:'100%',
                height:'100%',
                objectFit:'cover',
                objectPosition:`${visibleBannerPosition.x}% ${visibleBannerPosition.y}%`,
                opacity:0.72,
                pointerEvents:'none',
                transition:isBannerRepositioning ? 'none' : 'object-position 0.22s ease',
              }}
            />
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(8,8,8,0.5), rgba(8,8,8,0.86))', pointerEvents:'none' }} />
          </>
        )}
        <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.02, pointerEvents:'none' }}>
          <defs><pattern id="prof-grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#prof-grid)"/>
        </svg>
        {/* Left accent bar */}
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:`linear-gradient(to bottom, transparent, ${T.artist}, transparent)`, pointerEvents:'none' }} />

        <div style={{ display:'flex', alignItems:'flex-start', gap:24, flexWrap:'wrap', position:'relative', zIndex: avatarPanelOpen ? 30 : 1, border:`1px solid rgba(255,255,255,0.13)`, borderRadius:8, background:'rgba(8,8,8,0.48)', backdropFilter:'blur(12px)', boxShadow:'0 18px 44px rgba(0,0,0,0.26)', padding:'20px 24px', width:'fit-content', maxWidth:'100%' }}>
          {/* Avatar */}
          <div style={{ position:'relative', flexShrink:0 }}>
            <div
              onClick={isOwner ? () => setAvatarPanelOpen(o => !o) : undefined}
              onMouseEnter={isOwner ? () => setAvatarHovering(true) : undefined}
              onMouseLeave={isOwner ? () => setAvatarHovering(false) : undefined}
              style={{ width:80, height:80, borderRadius:'50%', background:T.artistDim, border:`2px solid ${T.artist}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:28, color:T.artist, flexShrink:0, overflow:'hidden', cursor:isOwner ? 'pointer' : 'default', position:'relative' }}
            >
              {localAvatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={localAvatarUrl} alt={currentProfile.display_name} draggable={false} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
              ) : initials}
              {isOwner && avatarHovering && (
                <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%' }}>
                  <Camera size={20} color="#fff" />
                </div>
              )}
            </div>

            {isOwner && avatarPanelOpen && (
              <div style={{ position:'absolute', top:88, left:0, zIndex:10, minWidth:260, border:`1px solid ${T.line}`, borderRadius:8, background:'rgba(12,12,12,0.96)', backdropFilter:'blur(10px)', padding:14, boxShadow:'0 12px 36px rgba(0,0,0,0.5)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <Label size={12} color={T.artist} tracking="0.14em">Profile photo</Label>
                  <button onClick={closeAvatarPanel} style={{ width:24, height:24, borderRadius:'50%', border:`1px solid ${T.line}`, background:'transparent', color:T.muted, display:'inline-flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><X size={11} /></button>
                </div>

                {(avatarPreview || localAvatarUrl) && (
                  <div style={{ width:64, height:64, borderRadius:'50%', overflow:'hidden', border:`2px solid ${T.artist}`, marginBottom:12 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={avatarPreview || localAvatarUrl} alt="Preview" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                  </div>
                )}

                <label style={{ display:'inline-flex', alignItems:'center', gap:6, background:'transparent', border:`1px solid ${T.line}`, borderRadius:4, color:T.muted, fontFamily:"'Space Grotesk',sans-serif", fontSize:13, padding:'7px 11px', cursor:'pointer', marginBottom:10 }}>
                  <Camera size={13} /> Upload photo
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={e => selectAvatarFile(e.target.files?.[0] ?? null)} style={{ display:'none' }} />
                </label>

                <input
                  placeholder="…or paste an image URL"
                  value={avatarUrlInput}
                  onChange={e => { setAvatarUrlInput(e.target.value); if (avatarFile) { setAvatarFile(null); setAvatarPreview('') } }}
                  style={{ width:'100%', boxSizing:'border-box', background:T.bg2, border:`1px solid ${T.line}`, borderRadius:3, padding:'7px 10px', color:T.text, fontFamily:"'Space Grotesk',sans-serif", fontSize:13, outline:'none', marginBottom:10 }}
                />

                {avatarError && <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:'#f87171', marginBottom:8 }}>{avatarError}</div>}

                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  <button onClick={saveAvatar} disabled={avatarSaving} style={{ background:T.artist, border:'none', borderRadius:4, color:T.bg, fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, padding:'7px 14px', cursor:avatarSaving ? 'not-allowed' : 'pointer' }}>{avatarSaving ? 'Saving...' : 'Save photo'}</button>
                  {localAvatarUrl && <button onClick={removeAvatar} disabled={avatarSaving} style={{ background:'transparent', border:`1px solid ${T.line}`, borderRadius:4, color:T.muted, fontFamily:"'Space Grotesk',sans-serif", fontSize:13, padding:'7px 12px', cursor:avatarSaving ? 'not-allowed' : 'pointer' }}>Remove</button>}
                </div>
              </div>
            )}
          </div>
          <div style={{ flex:1, minWidth:280 }}>
            <div style={{ marginBottom:12 }}><RoleBadge role={currentProfile.role} size={13} /></div>
            <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:'clamp(40px,5vw,64px)', color:T.text, margin:'0 0 8px', letterSpacing:'-0.03em', lineHeight:1 }}>{currentProfile.display_name}</h1>
            <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:16, color:T.muted, margin:0 }}>{currentProfile.discipline || 'Unspecified'} · {currentProfile.geography || 'Global'}</p>
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'flex-start', padding:8, flexWrap:'wrap', border:`1px solid rgba(255,255,255,0.1)`, borderRadius:6, background:'rgba(0,0,0,0.24)' }}>
            {isOwner ? <Btn2 variant="outline" onClick={() => router.push('/build-profile')}>Edit Profile</Btn2> : <Btn2 variant="outline" onClick={copyProfileLink}>{copied ? 'Copied!' : 'Share Profile'}</Btn2>}
            {isOwner && <Btn2 variant="outline" onClick={openBannerPanel}>{heroHasBanner ? 'Edit Banner' : 'Add Banner'}</Btn2>}
            {isOwner ? <Btn2 onClick={openArchiveComposer}>{`Add ${roleNoun} ->`}</Btn2> : <Btn2 variant={connected ? 'connected' : 'primary'} onClick={connectToProfile}>{connectionSaving ? (connected ? 'Disconnecting...' : 'Connecting...') : connected ? 'Connected' : viewerIsAuthenticated ? 'Connect ->' : 'Join to Connect ->'}</Btn2>}
          </div>
        </div>

        {isOwner && bannerPanelOpen && (
          <div style={{ position:'relative', zIndex:2, marginTop:28, maxWidth:720, border:`1px solid ${T.line}`, borderRadius:8, background:'rgba(12,12,12,0.86)', backdropFilter:'blur(10px)', padding:18 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, marginBottom:16 }}>
              <Label size={12} color={T.artist} tracking="0.14em">Profile banner</Label>
              <button
                type="button"
                onClick={closeBannerPanel}
                style={{ width:28, height:28, borderRadius:'50%', border:`1px solid ${T.line}`, background:'transparent', color:T.muted, display:'inline-flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}
                aria-label="Close banner editor"
              >
                <X size={13} />
              </button>
            </div>

            <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:16 }}>
              <button onClick={() => setBannerMode('none')} style={{ background:bannerMode==='none' ? T.artistDim : 'transparent', border:`1px solid ${bannerMode==='none' ? T.artist : T.line}`, borderRadius:4, color:bannerMode==='none' ? T.artist : T.muted, fontFamily:"'Space Grotesk',sans-serif", fontSize:13, padding:'8px 12px', cursor:'pointer' }}>No banner</button>
              <button onClick={() => setBannerMode('color')} style={{ background:bannerMode==='color' ? T.artistDim : 'transparent', border:`1px solid ${bannerMode==='color' ? T.artist : T.line}`, borderRadius:4, color:bannerMode==='color' ? T.artist : T.muted, fontFamily:"'Space Grotesk',sans-serif", fontSize:13, padding:'8px 12px', cursor:'pointer' }}>Color</button>
              <label style={{ display:'inline-flex', alignItems:'center', gap:7, background:bannerMode==='image' ? T.artistDim : 'transparent', border:`1px solid ${bannerMode==='image' ? T.artist : T.line}`, borderRadius:4, color:bannerMode==='image' ? T.artist : T.muted, fontFamily:"'Space Grotesk',sans-serif", fontSize:13, padding:'8px 12px', cursor:'pointer' }}>
                <ImageIcon size={14} /> Upload photo
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={e => { selectBannerFile(e.target.files?.[0] ?? null); setBannerUrlInput('') }}
                  style={{ display:'none' }}
                />
              </label>
            </div>

            <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:16 }}>
              {PROFILE_BANNER_COLORS.map(color => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => {
                    setBannerMode('color')
                    setDraftBannerColor(color.value)
                  }}
                  title={color.name}
                  aria-label={color.name}
                  style={{
                    width:34,
                    height:34,
                    borderRadius:'50%',
                    border:`2px solid ${bannerMode === 'color' && draftBannerColor === color.value ? '#fff' : 'rgba(255,255,255,0.16)'}`,
                    background:color.value,
                    cursor:'pointer',
                    boxShadow:bannerMode === 'color' && draftBannerColor === color.value ? `0 0 0 3px ${color.value}55` : 'none',
                  }}
                />
              ))}
            </div>

            {bannerMode === 'image' && (
              <div style={{ marginBottom: 14 }}>
                <input
                  placeholder="…or paste an image URL"
                  value={bannerUrlInput}
                  onChange={e => {
                    const val = e.target.value
                    setBannerUrlInput(val)
                    if (bannerFile) { setBannerFile(null); setBannerPreview('') }
                    if (val.trim()) { setBannerPreview(val.trim()); setBannerMode('image') }
                    else { setBannerPreview('') }
                  }}
                  style={{ width:'100%', boxSizing:'border-box', background:T.bg2, border:`1px solid ${T.line}`, borderRadius:3, padding:'8px 12px', color:T.text, fontFamily:"'Space Grotesk',sans-serif", fontSize:13, outline:'none' }}
                />
              </div>
            )}

            {bannerMode === 'image' && (bannerPreview || profileBanner.imageUrl) && (
              <div
                ref={bannerPanelPreviewRef}
                onMouseDown={isBannerRepositioning ? startPanelBannerDrag : undefined}
                style={{ position:'relative', height:150, borderRadius:6, overflow:'hidden', border:`1px solid ${T.line}`, marginBottom:16, background:'#080808', cursor: isBannerRepositioning ? 'grab' : 'default', userSelect: isBannerRepositioning ? 'none' : 'auto' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={bannerPreview || profileBanner.imageUrl}
                  alt="Banner preview"
                  draggable={false}
                  style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:`${isBannerRepositioning ? draftBannerPosition.x : profileBanner.x}% ${isBannerRepositioning ? draftBannerPosition.y : profileBanner.y}%`, display:'block', pointerEvents:'none', transition: isBannerRepositioning ? 'none' : 'object-position 0.22s ease' }}
                />
                {isBannerRepositioning && (
                  <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
                    <span style={{ background:'rgba(0,0,0,0.6)', color:'#fff', fontFamily:"'Space Grotesk',sans-serif", fontSize:12, padding:'5px 12px', borderRadius:4, backdropFilter:'blur(4px)' }}>Drag to reposition</span>
                  </div>
                )}
              </div>
            )}

            {bannerError && <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:'#f87171', marginBottom:12 }}>{bannerError}</div>}

            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              <button onClick={saveBannerSettings} disabled={bannerSaving} style={{ background:T.artist, border:'none', borderRadius:4, color:T.bg, fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, padding:'9px 18px', cursor:bannerSaving ? 'not-allowed' : 'pointer' }}>{bannerSaving ? 'Saving...' : 'Save banner'}</button>
              {bannerMode === 'image' && (bannerPreview || profileBanner.imageUrl) && (
                <button onClick={() => { setDraftBannerPosition({ x: profileBanner.x, y: profileBanner.y }); setIsBannerRepositioning(true) }} disabled={bannerSaving} style={{ display:'inline-flex', alignItems:'center', gap:7, background: isBannerRepositioning ? T.artistDim : 'transparent', border:`1px solid ${isBannerRepositioning ? T.artist : T.line}`, borderRadius:4, color: isBannerRepositioning ? T.artist : T.muted, fontFamily:"'Space Grotesk',sans-serif", fontSize:13, padding:'9px 14px', cursor:'pointer' }}><Move size={14} /> {isBannerRepositioning ? 'Repositioning…' : 'Reposition photo'}</button>
              )}
            </div>
          </div>
        )}

        {isOwner && profileBanner.imageUrl && !isBannerRepositioning && !bannerPanelOpen && (
          <button
            type="button"
            onClick={beginBannerReposition}
            style={{ position:'absolute', right:48, bottom:28, zIndex:3, display:'inline-flex', alignItems:'center', gap:7, background:'rgba(12,12,12,0.72)', border:`1px solid ${T.lineB}`, borderRadius:4, color:T.sub, fontFamily:"'Space Grotesk',sans-serif", fontSize:12, padding:'7px 12px', cursor:'pointer', backdropFilter:'blur(8px)' }}
          >
            <Move size={13} /> Reposition
          </button>
        )}

        {isBannerRepositioning && (
          <>
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:2, pointerEvents:'none' }}>
              <span style={{ background:'rgba(0,0,0,0.6)', color:'#fff', fontFamily:"'Space Grotesk',sans-serif", fontSize:13, padding:'7px 14px', borderRadius:4, backdropFilter:'blur(6px)' }}>
                Drag image to reposition
              </span>
            </div>
            <div onMouseDown={e => e.stopPropagation()} style={{ position:'absolute', right:48, top:88, zIndex:4, display:'flex', gap:8 }}>
              <button onClick={cancelBannerPosition} style={{ background:'rgba(20,20,20,0.84)', border:`1px solid ${T.lineB}`, borderRadius:4, color:T.sub, fontFamily:"'Space Grotesk',sans-serif", fontSize:12, padding:'7px 13px', cursor:'pointer' }}>Cancel</button>
              <button onClick={saveBannerPosition} disabled={bannerSaving} style={{ background:T.artist, border:`1px solid ${T.artist}`, borderRadius:4, color:T.bg, fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:12, padding:'7px 14px', cursor:bannerSaving ? 'not-allowed' : 'pointer', boxShadow:'0 10px 28px rgba(155,127,248,0.32)' }}>{bannerSaving ? 'Saving...' : 'Save position'}</button>
            </div>
          </>
        )}

        {/* Stats */}
        <div style={{ display:'flex', gap:12, marginTop:40, flexWrap:'wrap', position:'relative', zIndex:1 }}>
          {stats.map(([n,l],i) => (
            <div key={l} style={{ minWidth:112, padding:'12px 16px', border:`1px solid rgba(255,255,255,0.13)`, borderRadius:6, background:'rgba(8,8,8,0.56)', backdropFilter:'blur(10px)', boxShadow:'0 12px 30px rgba(0,0,0,0.24)' }}>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:24, color:T.text, lineHeight:1 }}>{n}</div>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:12, color:'#cfcfcf', marginTop:5 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:`1px solid ${T.line}`, padding:'0 48px' }}>
        {['work','about','connections'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding:'14px 0', marginRight:32, background:'none', border:'none', borderBottom:`2px solid ${tab===t ? T.artist : 'transparent'}`, marginBottom:-1, fontFamily:"'Space Grotesk',sans-serif", fontSize:14, fontWeight:tab===t ? 600 : 400, color:tab===t ? T.text : T.muted, cursor:'pointer', transition:'all 0.15s', textTransform:'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding:'36px 48px 80px' }}>
        {tab==='work' && (
          <>
          {archiveError && (
            <div style={{ marginBottom: 16, fontFamily:"'DM Mono',monospace", fontSize:11, color:'#f87171' }}>
              {archiveError}
            </div>
          )}
          {profileWork.length > 0 ? (
            <div>
              {profileRows.map(row => (
                <ArchivePrimeRail
                  key={row.id}
                  title={row.title}
                  items={row.items}
                  onExpand={card => {
                    const raw = localArchiveItems.find(item => item.id === card.id)
                    if (raw) setSelectedArchiveItem(raw)
                  }}
                />
              ))}
            </div>
          ) : (
            <div style={{ padding:'72px 0', textAlign:'center', borderTop:`1px solid ${T.line}` }}>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:32, color:T.faint, marginBottom:20 }}>∅</div>
              <Label size={13} color={T.muted}>{isOwner ? 'Your archive is empty' : 'No archive entries yet'}</Label>
              <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:15, color:T.muted, marginTop:10, lineHeight:1.6 }}>
                {isOwner ? `Add your first ${roleNoun}.` : `${currentProfile.display_name} has not added archive entries yet.`}
              </p>
              {isOwner && (
                <button onClick={openArchiveComposer}
                  style={{ marginTop:20, background:'none', border:`1px solid ${T.line}`, borderRadius:3, cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif", fontSize:13, color:T.muted, padding:'8px 20px', transition:'all 0.15s' }}>
                  {`Add ${roleNoun}`}
                </button>
              )}
            </div>
          )}
          <AnimatePresence>
            {selectedArchiveItem && (
              <PostDetailOverlay
                key={selectedArchiveItem.id}
                item={selectedArchiveItem}
                items={localArchiveItems}
                onClose={() => setSelectedArchiveItem(null)}
                isOwner={isOwner}
                onEditInComposer={isOwner ? editInArchiveComposer : undefined}
                onOpenRelated={openRelatedArchiveItem}
                initialFullscreen={overlayFullscreen}
                profile={currentProfile}
                onItemUpdate={updatedItem => {
                  setLocalArchiveItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i))
                  setSelectedArchiveItem(updatedItem)
                }}
              />
            )}
          </AnimatePresence>
          </>
        )}
        {tab==='about' && (
          <div style={{ maxWidth:560 }}>
            <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:16, color:T.sub, lineHeight:1.75, marginBottom:32 }}>
              {currentProfile.bio || `${currentProfile.display_name} is part of the Saye collective.`}
            </p>
            {currentProfile.website_url && (
              <div style={{ marginBottom:32 }}>
                <Label size={12} color={T.muted} style={{ display:'block', marginBottom:10 }}>Website</Label>
                <a
                  href={currentProfile.website_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:15, color:T.artist, textDecoration:'none' }}
                >
                  {domainFromUrl(currentProfile.website_url)}
                </a>
              </div>
            )}
            <RuleLine margin="0 0 28px" />
            <Label size={12} color={T.muted} style={{ display:'block', marginBottom:12 }}>Disciplines</Label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {(currentProfile.interests?.length ? currentProfile.interests : [currentProfile.discipline].filter(Boolean)).map(t => (
                <Chip2 key={t} label={t} active={false} onClick={() => {}} />
              ))}
            </div>
          </div>
        )}
        {tab==='connections' && (() => {
          const isMock = currentProfile.id?.startsWith('demo-')
          const toShow = isMock
            ? (connectedProfiles.length ? connectedProfiles : suggestedProfiles.length ? suggestedProfiles : connectionSuggestions)
            : connectedProfiles
          if (toShow.length === 0) {
            return (
              <div style={{ padding:'72px 0', textAlign:'center', borderTop:`1px solid ${T.line}` }}>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:32, color:T.faint, marginBottom:20 }}>∅</div>
                <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:16, fontWeight:600, color:T.sub, margin:'0 0 8px' }}>
                  {isOwner ? 'You have no connections yet' : 'No connections yet'}
                </p>
                <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:14, color:T.muted, margin:0, lineHeight:1.6 }}>
                  {isOwner ? 'Find artists, curators and institutions to connect with.' : `${currentProfile.display_name} hasn't connected with anyone yet.`}
                </p>
                {isOwner && (
                  <button onClick={() => navigate('discover')}
                    style={{ marginTop:20, background:'none', border:`1px solid ${T.line}`, borderRadius:3, cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif", fontSize:13, color:T.muted, padding:'8px 20px', transition:'all 0.15s' }}>
                    Discover profiles →
                  </button>
                )}
              </div>
            )
          }
          return (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))', gap:14 }}>
              {toShow.map((p, i) => (
                <div key={p.id || p.name} style={{ animation: 'fadeUp 0.35s ease both', animationDelay: `${i * 65}ms` }}>
                  <DiscoverCard2
                    name={p.display_name || p.name}
                    role={p.role}
                    discipline={p.discipline || 'Unspecified'}
                    location={p.geography || 'Global'}
                    tags={p.interests?.length ? p.interests.slice(0,3) : p.tags || []}
                    avatarUrl={p.avatar_url || null}
                    onClick={() => {
                      if (p.id) router.push(`/profile/${p.id}`)
                    }}
                  />
                </div>
              ))}
            </div>
          )
        })()}
      </div>
      {isOwner && (
        <ArchiveComposerOverlay
          open={addOpen}
          profileId={currentProfile.id}
          initialDraft={composerDraft ?? undefined}
          editTarget={composerEditTarget}
          onClose={() => {
            setAddOpen(false)
            setComposerEditTarget(null)
            setComposerDraft(null)
          }}
          onSaved={async () => {
            setArchiveError('')
            setComposerEditTarget(null)
            setComposerDraft(null)
            await refreshLocalProfileArchiveItems()
            router.refresh()
          }}
        />
      )}
    </div>
  );
}

export {
  LandingScreen2 as LandingScreen,
  AuthScreen2 as AuthScreen,
  BuildProfileScreen2 as BuildProfileScreen,
  DiscoverScreen2 as DiscoverScreen,
  ArchiveScreen2 as ArchiveScreen,
  ProfileScreen2 as ProfileScreen,
}
