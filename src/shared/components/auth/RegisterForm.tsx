'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, Camera, Home, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api/auth.api'
import { useAuthStore } from '@/store/auth.store'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['GUEST', 'HOST']),
})

type RegisterValues = z.infer<typeof registerSchema>

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { setAuth } = useAuthStore()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'GUEST' },
  })

  const selectedRole = watch('role')

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    const url = URL.createObjectURL(file)
    setAvatarPreview(url)
  }

  const onSubmit = async (data: RegisterValues) => {
    try {
      setServerError('')
      const { user, token } = await authApi.register({
        ...data,
        image: avatarFile ?? undefined,
      })
      setAuth(user, token)
      router.push('/')
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <div className="w-full animate-fadeInUp">
      <h1 className="text-[26px] font-bold text-[#222] mb-1">Create your account</h1>
      <p className="text-gray-500 text-sm mb-7">Join airyty and explore the world</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Avatar upload */}
        <div className="flex justify-center mb-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-[#ddd] hover:border-[#ff385c] transition-colors group"
          >
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-1">
                <Camera className="w-5 h-5 text-gray-400 group-hover:text-[#ff385c] transition-colors" />
                <span className="text-[10px] text-gray-400 group-hover:text-[#ff385c] transition-colors">
                  Photo
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/webp,image/avif"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        {/* Role selector */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
            I want to
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(['GUEST', 'HOST'] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setValue('role', role, { shouldValidate: true })}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedRole === role
                    ? 'border-[#222] bg-gray-50'
                    : 'border-[#e0e0e0] hover:border-[#b0b0b0]'
                }`}
              >
                {role === 'GUEST' ? (
                  <User
                    className={`w-5 h-5 mb-1.5 transition-colors ${selectedRole === 'GUEST' ? 'text-[#ff385c]' : 'text-gray-400'}`}
                  />
                ) : (
                  <Home
                    className={`w-5 h-5 mb-1.5 transition-colors ${selectedRole === 'HOST' ? 'text-[#ff385c]' : 'text-gray-400'}`}
                  />
                )}
                <p
                  className={`text-sm font-semibold ${selectedRole === role ? 'text-[#222]' : 'text-gray-500'}`}
                >
                  {role === 'GUEST' ? 'Explore & book' : 'List my space'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {role === 'GUEST' ? 'Find places to stay' : 'Become a host'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <div
            className={`relative border rounded-xl overflow-hidden transition-colors ${
              errors.name ? 'border-red-400' : 'border-[#b0b0b0] focus-within:border-[#222]'
            }`}
          >
            <input
              {...register('name')}
              id="name"
              type="text"
              placeholder=" "
              autoComplete="name"
              className="peer w-full px-4 pt-6 pb-2 text-sm text-[#222] bg-transparent outline-none"
            />
            <label
              htmlFor="name"
              className="absolute left-4 top-2 text-[11px] text-gray-500 peer-placeholder-shown:top-[50%] peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[11px] transition-all pointer-events-none"
            >
              Full name
            </label>
          </div>
          {errors.name && (
            <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <div
            className={`relative border rounded-xl overflow-hidden transition-colors ${
              errors.email ? 'border-red-400' : 'border-[#b0b0b0] focus-within:border-[#222]'
            }`}
          >
            <input
              {...register('email')}
              id="reg-email"
              type="email"
              placeholder=" "
              autoComplete="email"
              className="peer w-full px-4 pt-6 pb-2 text-sm text-[#222] bg-transparent outline-none"
            />
            <label
              htmlFor="reg-email"
              className="absolute left-4 top-2 text-[11px] text-gray-500 peer-placeholder-shown:top-[50%] peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[11px] transition-all pointer-events-none"
            >
              Email address
            </label>
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div
            className={`relative border rounded-xl overflow-hidden transition-colors ${
              errors.password ? 'border-red-400' : 'border-[#b0b0b0] focus-within:border-[#222]'
            }`}
          >
            <input
              {...register('password')}
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              placeholder=" "
              autoComplete="new-password"
              className="peer w-full px-4 pt-6 pb-2 pr-12 text-sm text-[#222] bg-transparent outline-none"
            />
            <label
              htmlFor="reg-password"
              className="absolute left-4 top-2 text-[11px] text-gray-500 peer-placeholder-shown:top-[50%] peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[11px] transition-all pointer-events-none"
            >
              Password (min. 8 characters)
            </label>
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.password.message}</p>
          )}
        </div>

        {/* Server error */}
        {serverError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-red-600 text-sm">{serverError}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#ff385c] to-[#e31c5f] hover:from-[#e31c5f] hover:to-[#c10d4a] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-red-200"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-[#e0e0e0]" />
        <span className="text-sm text-gray-400 font-medium">or</span>
        <div className="flex-1 h-px bg-[#e0e0e0]" />
      </div>

      {/* Login link */}
      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-[#ff385c] font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
