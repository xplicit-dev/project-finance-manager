'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  FolderKanban, 
  FileText, 
  Users, 
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Employees', href: '/employees', icon: Users },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const closeMobileMenu = () => setMobileMenuOpen(false)

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      // Close mobile menu
      setMobileMenuOpen(false)
      // Hard navigation to ensure middleware runs
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 1040,
          }}
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          position: 'fixed',
          left: mobileMenuOpen ? 0 : '-280px',
          top: 0,
          bottom: 0,
          width: '280px',
          background: 'rgba(26, 32, 53, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '2rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
          zIndex: 1050,
          transition: 'left 0.3s ease-in-out',
        }}
        className="sidebar"
      >
        {/* Logo */}
        <div style={{ padding: '0 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, var(--primary-600), var(--primary-700))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: '700',
                color: 'white',
              }}
            >
              PM
            </div>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0, color: 'var(--dark-text)' }}>
                Project Finance
              </h2>
              <p style={{ fontSize: '0.75rem', margin: 0, color: 'var(--dark-text-secondary)' }}>Manager</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={closeMobileMenu}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      textDecoration: 'none',
                      color: isActive ? 'white' : 'var(--dark-text-secondary)',
                      background: isActive ? 'linear-gradient(135deg, var(--primary-600), var(--primary-700))' : 'transparent',
                      transition: 'all 0.2s',
                      fontWeight: isActive ? '600' : '500',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'var(--dark-surface-elevated)'
                        e.currentTarget.style.color = 'var(--dark-text)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = 'var(--dark-text-secondary)'
                      }
                    }}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer - Logout */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--dark-border)' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'transparent',
              border: '1px solid var(--dark-border)',
              color: 'var(--dark-text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              width: '100%',
              fontWeight: '500',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
              e.currentTarget.style.borderColor = '#ef4444'
              e.currentTarget.style.color = '#ef4444'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'var(--dark-border)'
              e.currentTarget.style.color = 'var(--dark-text-secondary)'
            }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Desktop styles */}
      <style jsx>{`
        @media (min-width: 1024px) {
          .sidebar {
            left: 0 !important;
          }
        }
      `}</style>
    </>
  )
}
