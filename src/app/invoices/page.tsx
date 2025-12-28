'use client'

import { useEffect, useState } from 'react'
import { FileText, Search } from 'lucide-react'
import { useCurrency } from '@/contexts/CurrencyProvider'

export default function InvoicesPage() {
  const { formatCurrency } = useCurrency()
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices')
      const data = await res.json()
      setInvoices(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching invoices:', error)
      setLoading(false)
    }
  }


  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      draft: 'badge-info',
      sent: 'badge-warning',
      paid: 'badge-success',
      overdue: 'badge-error',
    }
    return badges[status] || 'badge-info'
  }

  const filteredInvoices = statusFilter === 'all' ? invoices : invoices.filter((i) => i.status === statusFilter)

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div className="animate-pulse" style={{ fontSize: '1.25rem', color: 'var(--dark-text-secondary)' }}>
          Loading invoices...
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Invoices</h1>
        <p style={{ color: 'var(--dark-text-secondary)' }}>Track all client invoices and payments</p>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '200px' }}>
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <FileText size={48} color="var(--dark-text-secondary)" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--dark-text-secondary)', fontSize: '1.125rem' }}>No invoices found</p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--dark-border)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--dark-text-secondary)', fontSize: '0.875rem', fontWeight: '600' }}>Invoice #</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--dark-text-secondary)', fontSize: '0.875rem', fontWeight: '600' }}>Project</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--dark-text-secondary)', fontSize: '0.875rem', fontWeight: '600' }}>Amount</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--dark-text-secondary)', fontSize: '0.875rem', fontWeight: '600' }}>Paid</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--dark-text-secondary)', fontSize: '0.875rem', fontWeight: '600' }}>Due Date</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--dark-text-secondary)', fontSize: '0.875rem', fontWeight: '600' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} style={{ borderBottom: '1px solid var(--dark-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: '600' }}>{invoice.invoiceNumber}</td>
                    <td style={{ padding: '1rem' }}>{invoice.project.name}</td>
                    <td style={{ padding: '1rem', fontWeight: '600' }}>{formatCurrency(invoice.amount)}</td>
                    <td style={{ padding: '1rem', color: invoice.paidAmount >= invoice.amount ? '#10b981' : '#f59e0b' }}>
                      {formatCurrency(invoice.paidAmount)}
                    </td>
                    <td style={{ padding: '1rem' }}>{formatDate(invoice.dueDate)}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${getStatusBadge(invoice.status)}`}>{invoice.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
