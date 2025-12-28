'use client'

import { useState } from 'react'
import { Settings as SettingsIcon, Save, Download, Upload } from 'lucide-react'
import { useCurrency } from '@/contexts/CurrencyProvider'
import { CURRENCY_OPTIONS } from '@/lib/currency'

export default function SettingsPage() {
  const { currency, updateCurrency } = useCurrency()
  const [selectedCurrency, setSelectedCurrency] = useState(currency)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showDestroyModal, setShowDestroyModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [destroying, setDestroying] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [changingPassword, setChangingPassword] = useState(false)
  const [importing, setImporting] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      await updateCurrency(selectedCurrency)
      setMessage({ type: 'success', text: 'Settings saved successfully!' })
      
      // Reload the page to update all currency displays
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleExport = () => {
    window.location.href = '/api/db/export'
    setMessage({ type: 'success', text: 'Database exported successfully!' })
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setMessage(null)

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      const res = await fetch('/api/db/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: 'Database imported successfully! Reloading...' })
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to import database' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Invalid import file. Please check the file format.' })
    } finally {
      setImporting(false)
      // Reset file input
      e.target.value = ''
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    setChangingPassword(true)
    setMessage(null)

    try {
      const res = await fetch('/api/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: 'Password changed successfully!' })
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to change password' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password. Please try again.' })
    } finally {
      setChangingPassword(false)
    }
  }

  const handleDestroyAll = () => {
    setShowDestroyModal(true)
    setConfirmText('')
  }

  const handleConfirmDestroy = async () => {
    if (confirmText !== 'DELETE EVERYTHING') return

    setDestroying(true)
    try {
      const res = await fetch('/api/destroy', {
        method: 'DELETE',
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'All data has been destroyed. Reloading...' })
        setTimeout(() => {
          window.location.href = '/'
        }, 1500)
      } else {
        setMessage({ type: 'error', text: 'Failed to destroy data. Please try again.' })
        setDestroying(false)
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to destroy data. Please try again.' })
      setDestroying(false)
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <SettingsIcon size={32} color="var(--primary-500)" />
          <h1 style={{ margin: 0 }}>Settings</h1>
        </div>
        <p style={{ color: 'var(--dark-text-secondary)' }}>
          Configure your application preferences
        </p>
      </div>

      {/* Settings Form */}
      <div className="glass-card" style={{ padding: '2rem', maxWidth: '600px' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Currency Settings</h2>

        <div style={{ marginBottom: '1.5rem' }}>
          <label className="label">Currency</label>
          <select
            className="select"
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            style={{ width: '100%' }}
          >
            {CURRENCY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p style={{ fontSize: '0.875rem', color: 'var(--dark-text-secondary)', marginTop: '0.5rem' }}>
            Select the currency to use throughout the application. All amounts will be displayed in the selected currency.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`,
              color: message.type === 'success' ? '#10b981' : '#ef4444',
            }}
          >
            {message.text}
          </div>
        )}

        {/* Save Button */}
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving || selectedCurrency === currency}
          style={{ width: '100%' }}
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>

        {selectedCurrency !== currency && (
          <p style={{ fontSize: '0.875rem', color: 'var(--dark-text-secondary)', marginTop: '1rem', textAlign: 'center' }}>
            You have unsaved changes
          </p>
        )}
      </div>

      {/* Preview */}
      <div className="glass-card" style={{ padding: '2rem', maxWidth: '600px', marginTop: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Preview</h3>
        <p style={{ color: 'var(--dark-text-secondary)', marginBottom: '1rem' }}>
          See how amounts will be displayed with the selected currency:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1000, 50000, 123456.78].map((amount) => {
            const formatted = new Intl.NumberFormat(
              selectedCurrency === 'INR' ? 'en-IN' : selectedCurrency === 'EUR' ? 'de-DE' : selectedCurrency === 'GBP' ? 'en-GB' : 'en-US',
              { style: 'currency', currency: selectedCurrency }
            ).format(amount)
            return (
              <div
                key={amount}
                style={{
                  padding: '0.75rem',
                  background: 'var(--dark-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--dark-border)',
                  fontFamily: 'monospace',
                  fontSize: '1.125rem',
                }}
              >
                {formatted}
              </div>
            )
          })}
        </div>
      </div>

      {/* Password Change */}
      <div className="glass-card" style={{ padding: '2rem', maxWidth: '600px', marginTop: '1.5rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Change Password</h2>

        <div style={{ marginBottom: '1.5rem' }}>
          <label className="label">Current Password</label>
          <input
            type="password"
            className="input"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            placeholder="Enter current password"
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label className="label">New Password</label>
          <input
            type="password"
            className="input"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            placeholder="Enter new password (min 6 characters)"
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label className="label">Confirm New Password</label>
          <input
            type="password"
            className="input"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            placeholder="Confirm new password"
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleChangePassword}
          disabled={changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
          style={{ width: '100%' }}
        >
          {changingPassword ? 'Changing Password...' : 'Change Password'}
        </button>
      </div>

      {/* Database Backup */}
      <div className="glass-card" style={{ padding: '2rem', maxWidth: '600px', marginTop: '1.5rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Database Backup</h2>
        <p style={{ color: 'var(--dark-text-secondary)', marginBottom: '1.5rem' }}>
          Export your database to create a backup, or import a previously exported backup to restore your data.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={handleExport}
            style={{ flex: 1, minWidth: '200px' }}
          >
            <Download size={18} />
            Export Database
          </button>

          <label
            className="btn btn-primary"
            style={{ flex: 1, minWidth: '200px', cursor: 'pointer' }}
          >
            <Upload size={18} />
            {importing ? 'Importing...' : 'Import Database'}
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={importing}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--dark-text-secondary)', marginTop: '1rem' }}>
          <strong>Note:</strong> Importing will replace all existing data except your password. Make sure to export a backup before importing.
        </p>
      </div>

      {/* Danger Zone */}
      <div className="glass-card" style={{ padding: '2rem', maxWidth: '600px', marginTop: '1.5rem', border: '1px solid #ef4444' }}>
        <h3 style={{ marginBottom: '1rem', color: '#ef4444' }}>Danger Zone</h3>
        <p style={{ color: 'var(--dark-text-secondary)', marginBottom: '1rem' }}>
          Permanently delete all data from the database. This action cannot be undone.
        </p>
        <button
          className="btn"
          onClick={handleDestroyAll}
          style={{ 
            width: '100%', 
            background: '#ef4444', 
            color: 'white',
            border: '1px solid #dc2626'
          }}
        >
          Destroy All Data
        </button>
      </div>

      {/* Destroy Confirmation Modal */}
      {showDestroyModal && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(4px)',
              zIndex: 1040,
            }}
            onClick={() => setShowDestroyModal(false)}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              maxWidth: '500px',
              zIndex: 1050,
            }}
          >
            <div className="glass-card" style={{ padding: '2rem', border: '2px solid #ef4444' }}>
              <h2 style={{ marginBottom: '1rem', color: '#ef4444' }}>⚠️ WARNING: Destroy All Data</h2>
              <p style={{ marginBottom: '1rem', color: 'var(--dark-text)' }}>
                This will <strong>permanently delete ALL data</strong> from the database including:
              </p>
              <ul style={{ marginBottom: '1.5rem', color: 'var(--dark-text-secondary)', paddingLeft: '1.5rem' }}>
                <li>All projects</li>
                <li>All invoices and payments</li>
                <li>All employees and payouts</li>
                <li>All notes</li>
                <li>All settings</li>
              </ul>
              <p style={{ marginBottom: '1.5rem', color: '#ef4444', fontWeight: '600' }}>
                This action CANNOT be undone. Are you absolutely sure?
              </p>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label">Type "DELETE EVERYTHING" to confirm:</label>
                <input
                  type="text"
                  className="input"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE EVERYTHING"
                  style={{ borderColor: '#ef4444' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowDestroyModal(false)
                    setConfirmText('')
                  }}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={handleConfirmDestroy}
                  disabled={confirmText !== 'DELETE EVERYTHING' || destroying}
                  style={{ 
                    flex: 1, 
                    background: confirmText === 'DELETE EVERYTHING' ? '#ef4444' : '#6b7280', 
                    color: 'white',
                    cursor: confirmText === 'DELETE EVERYTHING' ? 'pointer' : 'not-allowed'
                  }}
                >
                  {destroying ? 'Destroying...' : 'Destroy All Data'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
