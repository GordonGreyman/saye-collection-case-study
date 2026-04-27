'use client'

import { startTransition, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/ToastProvider'
import { DISCIPLINE_PRESETS, GEOGRAPHY_PRESETS } from '@/lib/constants'
import type { Profile, ProfileRole } from '@/lib/types'
import { profileSchema, type ProfileFormData } from '@/lib/validators/profile'
import { upsertProfile } from '@/features/profiles/actions'
import { WelcomeScreen } from '@/features/profiles/WelcomeScreen'
import { RoleCard } from '@/features/profiles/RoleCard'
import { InterestPicker } from '@/features/profiles/InterestPicker'
import { CelebrationScreen } from '@/features/profiles/CelebrationScreen'

const DRAFT_KEY = 'saye_profile_draft'

const ROLE_TAGLINES: Record<ProfileRole, string> = {
  Artist: 'I make.',
  Curator: 'I curate.',
  Institution: 'I build spaces.',
}

interface BuildProfileWizardProps {
  defaultValues?: Profile | null
  userId?: string
}

export function BuildProfileWizard({ defaultValues, userId }: BuildProfileWizardProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const isEditMode = Boolean(defaultValues)

  const initialValues = useMemo<ProfileFormData>(
    () => ({
      role: defaultValues?.role ?? 'Artist',
      display_name: defaultValues?.display_name ?? '',
      bio: defaultValues?.bio ?? '',
      website_url: defaultValues?.website_url ?? '',
      geography: defaultValues?.geography ?? '',
      discipline: defaultValues?.discipline ?? '',
      interests: defaultValues?.interests ?? [],
    }),
    [defaultValues]
  )

  const [step, setStep] = useState(isEditMode ? 1 : 0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [pendingDraft, setPendingDraft] = useState<ProfileFormData | null>(null)
  const [showDraftChoice, setShowDraftChoice] = useState(false)

  const {
    register,
    control,
    setValue,
    trigger,
    getValues,
    reset,
    setError,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: initialValues,
  })

  useEffect(() => {
    register('role', { required: 'Required' })
    register('geography', {
      validate: value => (value && value.trim().length > 0 ? true : 'Required'),
    })
    register('discipline', {
      validate: value => (value && value.trim().length > 0 ? true : 'Required'),
    })
    register('interests', {
      validate: value => (Array.isArray(value) && value.length > 0 ? true : 'Add at least one interest'),
    })
  }, [register])

  useEffect(() => {
    if (isEditMode) {
      return
    }

    const savedDraft = localStorage.getItem(DRAFT_KEY)
    if (!savedDraft) {
      return
    }

    try {
      const parsed = JSON.parse(savedDraft) as Partial<ProfileFormData>
      const hydratedDraft: ProfileFormData = {
        ...initialValues,
        ...parsed,
        interests: Array.isArray(parsed.interests)
          ? parsed.interests.filter(item => typeof item === 'string')
          : initialValues.interests,
      }
      startTransition(() => {
        setPendingDraft(hydratedDraft)
        setShowDraftChoice(true)
      })
    } catch {
      localStorage.removeItem(DRAFT_KEY)
    }
  }, [initialValues, isEditMode])

  const role = (useWatch({ control, name: 'role' }) as ProfileRole) ?? 'Artist'
  const displayName = useWatch({ control, name: 'display_name' })
  const geography = useWatch({ control, name: 'geography' }) ?? ''
  const discipline = useWatch({ control, name: 'discipline' }) ?? ''
  const interests = useWatch({ control, name: 'interests' }) ?? []

  const disciplinePresets = DISCIPLINE_PRESETS[role]
  const isGeographyPreset = GEOGRAPHY_PRESETS.includes(geography as (typeof GEOGRAPHY_PRESETS)[number])
  const isDisciplinePreset = disciplinePresets.includes(discipline)

  const saveDraft = () => {
    if (isEditMode) {
      return
    }

    localStorage.setItem(DRAFT_KEY, JSON.stringify(getValues()))
  }

  const onSelectRole = (selectedRole: ProfileRole) => {
    setValue('role', selectedRole, { shouldDirty: true, shouldValidate: true })
    saveDraft()
    setStep(2)
  }

  const onUseSavedDraft = () => {
    if (pendingDraft) {
      reset(pendingDraft)
    }
    setShowDraftChoice(false)
  }

  const onDiscardSavedDraft = () => {
    localStorage.removeItem(DRAFT_KEY)
    setShowDraftChoice(false)
    setPendingDraft(null)
  }

  const onNextIdentity = async () => {
    const valid = await trigger(['display_name', 'geography', 'discipline'])
    if (!valid) {
      return
    }

    saveDraft()
    setStep(3)
  }

  const onCompleteProfile = async () => {
    setSubmitError('')

    const isValid = await trigger(['role', 'display_name', 'geography', 'discipline', 'interests'])
    if (!isValid) {
      return
    }

    const values = getValues()
    const parsed = profileSchema.safeParse(values)

    if (!parsed.success) {
      parsed.error.issues.forEach(issue => {
        const field = issue.path[0] as keyof ProfileFormData | undefined
        if (field) {
          setError(field, { message: issue.message })
        }
      })
      setSubmitError(parsed.error.issues[0]?.message ?? 'Please review your profile details.')
      return
    }

    setIsSubmitting(true)
    const result = await upsertProfile(parsed.data)
    setIsSubmitting(false)

    if ('error' in result) {
      setSubmitError(result.error)
      showToast(result.error, 'error')
      return
    }

    localStorage.removeItem(DRAFT_KEY)
    showToast('Profile saved successfully.', 'success')

    if (isEditMode && result.profileId) {
      router.replace(`/profile/${result.profileId}`)
      return
    }

    setStep(4)
  }

  const onBack = () => {
    setSubmitError('')
    setStep(current => Math.max(1, current - 1))
    saveDraft()
  }

  const onSaveAndExit = () => {
    saveDraft()
    showToast('Profile draft saved.', 'success')
    router.push('/discover')
  }

  if (step === 0) {
    return <WelcomeScreen onStart={() => setStep(1)} />
  }

  if (step === 4) {
    return <CelebrationScreen name={displayName || 'friend'} userId={userId ?? defaultValues?.id} />
  }

  const stepLabels = ['YOUR ROLE', 'YOUR DETAILS', 'INTERESTS']

  return (
    <section style={{ maxWidth: 860, margin: '0 auto', padding: '48px 48px 80px' }}>
      {showDraftChoice && (
        <div style={{
          marginBottom: 24, background: '#111111',
          border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '16px 20px',
        }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14, color: '#f0f0f0' }}>
            Resume your saved draft?
          </p>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: '#9a9a9a', marginTop: 4 }}>
            We found an unfinished profile draft from a previous session.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button type="button" onClick={onUseSavedDraft} style={{
              background: '#9b7ff8', border: 'none', borderRadius: 3, padding: '10px 24px',
              fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 13, letterSpacing: '0.07em',
              color: '#080808', cursor: 'pointer',
            }}>
              CONTINUE DRAFT
            </button>
            <button type="button" onClick={onDiscardSavedDraft} style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3,
              padding: '10px 24px', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 13,
              letterSpacing: '0.07em', color: '#9a9a9a', cursor: 'pointer',
            }}>
              START FRESH
            </button>
          </div>
        </div>
      )}

      {/* Step progress */}
      <div style={{ maxWidth: 720, margin: '0 auto 56px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          {[1, 2, 3].map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : undefined }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: step >= s ? '#9b7ff8' : 'transparent',
                  border: `1px solid ${step >= s ? '#9b7ff8' : 'rgba(255,255,255,0.1)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                  color: step >= s ? '#080808' : '#9a9a9a', fontWeight: 700,
                }}>
                  {s}
                </div>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em',
                  color: step >= s ? '#9a9a9a' : '#7a7a7a',
                }}>
                  {stepLabels[i]}
                </span>
              </div>
              {i < 2 && (
                <div style={{ flex: 1, height: 1, background: step > s ? '#9b7ff8' : 'rgba(255,255,255,0.06)', margin: '0 12px' }} />
              )}
            </div>
          ))}
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', color: '#9b7ff8', marginBottom: 16 }}>
          {`0${step} / ${stepLabels[step - 1]}`}
        </div>
        <h2 style={{
          fontFamily: 'var(--font-heading)', fontWeight: 800,
          fontSize: 'clamp(32px,4vw,52px)', lineHeight: 1.05,
          color: '#f0f0f0', margin: 0, letterSpacing: '-0.02em',
        }}>
          {step === 1 && <>Who are you in the<br /><span style={{ color: '#9b7ff8' }}>creative world?</span></>}
          {step === 2 && <>Shape your<br /><span style={{ color: '#9b7ff8' }}>identity.</span></>}
          {step === 3 && <>What<br /><span style={{ color: '#9b7ff8' }}>moves you?</span></>}
        </h2>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button type="button" onClick={onSaveAndExit} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em', color: '#9a9a9a',
        }}>
          SAVE & EXIT
        </button>
      </div>

      {step === 1 && (
        <div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 40 }}>
            {(Object.keys(ROLE_TAGLINES) as ProfileRole[]).map(roleName => (
              <RoleCard
                key={roleName}
                role={roleName}
                tagline={ROLE_TAGLINES[roleName]}
                selected={role === roleName}
                onSelect={onSelectRole}
              />
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 720 }}>
          <div style={{ gridColumn: 'span 2' }}>
            <Input
              id="display_name"
              label="Display Name"
              placeholder="Your full name or alias"
              {...register('display_name', {
                required: 'Required',
                minLength: { value: 2, message: 'At least 2 characters' },
                maxLength: { value: 50, message: 'Max 50 characters' },
                validate: value => (value.trim().length >= 2 ? true : 'At least 2 characters'),
              })}
              error={errors.display_name?.message}
            />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <Textarea
              id="bio"
              label="Bio"
              placeholder="A brief statement about your practice, approach, or institution…"
              maxLength={300}
              {...register('bio', { maxLength: { value: 300, message: 'Max 300 characters' } })}
              error={errors.bio?.message}
            />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <Input
              id="website_url"
              label="Website"
              placeholder="yoursite.com"
              {...register('website_url')}
              error={errors.website_url?.message}
            />
          </div>

          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', color: '#9a9a9a', marginBottom: 10, textTransform: 'uppercase' }}>
              Geography
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {GEOGRAPHY_PRESETS.map(city => {
                const active = geography === city
                return (
                  <button key={city} type="button"
                    onClick={() => setValue('geography', city, { shouldValidate: true, shouldDirty: true })}
                    style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em',
                      padding: '6px 14px', borderRadius: 100,
                      border: `1px solid ${active ? '#9b7ff8' : 'rgba(255,255,255,0.07)'}`,
                      background: active ? 'rgba(155,127,248,0.12)' : 'transparent',
                      color: active ? '#9b7ff8' : '#9a9a9a', cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                    {city}
                  </button>
                )
              })}
              <button type="button"
                onClick={() => setValue('geography', '', { shouldValidate: true, shouldDirty: true })}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em',
                  padding: '6px 14px', borderRadius: 100,
                  border: `1px solid ${!isGeographyPreset ? '#9b7ff8' : 'rgba(255,255,255,0.07)'}`,
                  background: !isGeographyPreset ? 'rgba(155,127,248,0.12)' : 'transparent',
                  color: !isGeographyPreset ? '#9b7ff8' : '#9a9a9a', cursor: 'pointer', transition: 'all 0.15s',
                }}>
                Other
              </button>
            </div>
            {!isGeographyPreset && (
              <Input id="geography_custom" className="mt-3" placeholder="Enter city"
                value={geography}
                onChange={e => setValue('geography', e.target.value, { shouldValidate: true, shouldDirty: true })} />
            )}
            {errors.geography?.message && (
              <p style={{ color: '#f87171', fontFamily: 'var(--font-mono)', fontSize: 9, marginTop: 8 }}>{errors.geography.message}</p>
            )}
          </div>

          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', color: '#9a9a9a', marginBottom: 10, textTransform: 'uppercase' }}>
              Discipline / Focus
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {disciplinePresets.map(item => {
                const active = discipline === item
                return (
                  <button key={item} type="button"
                    onClick={() => setValue('discipline', item, { shouldValidate: true, shouldDirty: true })}
                    style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em',
                      padding: '6px 14px', borderRadius: 100,
                      border: `1px solid ${active ? '#9b7ff8' : 'rgba(255,255,255,0.07)'}`,
                      background: active ? 'rgba(155,127,248,0.12)' : 'transparent',
                      color: active ? '#9b7ff8' : '#9a9a9a', cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                    {item}
                  </button>
                )
              })}
              <button type="button"
                onClick={() => setValue('discipline', '', { shouldValidate: true, shouldDirty: true })}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em',
                  padding: '6px 14px', borderRadius: 100,
                  border: `1px solid ${!isDisciplinePreset ? '#9b7ff8' : 'rgba(255,255,255,0.07)'}`,
                  background: !isDisciplinePreset ? 'rgba(155,127,248,0.12)' : 'transparent',
                  color: !isDisciplinePreset ? '#9b7ff8' : '#9a9a9a', cursor: 'pointer', transition: 'all 0.15s',
                }}>
                Other
              </button>
            </div>
            {!isDisciplinePreset && (
              <Input id="discipline_custom" className="mt-3" placeholder="Enter discipline"
                value={discipline}
                onChange={e => setValue('discipline', e.target.value, { shouldValidate: true, shouldDirty: true })} />
            )}
            {errors.discipline?.message && (
              <p style={{ color: '#f87171', fontFamily: 'var(--font-mono)', fontSize: 9, marginTop: 8 }}>{errors.discipline.message}</p>
            )}
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="button" onClick={onBack} style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3,
              padding: '13px 32px', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 13,
              letterSpacing: '0.07em', color: '#9a9a9a', cursor: 'pointer',
            }}>
              ← BACK
            </button>
            <button type="button" onClick={onNextIdentity} style={{
              background: '#9b7ff8', border: 'none', borderRadius: 3,
              padding: '13px 32px', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 13,
              letterSpacing: '0.07em', color: '#080808', cursor: 'pointer',
            }}>
              CONTINUE →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 720 }}>
          <InterestPicker
            value={interests}
            onChange={next => setValue('interests', next, { shouldValidate: true, shouldDirty: true })}
            error={errors.interests?.message}
          />
          {submitError && (
            <p style={{ color: '#f87171', fontFamily: 'var(--font-mono)', fontSize: 9 }}>{submitError}</p>
          )}
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" onClick={onBack} style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3,
              padding: '13px 32px', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 13,
              letterSpacing: '0.07em', color: '#9a9a9a', cursor: 'pointer',
            }}>
              ← BACK
            </button>
            <button type="button" onClick={onCompleteProfile} disabled={isSubmitting} style={{
              background: isSubmitting ? 'rgba(155,127,248,0.5)' : '#9b7ff8', border: 'none', borderRadius: 3,
              padding: '13px 32px', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 13,
              letterSpacing: '0.07em', color: '#080808', cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}>
              {isSubmitting ? 'SAVING…' : 'CREATE PROFILE →'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
