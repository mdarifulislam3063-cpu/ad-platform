'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, LogOut, User, Shield, Home, PlayCircle, LayoutDashboard } from 'lucide-react'

export default function Navbar() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/watch', label: 'Watch Ads', icon: PlayCircle },
    ...(session ? [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
  ]

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-secondary-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              AdPlatform
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center space-x-1 text-secondary-700 hover:text-primary-600 transition-colors font-medium"
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            ))}

            {session ? (
              <>
                {session.user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="flex items-center space-x-1 text-secondary-700 hover:text-primary-600 transition-colors font-medium"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-1 text-secondary-700 hover:text-red-600 transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-secondary-700 hover:text-primary-600 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-secondary-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-secondary-200">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center space-x-2 text-secondary-700 hover:text-primary-600 transition-colors px-2 py-1"
                  onClick={() => setIsOpen(false)}
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              ))}
              {session ? (
                <>
                  {session.user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="flex items-center space-x-2 text-secondary-700 hover:text-primary-600 transition-colors px-2 py-1"
                      onClick={() => setIsOpen(false)}
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      signOut()
                      setIsOpen(false)
                    }}
                    className="flex items-center space-x-2 text-secondary-700 hover:text-red-600 transition-colors px-2 py-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-secondary-700 hover:text-primary-600 transition-colors px-2 py-1"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="btn-primary inline-block text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}