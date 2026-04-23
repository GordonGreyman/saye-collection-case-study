'use client'

import { startTransition, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
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
}

export function BuildProfileWizard({ defaultValues }: BuildProfileWizardProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const isEditMode = Boolean(defaultValues)

  const initialValues = useMemo<ProfileFormData>(
    () => ({
      role: defaultValues?.role ?? 'Artist',
      display_name: defaultValues?.display_name ?? '',
      bio: defaultValues?.bio ?? '',
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
    setStep(4)
  }

  const onBack = () => {
    setSubmitError('')
    setStep(current => Math.max(1, current - 1))
    saveDraft()
  }

  const onSaveAndExit = () => {
    saveDraft()
    router.push('/discover')
  }

  if (step === 0) {
    return <WelcomeScreen onStart={() => setStep(1)} />
  }

  if (step === 4) {
    return <CelebrationScreen name={displayName || 'friend'} />
  }

  return (
    <section className="max-w-3xl mx-auto">
      {showDraftChoice && (
        <div className="mb-6 bg-surface border border-white/10 rounded-xl p-4">
          <p className="text-text-primary font-medium">Resume your saved draft?</p>
          <p className="text-text-muted text-sm mt-1">
            We found an unfinished profile draft from a previous session.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Button type="button" onClick={onUseSavedDraft}>
              Continue Draft
            </Button>
            <Button type="button" variant="ghost" onClick={onDiscardSavedDraft}>
              Start Fresh
            </Button>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-text-muted">
          <span>Step {step}/3</span>
          <div className="flex items-center gap-4">
            <span>{step === 1 ? 'Role' : step === 2 ? 'Identity' : 'Interests'}</span>
            <button
              type="button"
              onClick={onSaveAndExit}
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              Save & Exit
            </button>
          </div>
        </div>
        <div className="h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-accent transition-all" style={{ width: `${(step / 3) * 100}%` }} />
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <p className="text-text-muted">Your role shapes how others find you.</p>
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
      )}

      {step === 2 && (
        <div className="space-y-6">
          <p className="text-text-muted">Tell the community who you are.</p>
          <Input
            id="display_name"
            label="Display Name"
            placeholder="Your name"
            {...register('display_name', {
              required: 'Required',
              minLength: { value: 2, message: 'At least 2 characters' },
              maxLength: { value: 50, message: 'Max 50 characters' },
              validate: value => (value.trim().length >= 2 ? true : 'At least 2 characters'),
            })}
            error={errors.display_name?.message}
          />
          <Textarea
            id="bio"
            label="Bio"
            placeholder="Tell us about your work"
            maxLength={300}
            {...register('bio', {
              maxLength: { value: 300, message: 'Max 300 characters' },
            })}
            error={errors.bio?.message}
          />

          <div>
            <p className="text-sm text-text-muted mb-2">Geography</p>
            <div className="flex flex-wrap gap-2">
              {GEOGRAPHY_PRESETS.map(city => (
                <button
                  key={city}
                  type="button"
                  onClick={() =>
                    setValue('geography', city, { shouldValidate: true, shouldDirty: true })
                  }
                  className={`px-3 py-1.5 rounded-full text-sm border transition ${
                    geography === city
                      ? 'bg-accent text-white border-accent'
                      : 'bg-white/5 border-white/10 text-text-muted hover:border-accent'
                  }`}
                >
                  {city}
                </button>
              ))}
              <button
                type="button"
                onClick={() =>
                  setValue('geography', '', { shouldValidate: true, shouldDirty: true })
                }
                className={`px-3 py-1.5 rounded-full text-sm border transition ${
                  !isGeographyPreset
                    ? 'bg-accent text-white border-accent'
                    : 'bg-white/5 border-white/10 text-text-muted hover:border-accent'
                }`}
              >
                Other
              </button>
            </div>
            {!isGeographyPreset && (
              <Input
                id="geography_custom"
                className="mt-3"
                placeholder="Enter city"
                value={geography}
                onChange={e =>
                  setValue('geography', e.target.value, { shouldValidate: true, shouldDirty: true })
                }
              />
            )}
            {errors.geography?.message && (
              <p className="text-red-400 text-xs mt-2">{errors.geography.message}</p>
            )}
          </div>

          <div>
            <p className="text-sm text-text-muted mb-2">Discipline</p>
            <div className="flex flex-wrap gap-2">
              {disciplinePresets.map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setValue('discipline', item, { shouldValidate: true, shouldDirty: true })
                  }
                  className={`px-3 py-1.5 rounded-full text-sm border transition ${
                    discipline === item
                      ? 'bg-accent text-white border-accent'
                      : 'bg-white/5 border-white/10 text-text-muted hover:border-accent'
                  }`}
                >
                  {item}
                </button>
              ))}
              <button
                type="button"
                onClick={() =>
                  setValue('discipline', '', { shouldValidate: true, shouldDirty: true })
                }
                className={`px-3 py-1.5 rounded-full text-sm border transition ${
                  !isDisciplinePreset
                    ? 'bg-accent text-white border-accent'
                    : 'bg-white/5 border-white/10 text-text-muted hover:border-accent'
                }`}
              >
                Other
              </button>
            </div>
            {!isDisciplinePreset && (
              <Input
                id="discipline_custom"
                className="mt-3"
                placeholder="Enter discipline"
                value={discipline}
                onChange={e =>
                  setValue('discipline', e.target.value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              />
            )}
            {errors.discipline?.message && (
              <p className="text-red-400 text-xs mt-2">{errors.discipline.message}</p>
            )}
          </div>

          <div className="flex justify-between">
            <Button type="button" variant="ghost" onClick={onBack}>
              Back
            </Button>
            <Button type="button" onClick={onNextIdentity}>
              Next
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <p className="text-text-muted">What moves you?</p>
          <InterestPicker
            value={interests}
            onChange={next => setValue('interests', next, { shouldValidate: true, shouldDirty: true })}
            error={errors.interests?.message}
          />
          {submitError && <p className="text-red-400 text-sm">{submitError}</p>}
          <div className="flex justify-between">
            <Button type="button" variant="ghost" onClick={onBack}>
              Back
            </Button>
            <Button type="button" onClick={onCompleteProfile} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Complete Profile'}
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
