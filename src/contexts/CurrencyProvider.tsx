'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { formatCurrency as formatCurrencyUtil } from '@/lib/currency'

interface CurrencyContextType {
  currency: string
  formatCurrency: (amount: number) => string
  updateCurrency: (newCurrency: string) => Promise<void>
  loading: boolean
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<string>('USD')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      setCurrency(data.currency || 'USD')
    } catch (error) {
      console.error('Error fetching settings:', error)
      setCurrency('USD')
    } finally {
      setLoading(false)
    }
  }

  const updateCurrency = async (newCurrency: string) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: newCurrency }),
      })
      
      if (res.ok) {
        const data = await res.json()
        setCurrency(data.currency)
      }
    } catch (error) {
      console.error('Error updating currency:', error)
      throw error
    }
  }

  const formatCurrency = (amount: number) => {
    return formatCurrencyUtil(amount, currency)
  }

  return (
    <CurrencyContext.Provider value={{ currency, formatCurrency, updateCurrency, loading }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
