'use client'

import { useState, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { authApi } from '@/lib/api/auth.api'
import { useAuthStore } from '@/store/auth.store'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginValues = z.infer<typeof loginSchema>

function LoginFormInner() {
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const { setAuth } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginValues) => {
    try {
      setServerError('')
      const { user, token } = await authApi.login(data)
      setAuth(user, token)
      router.push(redirect)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <div className="w-full animate-fadeInUp">
      <h1 className="text-[26px] font-bold text-[#222] mb-1">Welcome back</h1>
      <p className="text-gray-500 text-sm mb-7">Sign in to your airyty account</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email */}
        <div>
          <div
            className={`relative border rounded-xl overflow-hidden transition-colors ${
              errors.email ? 'border-red-400' : 'border-[#b0b0b0] focus-within:border-[#222]'
            }`}
          >
            <input
              {...register('email')}
              id="email"
              type="email"
              placeholder=" "
              autoComplete="email"
              className="peer w-full px-4 pt-6 pb-2 text-sm text-[#222] bg-transparent outline-none"
            />
            <label
              htmlFor="email"
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
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder=" "
              autoComplete="current-password"
              className="peer w-full px-4 pt-6 pb-2 pr-12 text-sm text-[#222] bg-transparent outline-none"
            />
            <label
              htmlFor="password"
              className="absolute left-4 top-2 text-[11px] text-gray-500 peer-placeholder-shown:top-[50%] peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[11px] transition-all pointer-events-none"
            >
              Password
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
              Signing in...
            </>
          ) : (
            'Continue'
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-[#e0e0e0]" />
        <span className="text-sm text-gray-400 font-medium">or</span>
        <div className="flex-1 h-px bg-[#e0e0e0]" />
      </div>

      {/* Register link */}
      <p className="text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link href="/auth/register" className="text-[#ff385c] font-semibold hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}

export function LoginForm() {
  return (
    <Suspense>
      <LoginFormInner />
    </Suspense>
  )
}
