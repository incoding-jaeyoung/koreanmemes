'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { 
  Globe, 
  Menu, 
  X, 
  Plus, 
  LogIn,
  LogOut,
  User
} from 'lucide-react'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    setIsMenuOpen(false)
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Globe className="h-8 w-8 text-blue-600" />
            <div className="flex flex-col">
              <span className="font-bold text-xl text-gray-900">Korean Memes</span>
              <span className="text-xs text-gray-500">Korean to Global</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {/* <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link href="/category/humor" className="text-gray-700 hover:text-blue-600 transition-colors">
              K-Humor
            </Link>
            <Link href="/category/culture" className="text-gray-700 hover:text-blue-600 transition-colors">
              K-Culture
            </Link>
            <Link href="/category/drama" className="text-gray-700 hover:text-blue-600 transition-colors">
              K-Drama
            </Link>
            <Link href="/category/tech" className="text-gray-700 hover:text-blue-600 transition-colors">
              K-Tech
            </Link>
          </nav> */}

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link 
                  href="/write" 
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Write</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="flex text-sm items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                Home
              </Link>
              <Link href="/category/humor" className="text-gray-700 hover:text-blue-600 transition-colors">
                K-Humor
              </Link>
              <Link href="/category/culture" className="text-gray-700 hover:text-blue-600 transition-colors">
                K-Culture
              </Link>
              <Link href="/category/drama" className="text-gray-700 hover:text-blue-600 transition-colors">
                K-Drama
              </Link>
              <Link href="/category/tech" className="text-gray-700 hover:text-blue-600 transition-colors">
                K-Tech
              </Link>
              <div className="pt-4 border-t">
                {isAuthenticated ? (
                  <>
                    <Link 
                      href="/write" 
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-fit mb-3"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Write</span>
                    </Link>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                      <User className="h-4 w-4" />
                      <span>관리자로 로그인됨</span>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <Link 
                    href="/login" 
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
} 