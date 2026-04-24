'use client'
/* eslint-disable @typescript-eslint/no-unused-vars, react-hooks/static-components */

import React from 'react'
import { ArchiveCard2, Btn2, Chip2, DiscoverCard2, Input2, Label, ROLE_CONFIG, RoleBadge, RoleCard2, RuleLine, SectionMark, T } from '@/features/handoff/ui'
import { createClient } from '@/lib/supabase/client'

// SAYE Collective v2 — Screen Components
// Font sizes: Hero 96-140px · H1 56-72px · H2 32-48px · Body 15-17px · Label 13px · Meta 12px (min)

// ─── LANDING ───────────────────────────────────────────────────────────────
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
      {/* ── Hero ── */}
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

      {/* ── Feature Sections ── */}
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

// ─── AUTH ──────────────────────────────────────────────────────────────────
export function AuthScreen2({ navigate }) {
  const [mode, setMode] = React.useState('in');
  const [email, setEmail] = React.useState('');
  const [pass, setPass]   = React.useState('');
  const [name, setName]   = React.useState('');

  const handleGoogle = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${location.origin}/auth/callback` } })
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
            <div style={{ marginTop: 4 }}><Btn2 full onClick={() => navigate('discover')}>{mode==='in' ? 'Sign In →' : 'Create Account →'}</Btn2></div>
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

// ─── BUILD PROFILE ─────────────────────────────────────────────────────────
export function BuildProfileScreen2({ navigate }) {
  const [step, setStep] = React.useState(1);
  const [role, setRole] = React.useState(null);
  const [form, setForm] = React.useState({ name:'', bio:'', location:'', website:'' });
  const [disc, setDisc] = React.useState([]);

  const roles = [
    { role:'Artist',      desc:'You create. Build a portfolio that travels — across galleries, institutions, and collections.' },
    { role:'Curator',     desc:'You shape context. Connect with artists, build exhibition concepts, find institutional partners.' },
    { role:'Institution', desc:'You hold space. List your programs, find artists for residencies, connect with aligned curators.' },
  ];
  const disciplines = ['Painting','Sculpture','Photography','Video','Performance','Installation','Digital Art','Ceramics','Textile','Sound','Drawing','Print','Mixed Media'];

  const setD = v => setDisc(d => d.includes(v) ? d.filter(x=>x!==v) : [...d,v]);

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
          <Btn2 disabled={!role} onClick={() => setStep(2)}>Continue as {role||'...'} →</Btn2>
        </>}

        {step === 2 && <>
          <Label size={12} color={role ? ROLE_CONFIG[role]?.color : T.artist} tracking="0.14em">Step 02 / {role} Profile</Label>
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:'clamp(36px,4vw,56px)', lineHeight:1.0, color:T.text, margin:'16px 0 40px', letterSpacing:'-0.03em' }}>
            Shape your<br /><span style={{ color:role ? ROLE_CONFIG[role]?.color : T.artist }}>identity.</span>
          </h1>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            <div style={{ gridColumn:'span 2' }}><Input2 label="Display Name" placeholder="Your name or alias" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
            <div style={{ gridColumn:'span 2' }}><Input2 label="Bio" placeholder="A brief statement about your practice, approach, or institution…" textarea value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} rows={4} /></div>
            <Input2 label="Location" placeholder="City, Country" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} />
            <Input2 label="Website" placeholder="yoursite.com" value={form.website} onChange={e=>setForm({...form,website:e.target.value})} />
            <div style={{ gridColumn:'span 2' }}>
              <Label size={12} color={T.muted} style={{ display:'block', marginBottom:10 }}>Disciplines</Label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {disciplines.map(d => <Chip2 key={d} label={d} active={disc.includes(d)} onClick={() => setD(d)} />)}
              </div>
            </div>
            <div style={{ gridColumn:'span 2', display:'flex', gap:12, marginTop:8 }}>
              <Btn2 variant="outline" onClick={() => setStep(1)}>← Back</Btn2>
              <Btn2 onClick={() => navigate('profile')}>Create Profile →</Btn2>
            </div>
          </div>
        </>}
      </div>
    </div>
  );
}

// ─── DISCOVER ─────────────────────────────────────────────────────────────
export function DiscoverScreen2({ navigate }) {
  const [geo, setGeo]   = React.useState([]);
  const [disc, setDisc] = React.useState([]);
  const [int_, setInt]  = React.useState([]);
  const [search, setSearch] = React.useState('');
  const [searchFoc, setSearchFoc] = React.useState(false);
  const [roleFilter, setRoleFilter] = React.useState('All');

  const geos  = ['New York','London','Paris','Berlin','Lagos','Tokyo','São Paulo','Cairo','Seoul','Amsterdam','Nairobi','Mexico City'];
  const discs = ['Painting','Sculpture','Photography','Video','Performance','Installation','Digital Art','Sound','Ceramics','Drawing'];
  const ints  = ['Collaboration','Residency','Exhibition','Commission','Research','Publication','Mentorship','Collection'];

  const tog = (arr, set, v) => set(a => a.includes(v) ? a.filter(x=>x!==v) : [...a,v]);
  const total = geo.length + disc.length + int_.length;

  const people = [
    { name:'Amara Osei',    role:'Artist',      discipline:'Photography',   location:'Lagos',       tags:['conceptual','documentary','africa'] },
    { name:'Lena Richter',  role:'Curator',     discipline:'Contemporary',  location:'Berlin',      tags:['new-media','feminist','archive'] },
    { name:'The Serpentine',role:'Institution', discipline:'Cross-discipl.',location:'London',      tags:['residency','commission','public'] },
    { name:'Kenji Tanaka',  role:'Artist',      discipline:'Installation',  location:'Tokyo',       tags:['sound','space','minimal'] },
    { name:'Sofia Marín',   role:'Artist',      discipline:'Performance',   location:'Mexico City', tags:['body','ritual','land'] },
    { name:'Marcus Webb',   role:'Curator',     discipline:'Photography',   location:'New York',    tags:['street','identity','diaspora'] },
    { name:'Dar Al Funun',  role:'Institution', discipline:'Visual Art',    location:'Cairo',       tags:['mena','residency','education'] },
    { name:'Priya Nair',    role:'Artist',      discipline:'Textile',       location:'Mumbai',      tags:['craft','decolonial','color'] },
    { name:'Yaw Darko',     role:'Artist',      discipline:'Drawing',       location:'Accra',       tags:['narrative','ink','mythology'] },
  ];

  const q = search.trim().toLowerCase();
  const filtered = people.filter(p => {
    if (roleFilter !== 'All' && p.role !== roleFilter) return false;
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p.discipline.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.tags.some(t => t.includes(q));
  });

  const FilterCol = ({ label, chips, active, set }) => (
    <div style={{ flex: 1 }}>
      <div style={{ paddingBottom: 12, marginBottom: 14, borderBottom: `1px solid ${T.line}` }}>
        <Label size={12} color={T.muted}>{label}</Label>
        {active.length > 0 && <span style={{ marginLeft: 8, fontFamily:"'DM Mono',monospace", fontSize:11, color: T.artist }}>({active.length})</span>}
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
        {chips.map(c => <Chip2 key={c} label={c} active={active.includes(c)} onClick={() => tog(active, set, c)} />)}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:T.bg, padding:'88px 48px 80px' }}>
      <div style={{ marginBottom:40 }}>
        <Label size={12} color={T.artist} tracking="0.14em">Discover</Label>
        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:'clamp(40px,5.5vw,72px)', color:T.text, margin:'12px 0 0', letterSpacing:'-0.03em', lineHeight:1.0 }}>
          Find your<br /><span style={{ color:T.artist }}>constellation.</span>
        </h1>
      </div>

      {/* Search */}
      <div style={{ position:'relative', maxWidth:560, marginBottom:36 }}>
        <input placeholder="Search by name, discipline, keyword…"
          value={search} onChange={e => setSearch(e.target.value)}
          onFocus={() => setSearchFoc(true)} onBlur={() => setSearchFoc(false)}
          style={{ width:'100%', background:T.surf, border:`1px solid ${searchFoc ? 'rgba(155,127,248,0.4)' : T.line}`, borderRadius:3, padding:'13px 48px 13px 18px', color:T.text, fontFamily:"'Space Grotesk',sans-serif", fontSize:15, outline:'none', boxSizing:'border-box', transition:'border-color 0.15s', boxShadow: searchFoc ? '0 0 0 3px rgba(155,127,248,0.05)' : 'none' }} />
        <span style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', fontFamily:"'DM Mono',monospace", fontSize:12, color:T.muted }}>⌘K</span>
      </div>

      {/* Triple-filter shelf */}
      <div style={{ marginBottom:12, padding:'28px 28px', background:T.surf, border:`1px solid ${T.line}`, borderRadius:4, display:'flex', gap:40 }}>
        <FilterCol label="Geography" chips={geos}  active={geo}  set={setGeo} />
        <div style={{ width:1, background:T.line, flexShrink:0 }} />
        <FilterCol label="Discipline" chips={discs} active={disc} set={setDisc} />
        <div style={{ width:1, background:T.line, flexShrink:0 }} />
        <FilterCol label="Interest"   chips={ints}  active={int_} set={setInt} />
      </div>

      {/* Active + clear */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:28, minHeight:32, flexWrap:'wrap' }}>
        {total > 0 && <>
          <Label size={12} color={T.faint}>Active:</Label>
          {[...geo,...disc,...int_].map(f => (
            <span key={f} style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:13, color:T.artist, background:T.artistDim, border:`1px solid rgba(155,127,248,0.2)`, padding:'3px 12px', borderRadius:2 }}>{f}</span>
          ))}
          <button onClick={() => { setGeo([]); setDisc([]); setInt([]); }}
            style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif", fontSize:13, color:T.muted }}>
            Clear all ×
          </button>
        </>}
      </div>

      {/* Role tabs */}
      <div style={{ display:'flex', gap:0, borderBottom:`1px solid ${T.line}`, marginBottom:28 }}>
        {['All','Artist','Curator','Institution'].map(r => (
          <button key={r} onClick={() => setRoleFilter(r)}
            style={{ padding:'10px 20px', background:'none', border:'none', borderBottom:`2px solid ${roleFilter===r ? (r==='Artist'?T.artist:r==='Curator'?T.curator:r==='Institution'?T.inst:T.text) : 'transparent'}`, marginBottom:-1, fontFamily:"'Space Grotesk',sans-serif", fontSize:14, color: roleFilter===r ? T.text : T.muted, cursor:'pointer', transition:'all 0.15s' }}>
            {r}
          </button>
        ))}
        <Label size={12} color={T.muted} style={{ marginLeft:'auto', alignSelf:'center', paddingRight:4 }}>{filtered.length} results</Label>
      </div>

      {/* Cards */}
      {filtered.length > 0 ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14 }}>
          {filtered.map((p, i) => (
            <div key={p.name} style={{ animation: 'fadeUp 0.35s ease both', animationDelay: `${i * 55}ms` }}>
              <DiscoverCard2 {...p} onClick={() => navigate('profile')} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding:'80px 0', textAlign:'center', borderTop:`1px solid ${T.line}` }}>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:32, color:T.faint, marginBottom:20 }}>∅</div>
          <Label size={13} color={T.muted}>No results</Label>
          <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:15, color:T.muted, marginTop:10, lineHeight:1.6 }}>
            Try different filters or clear your search.
          </p>
          {(total > 0 || q) && (
            <button onClick={() => { setGeo([]); setDisc([]); setInt([]); setSearch(''); setRoleFilter('All'); }}
              style={{ marginTop:20, background:'none', border:`1px solid ${T.line}`, borderRadius:3, cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif", fontSize:13, color:T.muted, padding:'8px 20px', transition:'all 0.15s' }}>
              Clear everything
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── ARCHIVE ───────────────────────────────────────────────────────────────
export function ArchiveScreen2({ navigate }) {
  const [typeFilter, setTypeFilter] = React.useState('all');

  const posts = [
    { type:'image', title:'Untitled (After the Rain)', author:'Amara Osei', authorRole:'Artist', date:'Apr 2026', hint:'large format · silver gelatin', span:true, tall:true },
    { type:'text',  title:'On the failure of documentation', content:'Every archive is a betrayal. The photograph reduces the duration of a performance to a single breath. The catalog translates color into language. And yet—', author:'Lena Richter', authorRole:'Curator', date:'Apr 2026' },
    { type:'link',  title:'Open Call: Serpentine Summer Residency 2026', content:'Applications open for artists working at the intersection of ecology and digital media.', author:'The Serpentine', authorRole:'Institution', date:'Mar 2026', link:'serpentinegalleries.org' },
    { type:'image', title:'Study #7 — Sound / Space', author:'Kenji Tanaka', authorRole:'Artist', date:'Mar 2026', hint:'installation view' },
    { type:'text',  title:'Why I stopped making work for institutions', content:'The question is not whether the institution can hold the work. The question is whether the work survives the institution.', author:'Sofia Marín', authorRole:'Artist', date:'Mar 2026' },
    { type:'link',  title:'Reading: Decolonizing the Museum', content:'A collection of critical texts on curatorial practice and institutional power.', author:'Marcus Webb', authorRole:'Curator', date:'Feb 2026', link:'are.na' },
    { type:'image', title:'Thread Series IV', author:'Priya Nair', authorRole:'Artist', date:'Feb 2026', hint:'natural dye on cotton' },
    { type:'text',  title:'The archive as living body', content:'To archive is not to preserve. It is to make decisions about what endures and what dissolves.', author:'Yaw Darko', authorRole:'Artist', date:'Feb 2026' },
  ];

  const filtered = typeFilter==='all' ? posts : posts.filter(p=>p.type===typeFilter);

  return (
    <div style={{ minHeight:'100vh', background:T.bg, padding:'88px 48px 80px' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:40, gap:20, flexWrap:'wrap' }}>
        <div>
          <Label size={12} color={T.artist} tracking="0.14em">The Archive</Label>
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:'clamp(40px,5.5vw,72px)', color:T.text, margin:'12px 0 0', letterSpacing:'-0.03em', lineHeight:1.0 }}>
            A living<br /><span style={{ color:T.artist }}>exhibition wall.</span>
          </h1>
        </div>
        <Btn2 variant="ghost" onClick={() => navigate('build-profile')}>+ Add to Archive</Btn2>
      </div>

      {/* Type filter — text tabs style */}
      <div style={{ display:'flex', gap:0, borderBottom:`1px solid ${T.line}`, marginBottom:36 }}>
        {[['all','All'],['image','Images'],['text','Texts'],['link','Links']].map(([id,lbl]) => (
          <button key={id} onClick={() => setTypeFilter(id)}
            style={{ padding:'10px 20px', background:'none', border:'none', borderBottom:`2px solid ${typeFilter===id ? T.artist : 'transparent'}`, marginBottom:-1, fontFamily:"'Space Grotesk',sans-serif", fontSize:14, fontWeight: typeFilter===id ? 600 : 400, color: typeFilter===id ? T.text : T.muted, cursor:'pointer', transition:'all 0.15s' }}>
            {lbl}
          </button>
        ))}
      </div>

      {/* Grid — editorial, mixed sizes */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, gridAutoRows:'auto' }}>
        {filtered.map((p, i) => (
          <div key={p.title} style={{ gridColumn: p.span ? 'span 2' : 'span 1', display:'flex', flexDirection:'column', animation: 'fadeUp 0.35s ease both', animationDelay: `${i * 60}ms` }}>
            <ArchiveCard2 {...p} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PROFILE ───────────────────────────────────────────────────────────────
export function ProfileScreen2({ navigate }) {
  const [tab, setTab] = React.useState('work');

  const work = [
    { type:'image', title:'Untitled (After the Rain)', authorRole:'Artist', date:'Apr 2026', hint:'photograph', author:'Amara Osei' },
    { type:'text',  title:'Notes on presence and distance', content:'The camera creates distance. This is not a failure. This is the condition.', author:'Amara Osei', authorRole:'Artist', date:'Mar 2026' },
    { type:'image', title:'Borrowed Light Series I–III', authorRole:'Artist', date:'Feb 2026', hint:'triptych', author:'Amara Osei' },
    { type:'link',  title:'Artist Statement — 2026', author:'Amara Osei', authorRole:'Artist', date:'Jan 2026', link:'amaraosei.com' },
  ];

  return (
    <div style={{ background:T.bg, minHeight:'100vh' }}>
      {/* Hero */}
      <div style={{ padding:'80px 48px 48px', borderBottom:`1px solid ${T.line}`, position:'relative', overflow:'hidden' }}>
        <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.02 }}>
          <defs><pattern id="prof-grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#prof-grid)"/>
        </svg>
        {/* Left accent bar */}
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:`linear-gradient(to bottom, transparent, ${T.artist}, transparent)` }} />

        <div style={{ display:'flex', alignItems:'flex-start', gap:32, flexWrap:'wrap' }}>
          <div style={{ width:80, height:80, borderRadius:'50%', background:T.artistDim, border:`2px solid ${T.artist}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:28, color:T.artist, flexShrink:0 }}>A</div>
          <div style={{ flex:1, minWidth:280 }}>
            <div style={{ marginBottom:12 }}><RoleBadge role="Artist" size={13} /></div>
            <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:'clamp(40px,5vw,64px)', color:T.text, margin:'0 0 8px', letterSpacing:'-0.03em', lineHeight:1 }}>Amara Osei</h1>
            <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:16, color:T.muted, margin:0 }}>Photography · Lagos, Nigeria</p>
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'flex-start', paddingTop:8 }}>
            <Btn2 variant="outline">Message</Btn2>
            <Btn2>Connect →</Btn2>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'flex', gap:0, marginTop:40, borderTop:`1px solid ${T.line}`, paddingTop:28 }}>
          {[['28','Works'],['140','Connections'],['6','Exhibitions'],['3','Residencies']].map(([n,l],i) => (
            <div key={l} style={{ paddingRight:40, marginRight:40, borderRight: i<3 ? `1px solid ${T.line}` : 'none' }}>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:24, color:T.text }}>{n}</div>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:13, color:T.muted, marginTop:2 }}>{l}</div>
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
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:14 }}>
            {work.map((w, i) => (
              <div key={w.title} style={{ display:'flex', flexDirection:'column', animation: 'fadeUp 0.35s ease both', animationDelay: `${i * 65}ms` }}>
                <ArchiveCard2 {...w} />
              </div>
            ))}
          </div>
        )}
        {tab==='about' && (
          <div style={{ maxWidth:560 }}>
            <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:16, color:T.sub, lineHeight:1.75, marginBottom:32 }}>
              Amara Osei is a Lagos-based photographer working at the intersection of documentary practice and conceptual art. Her work explores the gap between presence and record — what photographs preserve, and what they inevitably destroy.
            </p>
            <RuleLine margin="0 0 28px" />
            <Label size={12} color={T.muted} style={{ display:'block', marginBottom:12 }}>Disciplines</Label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {['conceptual','documentary','large-format','silver-gelatin','africa','diaspora'].map(t => (
                <Chip2 key={t} label={t} active={false} onClick={() => {}} />
              ))}
            </div>
          </div>
        )}
        {tab==='connections' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))', gap:14 }}>
            {[
              { name:'Lena Richter',   role:'Curator',     discipline:'Contemporary', location:'Berlin',   tags:['new-media','feminist'] },
              { name:'The Serpentine', role:'Institution', discipline:'Cross-discipl.',location:'London',   tags:['residency','public'] },
              { name:'Marcus Webb',    role:'Curator',     discipline:'Photography',  location:'New York',  tags:['street','identity'] },
            ].map((p, i) => (
              <div key={p.name} style={{ animation: 'fadeUp 0.35s ease both', animationDelay: `${i * 65}ms` }}>
                <DiscoverCard2 {...p} onClick={() => {}} />
              </div>
            ))}
          </div>
        )}
      </div>
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
