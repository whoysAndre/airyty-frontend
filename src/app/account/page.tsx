'use client'

import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera, Loader2, CheckCircle2, ArrowLeft, Shield, User, Home } from 'lucide-react'
import Link from 'next/link'
import { usersApi } from '@/lib/api/users.api'
import { useAuthStore } from '@/store/auth.store'

// ─── Schemas ────────────────────────────────────────────────────────────────
const profileSchema = z.object({
  name: z.string().min(2, 'At least 2 characters'),
})
const passwordSchema = z.object({
  password:        z.string().min(1, 'Required'),
  confirmPassword: z.string().min(1, 'Required'),
  newPassword:     z.string().min(8, 'At least 8 characters'),
})

type ProfileForm   = z.infer<typeof profileSchema>
type PasswordForm  = z.infer<typeof passwordSchema>

// ─── Floating input ──────────────────────────────────────────────────────────
function FloatingInput({
  label, id, type = 'text', error, ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; id: string; error?: string }) {
  return (
    <div>
      <div className={`relative border rounded-xl overflow-hidden transition-colors ${error ? 'border-red-400' : 'border-[#b0b0b0] focus-within:border-[#222]'}`}>
        <input id={id} type={type} placeholder=" " className="peer w-full px-4 pt-6 pb-2 text-sm text-[#222] bg-transparent outline-none" {...props} />
        <label htmlFor={id} className="absolute left-4 top-2 text-[11px] text-gray-500 peer-placeholder-shown:top-[50%] peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[11px] transition-all pointer-events-none">
          {label}
        </label>
      </div>
      {error && <p className="text-red-500 text-xs mt-1.5 ml-1">{error}</p>}
    </div>
  )
}

// ─── Success toast ───────────────────────────────────────────────────────────
function Toast({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm animate-fadeIn">
      <CheckCircle2 className="w-4 h-4 shrink-0" />
      {msg}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function AccountPage() {
  const [tab, setTab] = useState<'profile' | 'security' | 'role'>('profile')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [profileMsg, setProfileMsg]   = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [roleMsg, setRoleMsg]         = useState('')
  const [profileErr, setProfileErr]   = useState('')
  const [passwordErr, setPasswordErr] = useState('')
  const [promotingRole, setPromotingRole] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const { user, token, setAuth } = useAuthStore()

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '' },
  })
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) })

  useEffect(() => {
    profileForm.reset({ name: user?.name ?? '' })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.name])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const onProfileSubmit = async (data: ProfileForm) => {
    setProfileErr('')
    setProfileMsg('')
    try {
      const res = await usersApi.updateProfile({ name: data.name, image: avatarFile ?? undefined }, token!)
      setAuth(res.user, token!)
      setAvatarFile(null)
      setProfileMsg('Profile updated successfully')
    } catch (err) {
      setProfileErr(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const onPasswordSubmit = async (data: PasswordForm) => {
    setPasswordErr('')
    setPasswordMsg('')
    try {
      await usersApi.changePassword(data, token!)
      passwordForm.reset()
      setPasswordMsg('Password changed successfully')
    } catch (err) {
      setPasswordErr(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const handleBecomeHost = async () => {
    setPromotingRole(true)
    try {
      await usersApi.changeRole(token!)
      setAuth({ ...user!, role: 'HOST' }, token!)
      setRoleMsg("You're now a host! Start listing your property.")
    } catch (err) {
      setRoleMsg(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setPromotingRole(false)
    }
  }

  const avatarSrc = avatarPreview ?? user?.avatarUrl

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#222] hover:underline mb-6 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Home
      </Link>

      <h1 className="text-2xl font-bold text-[#222] mb-1">Account</h1>
      <p className="text-gray-500 text-sm mb-8">Manage your airyty account</p>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-8 w-fit">
        {([
          { key: 'profile',  icon: User,   label: 'Profile'  },
          { key: 'security', icon: Shield, label: 'Security' },
          { key: 'role',     icon: Home,   label: 'Role'     },
        ] as const).map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key ? 'bg-white text-[#222] shadow-sm' : 'text-gray-500 hover:text-[#222]'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <div className="animate-fadeIn">
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5" noValidate>
            {/* Avatar */}
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-[#ddd] hover:border-[#ff385c] transition-colors group shrink-0"
              >
                {avatarSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-rose-100 to-pink-200 flex items-center justify-center text-2xl font-bold text-[#ff385c]">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/jpg,image/webp,image/avif" onChange={handleAvatarChange} className="hidden" />
              <div>
                <p className="font-semibold text-[#222]">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <p className="text-xs text-gray-400 mt-0.5 capitalize">{user?.role?.toLowerCase()}</p>
              </div>
            </div>

            <FloatingInput
              label="Full name"
              id="name"
              error={profileForm.formState.errors.name?.message}
              {...profileForm.register('name')}
            />

            {profileMsg && <Toast msg={profileMsg} />}
            {profileErr && <p className="text-red-500 text-sm">{profileErr}</p>}

            <button
              type="submit"
              disabled={profileForm.formState.isSubmitting}
              className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#ff385c] to-[#e31c5f] hover:from-[#e31c5f] hover:to-[#c10d4a] transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-red-200"
            >
              {profileForm.formState.isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save changes'}
            </button>
          </form>
        </div>
      )}

      {/* Security tab */}
      {tab === 'security' && (
        <div className="animate-fadeIn">
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4" noValidate>
            <FloatingInput label="Current password" id="current-pw" type="password" error={passwordForm.formState.errors.password?.message} {...passwordForm.register('password')} />
            <FloatingInput label="Confirm current password" id="confirm-pw" type="password" error={passwordForm.formState.errors.confirmPassword?.message} {...passwordForm.register('confirmPassword')} />
            <FloatingInput label="New password (min. 8 characters)" id="new-pw" type="password" error={passwordForm.formState.errors.newPassword?.message} {...passwordForm.register('newPassword')} />

            {passwordMsg && <Toast msg={passwordMsg} />}
            {passwordErr && <p className="text-red-500 text-sm">{passwordErr}</p>}

            <button
              type="submit"
              disabled={passwordForm.formState.isSubmitting}
              className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#ff385c] to-[#e31c5f] hover:from-[#e31c5f] hover:to-[#c10d4a] transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-red-200"
            >
              {passwordForm.formState.isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : 'Change password'}
            </button>
          </form>
        </div>
      )}

      {/* Role tab */}
      {tab === 'role' && (
        <div className="animate-fadeIn space-y-6">
          <div className={`p-5 rounded-2xl border-2 ${user?.role === 'HOST' ? 'border-green-200 bg-green-50' : 'border-[#e0e0e0]'}`}>
            <p className="font-semibold text-[#222] mb-0.5">Current role</p>
            <p className="text-2xl font-bold text-[#ff385c] capitalize">{user?.role?.toLowerCase()}</p>
          </div>

          {user?.role === 'GUEST' && (
            <div className="p-5 rounded-2xl border border-[#e0e0e0] space-y-4">
              <div>
                <h3 className="font-semibold text-[#222] mb-1 flex items-center gap-2">
                  <Home className="w-5 h-5 text-[#ff385c]" />
                  Become a Host
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  List your property and start earning. Once promoted to Host you can create listings, manage reservations, and accept payments.
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-700">
                ⚠ This action is permanent — you cannot revert to Guest via the app.
              </div>

              {roleMsg && <Toast msg={roleMsg} />}

              <button
                onClick={handleBecomeHost}
                disabled={promotingRole}
                className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#ff385c] to-[#e31c5f] hover:from-[#e31c5f] hover:to-[#c10d4a] transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-red-200"
              >
                {promotingRole ? <><Loader2 className="w-4 h-4 animate-spin" /> Promoting...</> : 'Become a Host'}
              </button>
            </div>
          )}

          {user?.role === 'HOST' && (
            <div className="p-5 rounded-2xl border border-green-200 bg-green-50">
              <p className="text-sm text-green-700 font-medium">
                ✓ You are a Host. You can create listings and manage bookings from the{' '}
                <Link href="/host/listings" className="underline font-semibold">Host Dashboard</Link>.
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
