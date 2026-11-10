'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, ChevronDown, LogOut, User, Settings } from 'lucide-react'

export function ContractorHeader() {
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen)
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950 shadow-lg">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Contractor portal navigation">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link
              href="/contractor"
              className="flex items-center space-x-3 transition-opacity hover:opacity-90"
              aria-label="NRPG Home"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#0047FF] to-[#00BFA6]">
                <span className="text-lg font-bold text-white">NR</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-xl font-bold text-white">NRPG</div>
                <div className="text-xs text-slate-400">National Restoration Professionals Group</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            <Link
              href="/contractor"
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              Home
            </Link>
            <Link
              href="/dashboard/contractor/opportunities"
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              Opportunities
            </Link>
            <Link
              href="/resources"
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              Resources
            </Link>
            <Link
              href="/support"
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              Help
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {session ? (
              // Authenticated User Menu
              <div className="relative hidden md:block">
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                  aria-expanded={isProfileMenuOpen}
                  aria-haspopup="true"
                >
                  <User className="h-5 w-5" />
                  <span>{session.user?.name || 'Account'}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {isProfileMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsProfileMenuOpen(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-md border border-slate-700 bg-slate-900 shadow-lg ring-1 ring-black ring-opacity-5">
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        <Link
                          href="/dashboard/contractor/profile-setup"
                          className="flex items-center px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                          role="menuitem"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <User className="mr-3 h-4 w-4" />
                          Profile
                        </Link>
                        <Link
                          href="/dashboard/settings"
                          className="flex items-center px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                          role="menuitem"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <Settings className="mr-3 h-4 w-4" />
                          Settings
                        </Link>
                        <hr className="my-1 border-slate-700" />
                        <button
                          onClick={handleSignOut}
                          className="flex w-full items-center px-4 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                          role="menuitem"
                        >
                          <LogOut className="mr-3 h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              // Unauthenticated CTAs
              <div className="hidden md:flex md:items-center md:space-x-3">
                <Link
                  href="/login"
                  className="rounded-md px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup?type=contractor"
                  className="rounded-md bg-gradient-to-r from-[#0047FF] to-[#00BFA6] px-4 py-2 text-sm font-medium text-white shadow-lg transition-[box-shadow,filter] duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] hover:shadow-xl hover:brightness-110"
                >
                  Join Network
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white md:hidden"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-slate-800 md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              <Link
                href="/contractor"
                className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                onClick={closeMobileMenu}
              >
                Home
              </Link>
              <Link
                href="/dashboard/contractor/opportunities"
                className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                onClick={closeMobileMenu}
              >
                Opportunities
              </Link>
              <Link
                href="/resources"
                className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                onClick={closeMobileMenu}
              >
                Resources
              </Link>
              <Link
                href="/support"
                className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                onClick={closeMobileMenu}
              >
                Help
              </Link>

              {session ? (
                <>
                  <hr className="my-2 border-slate-700" />
                  <Link
                    href="/dashboard/contractor/profile-setup"
                    className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                    onClick={closeMobileMenu}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                    onClick={closeMobileMenu}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      closeMobileMenu()
                      handleSignOut()
                    }}
                    className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <hr className="my-2 border-slate-700" />
                  <Link
                    href="/login"
                    className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                    onClick={closeMobileMenu}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup?type=contractor"
                    className="block rounded-md bg-gradient-to-r from-[#0047FF] to-[#00BFA6] px-3 py-2 text-base font-medium text-white shadow-lg transition-[box-shadow,filter] duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] hover:shadow-xl hover:brightness-110"
                    onClick={closeMobileMenu}
                  >
                    Join Network
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
