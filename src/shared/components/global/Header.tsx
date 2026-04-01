'use client'

import { useState, useEffect, useRef } from 'react'
import { Menu, User, Heart as HeartIcon, Globe, LogOut, CalendarDays, Home, Settings } from 'lucide-react'
import { Button } from '../ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
    router.push('/')
  }

  const isAuth = mounted && isAuthenticated

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-2xl font-black bg-gradient-to-r from-[#ff385c] to-pink-500 bg-clip-text text-transparent hover:scale-110 inline-block transition-transform duration-300"
            >
              airyty
            </Link>
          </div>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Button variant="ghost" size="sm" className="text-gray-700 hover:text-[#ff385c] font-medium" asChild>
              <Link href="/">Stays</Link>
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-700 hover:text-[#ff385c] font-medium">
              Experiences
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-700 hover:text-[#ff385c] font-medium">
              Online Experiences
            </Button>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Become a Host — only if GUEST or not logged in */}
            {(!isAuth || user?.role === 'GUEST') && (
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex text-gray-700 font-semibold hover:text-[#ff385c]"
                asChild
              >
                <Link href={isAuth ? '/account' : '/auth/login'}>Become a Host</Link>
              </Button>
            )}

            <Button variant="ghost" size="icon" className="hover:scale-105">
              <Globe className="w-5 h-5 text-gray-700" />
            </Button>

            {isAuth && (
              <Button variant="ghost" size="icon" className="hidden sm:flex hover:scale-105" asChild>
                <Link href="/bookings">
                  <HeartIcon className="w-5 h-5 text-gray-700" />
                </Link>
              </Button>
            )}

            {/* Profile menu */}
            <div className="relative" ref={menuRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border-[#ddd] hover:shadow-md transition-shadow"
              >
                <Menu className="w-4 h-4 text-gray-600" />
                {/* Avatar or generic icon */}
                {isAuth && user?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 bg-gradient-to-r from-[#ff385c] to-pink-500 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                )}
              </Button>

              {/* Dropdown */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fadeIn z-50">
                  {isAuth ? (
                    <>
                      {/* User info */}
                      <div className="px-5 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-[#222] truncate">{user?.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                      </div>

                      {/* Actions */}
                      <div className="py-1">
                        <Link
                          href="/bookings/my-bookings"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <CalendarDays className="w-4 h-4 text-gray-400" />
                          My Bookings
                        </Link>

                        {user?.role === 'HOST' && (
                          <Link
                            href="/host/listings"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Home className="w-4 h-4 text-gray-400" />
                            My Listings
                          </Link>
                        )}

                        <Link
                          href="/account"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-gray-400" />
                          Account
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 py-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 text-gray-400" />
                          Log out
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="py-1">
                        <Link
                          href="/auth/register"
                          onClick={() => setIsMenuOpen(false)}
                          className="block px-5 py-3 text-sm font-semibold text-[#222] hover:bg-gray-50 transition-colors"
                        >
                          Sign up
                        </Link>
                        <Link
                          href="/auth/login"
                          onClick={() => setIsMenuOpen(false)}
                          className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Sign in
                        </Link>
                      </div>
                      <div className="border-t border-gray-100 py-1">
                        <Link
                          href="/help"
                          onClick={() => setIsMenuOpen(false)}
                          className="block px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          Help
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
