'use client'

import { useEffect, useState } from 'react'
import { BarChart3, Download } from 'lucide-react'
import { useCurrency } from '@/contexts/CurrencyProvider'

export default function ReportsPage() {
  const { formatCurrency } = useCurrency()
  const [activeTab, setActiveTab] = useState<'projects' | 'employees' | 'transactions'>('projects')
  const [projectReport, setProjectReport] = useState<any[]>([])
  const [employeeReport, setEmployeeReport] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const [projectsRes, employeesRes] = await Promise.all([
        fetch('/api/reports/projects'),
        fetch('/api/reports/employees'),
      ])
      const projectsData = await projectsRes.json()
      const employeesData = await employeesRes.json()
      setProjectReport(projectsData)
      setEmployeeReport(employeesData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching reports:', error)
      setLoading(false)
    }
  }

  const handleExport = (type: string) => {
    window.open(`/api/reports/export?type=${type}`, '_blank')
  }


  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div className="animate-pulse" style={{ fontSize: '1.25rem', color: 'var(--dark-text-secondary)' }}>
          Loading reports...
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Reports</h1>
        <p style={{ color: 'var(--dark-text-secondary)' }}>Financial reports and analytics</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          className={`btn ${activeTab === 'projects' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('projects')}
        >
          Project Report
        </button>
        <button
          className={`btn ${activeTab === 'employees' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('employees')}
        >
          Employee Report
        </button>
        <button
          className={`btn ${activeTab === 'transactions' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transaction History
        </button>
      </div>

      {/* Project Report */}
      {activeTab === 'projects' && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <BarChart3 size={24} color="var(--primary-500)" />
              <h3 style={{ margin: 0 }}>Project-wise Financial Summary</h3>
            </div>
            <button className="btn btn-secondary" onClick={() => handleExport('projects')}>
              <Download size={16} />
              Export CSV
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--dark-border)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--dark-text-secondary)', fontSize: '0.875rem', fontWeight: '600' }}>Project</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--dark-text-secondary)', fontSize: '0.875rem', fontWeight: '600' }}>Client</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--dark-text-secondary)', fontSize: '0.875rem', fontWeight: '600' }}>Budget</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--dark-text-secondary)', fontSize: '0.875rem', fontWeight: '600' }}>Income</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--dark-text-secondary)', fontSize: '0.875rem', fontWeight: '600' }}>Expenses</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--dark-text-secondary)', fontSize: '0.875rem', fontWeight: '600' }}>Profit</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--dark-text-secondary)', fontSize: '0.875rem', fontWeight: '600' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {projectReport.map((project) => (
                  <tr key={project.id} style={{ borderBottom: '1px solid var(--dark-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: '600' }}>{project.name}</td>
                    <td style={{ padding: '1rem' }}>{project.client}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>{formatCurrency(project.totalAmount)}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#10b981', fontWeight: '600' }}>{formatCurrency(project.totalIncome)}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#ef4444', fontWeight: '600' }}>{formatCurrency(project.totalExpenses)}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700', color: project.profit >= 0 ? '#10b981' : '#ef4444' }}>
                      {formatCurrency(project.profit)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span className={`badge ${project.status === 'active' ? 'badge-success' : project.status === 'completed' ? 'badge-info' : 'badge-warning'}`}>
                        {project.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid var(--dark-border)', fontWeight: '700' }}>
                  <td colSpan={3} style={{ padding: '1rem' }}>TOTAL</td>
                  <td style={{ padding: '1rem', textAlign: 'right', color: '#10b981' }}>
                    {formatCurrency(projectReport.reduce((sum, p) => sum + p.totalIncome, 0))}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', color: '#ef4444' }}>
                    {formatCurrency(projectReport.reduce((sum, p) => sum + p.totalExpenses, 0))}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', color: projectReport.reduce((sum, p) => sum + p.profit, 0) >= 0 ? '#10b981' : '#ef4444' }}>
                    {formatCurrency(projectReport.reduce((sum, p) => sum + p.profit, 0))}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Employee Report */}
      {activeTab === 'employees' && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <BarChart3 size={24} color="var(--primary-500)" />
              <h3 style={{ margin: 0 }}>Employee-wise Payout Summary</h3>
            </div>
            <button className="btn btn-secondary" onClick={() => handleExport('employees')}>
              <Download size={16} />
              Export CSV
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--dark-border)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--dark-text-secondary)', fontSize: '0.875rem', fontWeight: '600' }}>Employee</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--dark-text-secondary)', fontSize: '0.875rem', fontWeight: '600' }}>Role</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--dark-text-secondary)', fontSize: '0.875rem', fontWeight: '600' }}>Total Payouts</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--dark-text-secondary)', fontSize: '0.875rem', fontWeight: '600' }}>Projects</th>
                </tr>
              </thead>
              <tbody>
                {employeeReport.map((employee) => (
                  <tr key={employee.id} style={{ borderBottom: '1px solid var(--dark-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: '600' }}>{employee.name}</td>
                    <td style={{ padding: '1rem' }}>{employee.role || 'Team Member'}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700', color: '#10b981' }}>
                      {formatCurrency(employee.totalPayouts)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>{employee.projectsWorkedOn}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid var(--dark-border)', fontWeight: '700' }}>
                  <td colSpan={2} style={{ padding: '1rem' }}>TOTAL</td>
                  <td style={{ padding: '1rem', textAlign: 'right', color: '#10b981' }}>
                    {formatCurrency(employeeReport.reduce((sum, e) => sum + e.totalPayouts, 0))}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Transaction History */}
      {activeTab === 'transactions' && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <BarChart3 size={24} color="var(--primary-500)" />
              <h3 style={{ margin: 0 }}>All Transactions</h3>
            </div>
            <button className="btn btn-secondary" onClick={() => handleExport('transactions')}>
              <Download size={16} />
              Export CSV
            </button>
          </div>
          <p style={{ textAlign: 'center', color: 'var(--dark-text-secondary)', padding: '2rem' }}>
            Transaction history is available in the CSV export
          </p>
        </div>
      )}
    </div>
  )
}
