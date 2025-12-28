'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, DollarSign, FolderKanban, FileText, Activity } from 'lucide-react'
import Link from 'next/link'
import { useCurrency } from '@/contexts/CurrencyProvider'

interface DashboardStats {
  totalRevenue: number
  totalExpenses: number
  totalProfit: number
  activeProjects: number
  pendingInvoices: number
  recentTransactions: any[]
}

export default function Dashboard() {
  const { formatCurrency } = useCurrency()
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalExpenses: 0,
    totalProfit: 0,
    activeProjects: 0,
    pendingInvoices: 0,
    recentTransactions: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch projects
      const projectsRes = await fetch('/api/projects')
      const projects = await projectsRes.json()

      // Fetch invoices
      const invoicesRes = await fetch('/api/invoices')
      const invoices = await invoicesRes.json()

      // Fetch payments
      const paymentsRes = await fetch('/api/payments')
      const payments = await paymentsRes.json()

      // Fetch payouts
      const payoutsRes = await fetch('/api/payouts')
      const payouts = await payoutsRes.json()

      // Calculate stats
      const totalRevenue = projects.reduce((sum: number, p: any) => sum + p.totalIncome, 0)
      const totalExpenses = projects.reduce((sum: number, p: any) => sum + p.totalExpenses, 0)
      const totalProfit = totalRevenue - totalExpenses
      const activeProjects = projects.filter((p: any) => p.status === 'active').length
      const pendingInvoices = invoices.filter((i: any) => i.status !== 'paid').length

      // Recent transactions (last 5)
      const allTransactions = [
        ...payments.map((p: any) => ({
          type: 'payment',
          date: new Date(p.paymentDate),
          amount: p.amount,
          description: `Payment for ${p.invoice.project.name}`,
        })),
        ...payouts.map((p: any) => ({
          type: 'payout',
          date: new Date(p.payoutDate),
          amount: p.amount,
          description: `Payout to ${p.employee.name}`,
        })),
      ]
      allTransactions.sort((a, b) => b.date.getTime() - a.date.getTime())
      const recentTransactions = allTransactions.slice(0, 5)

      setStats({
        totalRevenue,
        totalExpenses,
        totalProfit,
        activeProjects,
        pendingInvoices,
        recentTransactions,
      })
      setLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div className="animate-pulse" style={{ fontSize: '1.25rem', color: 'var(--dark-text-secondary)' }}>
          Loading dashboard...
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Dashboard</h1>
        <p style={{ color: 'var(--dark-text-secondary)' }}>
          Overview of your project finances and recent activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
        {/* Total Revenue */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={24} color="#10b981" />
            </div>
            <span className="badge badge-success">Income</span>
          </div>
          <h3 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{formatCurrency(stats.totalRevenue)}</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--dark-text-secondary)' }}>Total Revenue</p>
        </div>

        {/* Total Expenses */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingDown size={24} color="#ef4444" />
            </div>
            <span className="badge badge-error">Expenses</span>
          </div>
          <h3 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{formatCurrency(stats.totalExpenses)}</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--dark-text-secondary)' }}>Total Payouts</p>
        </div>

        {/* Total Profit */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(3, 105, 161, 0.2))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DollarSign size={24} color="#0ea5e9" />
            </div>
            <span className={`badge ${stats.totalProfit >= 0 ? 'badge-success' : 'badge-error'}`}>
              {stats.totalProfit >= 0 ? 'Profit' : 'Loss'}
            </span>
          </div>
          <h3 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{formatCurrency(stats.totalProfit)}</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--dark-text-secondary)' }}>Net Profit</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2" style={{ marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(147, 51, 234, 0.2))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FolderKanban size={28} color="#a855f7" />
            </div>
            <div>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '0' }}>{stats.activeProjects}</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--dark-text-secondary)', margin: 0 }}>Active Projects</p>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={28} color="#f59e0b" />
            </div>
            <div>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '0' }}>{stats.pendingInvoices}</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--dark-text-secondary)', margin: 0 }}>Pending Invoices</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Activity size={24} color="var(--primary-500)" />
            <h3 style={{ margin: 0 }}>Recent Transactions</h3>
          </div>
          <Link href="/reports" className="btn btn-ghost" style={{ fontSize: '0.875rem' }}>
            View All
          </Link>
        </div>

        {stats.recentTransactions.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--dark-text-secondary)', padding: '2rem' }}>
            No transactions yet
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.recentTransactions.map((transaction, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  background: 'var(--dark-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--dark-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background:
                        transaction.type === 'payment'
                          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))'
                          : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {transaction.type === 'payment' ? (
                      <TrendingUp size={20} color="#10b981" />
                    ) : (
                      <TrendingDown size={20} color="#ef4444" />
                    )}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: '500', color: 'var(--dark-text)' }}>
                      {transaction.description}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--dark-text-secondary)' }}>
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: '600',
                      fontSize: '1.125rem',
                      color: transaction.type === 'payment' ? '#10b981' : '#ef4444',
                    }}
                  >
                    {transaction.type === 'payment' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link href="/projects" className="btn btn-primary">
          <FolderKanban size={18} />
          New Project
        </Link>
        <Link href="/invoices" className="btn btn-secondary">
          <FileText size={18} />
          Create Invoice
        </Link>
      </div>
    </div>
  )
}
