'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, DollarSign, Users, FileText, TrendingUp, TrendingDown, Trash2, StickyNote, Edit } from 'lucide-react'
import Link from 'next/link'
import { useCurrency } from '@/contexts/CurrencyProvider'

interface ProjectDetail {
  id: string
  name: string
  client: string
  totalAmount: number
  status: string
  description: string | null
  totalIncome: number
  totalExpenses: number
  profit: number
  invoices: any[]
  payouts: any[]
  projectEmployees: any[]
}

export default function ProjectDetailPage() {
  const { formatCurrency } = useCurrency()
  const paramsPromise = useParams()
  const router = useRouter()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showEmployeeModal, setShowEmployeeModal] = useState(false)
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [showEditEmployeeModal, setShowEditEmployeeModal] = useState(false)
  const [showEditPaymentModal, setShowEditPaymentModal] = useState(false)
  const [showEditPayoutModal, setShowEditPayoutModal] = useState(false)
  const [selectedTeamMember, setSelectedTeamMember] = useState<any | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null)
  const [selectedPayout, setSelectedPayout] = useState<any | null>(null)
  const [employees, setEmployees] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<string>('')
  const [selectedNote, setSelectedNote] = useState<any | null>(null)
  const [projectId, setProjectId] = useState<string>('')

  const [invoiceForm, setInvoiceForm] = useState({
    amount: '',
    dueDate: '',
    notes: '',
  })

  const [paymentForm, setPaymentForm] = useState({
    invoiceId: '',
    amount: '',
    paymentMethod: 'bank_transfer',
    paymentDate: '',
    notes: '',
  })

  const [employeeForm, setEmployeeForm] = useState({
    employeeId: '',
    payoutAmount: '',
    payoutType: 'fixed',
    notes: '',
  })

  const [payoutForm, setPayoutForm] = useState({
    employeeId: '',
    amount: '',
    payoutType: 'regular',
    payoutDate: '',
    notes: '',
  })

  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    color: '#ffffff',
  })

  useEffect(() => {
    const initParams = async () => {
      const params = await paramsPromise
      if (params.id && typeof params.id === 'string') {
        setProjectId(params.id)
      }
    }
    initParams()
  }, [paramsPromise])

  useEffect(() => {
    if (projectId) {
      fetchProject()
      fetchEmployees()
      fetchNotes()
    }
  }, [projectId])

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`)
      const data = await res.json()
      setProject(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching project:', error)
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees')
      const data = await res.json()
      setEmployees(data)
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: projectId,
          ...invoiceForm,
        }),
      })
      if (res.ok) {
        setShowInvoiceModal(false)
        setInvoiceForm({ amount: '', dueDate: '', notes: '' })
        fetchProject()
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
    }
  }

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentForm),
      })
      if (res.ok) {
        setShowPaymentModal(false)
        setPaymentForm({ invoiceId: '', amount: '', paymentMethod: 'bank_transfer', paymentDate: '', notes: '' })
        fetchProject()
      }
    } catch (error) {
      console.error('Error recording payment:', error)
    }
  }

  const handleAssignEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/projects/${projectId}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeForm),
      })
      if (res.ok) {
        setShowEmployeeModal(false)
        setEmployeeForm({ employeeId: '', payoutAmount: '', payoutType: 'fixed', notes: '' })
        fetchProject()
      }
    } catch (error) {
      console.error('Error assigning employee:', error)
    }
  }

  const handleRecordPayout = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: projectId,
          ...payoutForm,
        }),
      })
      if (res.ok) {
        setShowPayoutModal(false)
        setPayoutForm({ employeeId: '', amount: '', payoutType: 'regular', payoutDate: '', notes: '' })
        fetchProject()
      }
    } catch (error) {
      console.error('Error recording payout:', error)
    }
  }

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice? This will also delete all associated payments.')) return
    
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchProject()
      }
    } catch (error) {
      console.error('Error deleting invoice:', error)
    }
  }

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment?')) return
    
    try {
      const res = await fetch(`/api/payments/${paymentId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchProject()
      }
    } catch (error) {
      console.error('Error deleting payment:', error)
    }
  }

  const handleDeletePayout = async (payoutId: string) => {
    if (!confirm('Are you sure you want to delete this payout?')) return
    
    try {
      const res = await fetch(`/api/payouts/${payoutId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchProject()
      }
    } catch (error) {
      console.error('Error deleting payout:', error)
    }
  }

  const handleEditTeamMember = (pe: any) => {
    setSelectedTeamMember(pe)
    setEmployeeForm({
      employeeId: pe.employeeId,
      payoutAmount: pe.payoutAmount.toString(),
      payoutType: pe.payoutType,
      notes: pe.notes || '',
    })
    setShowEditEmployeeModal(true)
  }

  const handleUpdateTeamMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeamMember) return

    try {
      const res = await fetch(`/api/projects/${projectId}/employees/${selectedTeamMember.employeeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payoutAmount: employeeForm.payoutAmount,
          payoutType: employeeForm.payoutType,
          notes: employeeForm.notes,
        }),
      })
      if (res.ok) {
        setShowEditEmployeeModal(false)
        setSelectedTeamMember(null)
        setEmployeeForm({ employeeId: '', payoutAmount: '', payoutType: 'fixed', notes: '' })
        fetchProject()
      }
    } catch (error) {
      console.error('Error updating team member:', error)
    }
  }

  const handleDeleteTeamMember = async (employeeId: string) => {
    if (!confirm('Are you sure you want to remove this team member from the project?')) return

    try {
      const res = await fetch(`/api/projects/${projectId}/employees/${employeeId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchProject()
      }
    } catch (error) {
      console.error('Error removing team member:', error)
    }
  }

  const handleEditPayment = (payment: any) => {
    setSelectedPayment(payment)
    setPaymentForm({
      invoiceId: payment.invoiceId,
      amount: payment.amount.toString(),
      paymentMethod: payment.paymentMethod,
      paymentDate: payment.paymentDate ? new Date(payment.paymentDate).toISOString().split('T')[0] : '',
      notes: payment.notes || '',
    })
    setShowEditPaymentModal(true)
  }

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPayment) return

    try {
      const res = await fetch(`/api/payments/${selectedPayment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: paymentForm.amount,
          paymentMethod: paymentForm.paymentMethod,
          paymentDate: paymentForm.paymentDate || null,
          notes: paymentForm.notes,
        }),
      })
      if (res.ok) {
        setShowEditPaymentModal(false)
        setSelectedPayment(null)
        setPaymentForm({ invoiceId: '', amount: '', paymentMethod: 'bank_transfer', paymentDate: '', notes: '' })
        fetchProject()
      }
    } catch (error) {
      console.error('Error updating payment:', error)
    }
  }

  const handleEditPayout = (payout: any) => {
    setSelectedPayout(payout)
    setPayoutForm({
      employeeId: payout.employeeId,
      amount: payout.amount.toString(),
      payoutType: payout.payoutType,
      payoutDate: payout.payoutDate ? new Date(payout.payoutDate).toISOString().split('T')[0] : '',
      notes: payout.notes || '',
    })
    setShowEditPayoutModal(true)
  }

  const handleUpdatePayout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPayout) return

    try {
      const res = await fetch(`/api/payouts/${selectedPayout.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: payoutForm.amount,
          payoutType: payoutForm.payoutType,
          payoutDate: payoutForm.payoutDate || null,
          notes: payoutForm.notes,
        }),
      })
      if (res.ok) {
        setShowEditPayoutModal(false)
        setSelectedPayout(null)
        setPayoutForm({ employeeId: '', amount: '', payoutType: 'regular', payoutDate: '', notes: '' })
        fetchProject()
      }
    } catch (error) {
      console.error('Error updating payout:', error)
    }
  }

  const fetchNotes = async () => {
    try {
      const res = await fetch(`/api/notes?projectId=${projectId}`)
      if (!res.ok) {
        console.error('Failed to fetch notes:', res.statusText)
        setNotes([])
        return
      }
      const data = await res.json()
      setNotes(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching notes:', error)
      setNotes([])
    }
  }

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          ...noteForm,
        }),
      })
      if (res.ok) {
        setShowNoteModal(false)
        setNoteForm({ title: '', content: '', color: '#ffffff' })
        fetchNotes()
      }
    } catch (error) {
      console.error('Error creating note:', error)
    }
  }

  const handleEditNote = (note: any) => {
    setSelectedNote(note)
    setNoteForm({
      title: note.title || '',
      content: note.content,
      color: note.color,
    })
    setShowNoteModal(true)
  }

  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedNote) return

    try {
      const res = await fetch(`/api/notes/${selectedNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteForm),
      })
      if (res.ok) {
        setShowNoteModal(false)
        setSelectedNote(null)
        setNoteForm({ title: '', content: '', color: '#ffffff' })
        fetchNotes()
      }
    } catch (error) {
      console.error('Error updating note:', error)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchNotes()
      }
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  const handleNoteSubmit = (e: React.FormEvent) => {
    if (selectedNote) {
      handleUpdateNote(e)
    } else {
      handleCreateNote(e)
    }
  }


  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div className="animate-pulse" style={{ fontSize: '1.25rem', color: 'var(--dark-text-secondary)' }}>
          Loading project...
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--dark-text-secondary)' }}>Project not found</p>
      </div>
    )
  }

  const availableEmployees = employees.filter(
    (emp) => !project.projectEmployees.some((pe) => pe.employeeId === emp.id)
  )

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-500)', textDecoration: 'none', marginBottom: '1rem' }}>
          <ArrowLeft size={18} />
          Back to Projects
        </Link>
        <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ marginBottom: '0.5rem' }}>{project.name}</h1>
            <p style={{ color: 'var(--dark-text-secondary)' }}>Client: {project.client}</p>
          </div>
          <span className={`badge ${project.status === 'active' ? 'badge-success' : project.status === 'completed' ? 'badge-info' : 'badge-warning'}`}>
            {project.status}
          </span>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--dark-text-secondary)', marginBottom: '0.5rem' }}>Total Budget</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={24} color="var(--primary-500)" />
            <h2 style={{ margin: 0 }}>{formatCurrency(project.totalAmount)}</h2>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--dark-text-secondary)', marginBottom: '0.5rem' }}>Total Income</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={24} color="#10b981" />
            <h2 style={{ margin: 0, color: '#10b981' }}>{formatCurrency(project.totalIncome)}</h2>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--dark-text-secondary)', marginBottom: '0.5rem' }}>Total Expenses</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingDown size={24} color="#ef4444" />
            <h2 style={{ margin: 0, color: '#ef4444' }}>{formatCurrency(project.totalExpenses)}</h2>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--dark-text-secondary)', marginBottom: '0.5rem' }}>Net Profit</p>
          <h2 style={{ margin: 0, color: project.profit >= 0 ? '#10b981' : '#ef4444' }}>{formatCurrency(project.profit)}</h2>
        </div>
      </div>

      {/* Invoices Section */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={24} color="var(--primary-500)" />
            <h3 style={{ margin: 0 }}>Invoices</h3>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => setShowPaymentModal(true)}>
              <Plus size={16} />
              Record Payment
            </button>
            <button className="btn btn-primary" onClick={() => setShowInvoiceModal(true)}>
              <Plus size={16} />
              New Invoice
            </button>
          </div>
        </div>
        {project.invoices.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--dark-text-secondary)', padding: '2rem' }}>No invoices yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {project.invoices.map((invoice) => {
              const paidAmount = invoice.payments.reduce((sum: number, p: any) => sum + p.amount, 0)
              const remaining = invoice.amount - paidAmount
              return (
                <div key={invoice.id} style={{ padding: '1rem', background: 'var(--dark-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--dark-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: '600' }}>{invoice.invoiceNumber}</p>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--dark-text-secondary)' }}>Due: {formatDate(invoice.dueDate)}</p>
                      {invoice.payments.length > 0 && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {invoice.payments.map((payment: any) => (
                            <div key={payment.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                              <span style={{ color: 'var(--dark-text-secondary)' }}>Payment: {formatCurrency(payment.amount)}</span>
                              <button
                                type="button"
                                onClick={() => handleEditPayment(payment)}
                                className="btn-icon"
                                style={{ padding: '0.25rem', color: 'var(--primary-500)' }}
                                title="Edit payment"
                              >
                                <Edit size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePayment(payment.id)}
                                className="btn-icon"
                                style={{ padding: '0.25rem', color: '#ef4444' }}
                                title="Delete payment"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontWeight: '600', fontSize: '1.125rem' }}>{formatCurrency(invoice.amount)}</p>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: remaining > 0 ? '#f59e0b' : '#10b981' }}>
                          {remaining > 0 ? `${formatCurrency(remaining)} remaining` : 'Paid in full'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteInvoice(invoice.id)}
                        className="btn-icon"
                        style={{ padding: '0.5rem', color: '#ef4444' }}
                        title="Delete invoice"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Employees Section */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Users size={24} color="var(--primary-500)" />
            <h3 style={{ margin: 0 }}>Team Members</h3>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => setShowPayoutModal(true)}>
              <Plus size={16} />
              Record Payout
            </button>
            <button className="btn btn-primary" onClick={() => setShowEmployeeModal(true)}>
              <Plus size={16} />
              Assign Employee
            </button>
          </div>
        </div>
        {project.projectEmployees.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--dark-text-secondary)', padding: '2rem' }}>No employees assigned yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {project.projectEmployees.map((pe) => {
              const employeePayouts = project.payouts.filter((p) => p.employeeId === pe.employeeId)
              const totalPaid = employeePayouts.reduce((sum, p) => sum + p.amount, 0)
              return (
                <div key={pe.id} style={{ padding: '1rem', background: 'var(--dark-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--dark-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: '600' }}>{pe.employee.name}</p>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--dark-text-secondary)' }}>
                        {pe.employee.role || 'Team Member'} • Allocated: {formatCurrency(pe.payoutAmount)}
                      </p>
                      {employeePayouts.length > 0 && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {employeePayouts.map((payout: any) => (
                            <div key={payout.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                              <span style={{ color: 'var(--dark-text-secondary)' }}>
                                Payout: {formatCurrency(payout.amount)} ({payout.payoutType})
                              </span>
                              <button
                                type="button"
                                onClick={() => handleEditPayout(payout)}
                                className="btn-icon"
                                style={{ padding: '0.25rem', color: 'var(--primary-500)' }}
                                title="Edit payout"
                              >
                                <Edit size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePayout(payout.id)}
                                className="btn-icon"
                                style={{ padding: '0.25rem', color: '#ef4444' }}
                                title="Delete payout"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontWeight: '600', fontSize: '1.125rem' }}>{formatCurrency(totalPaid)}</p>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--dark-text-secondary)' }}>Total paid</p>
                      </div>
                      <button
                        onClick={() => handleEditTeamMember(pe)}
                        className="btn-icon"
                        style={{ padding: '0.5rem', color: 'var(--primary-500)' }}
                        title="Edit allocation"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTeamMember(pe.employeeId)}
                        className="btn-icon"
                        style={{ padding: '0.5rem', color: '#ef4444' }}
                        title="Remove from project"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Notes Section */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <StickyNote size={24} color="var(--primary-500)" />
            <h3 style={{ margin: 0 }}>Notes</h3>
          </div>
          <button className="btn btn-primary" onClick={() => { setSelectedNote(null); setNoteForm({ title: '', content: '', color: '#ffffff' }); setShowNoteModal(true); }}>
            <Plus size={16} />
            Add Note
          </button>
        </div>
        {notes.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--dark-text-secondary)', padding: '2rem' }}>No notes yet</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {notes.map((note) => (
              <div
                key={note.id}
                style={{
                  padding: '1rem',
                  background: note.color,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  position: 'relative',
                  minHeight: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'box-shadow 0.2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {note.title && (
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                    {note.title}
                  </h4>
                )}
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#374151', flex: 1, whiteSpace: 'pre-wrap' }}>
                  {note.content}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleEditNote(note)}
                    className="btn-icon"
                    style={{ padding: '0.5rem', background: 'rgba(255, 255, 255, 0.8)' }}
                    title="Edit note"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="btn-icon"
                    style={{ padding: '0.5rem', background: 'rgba(255, 255, 255, 0.8)', color: '#ef4444' }}
                    title="Delete note"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showInvoiceModal && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', zIndex: 1040 }} onClick={() => setShowInvoiceModal(false)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', maxWidth: '500px', zIndex: 1050 }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Create Invoice</h2>
              <form onSubmit={handleCreateInvoice}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label className="label">Amount *</label>
                    <input type="number" className="input" required min="0" step="0.01" value={invoiceForm.amount} onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })} placeholder="0.00" />
                  </div>
                  <div>
                    <label className="label">Due Date *</label>
                    <input type="date" className="input" required value={invoiceForm.dueDate} onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Notes</label>
                    <textarea className="input" rows={3} value={invoiceForm.notes} onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })} placeholder="Invoice notes (optional)" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowInvoiceModal(false)} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Invoice</button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {showPaymentModal && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', zIndex: 1040 }} onClick={() => setShowPaymentModal(false)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', maxWidth: '500px', zIndex: 1050 }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Record Payment</h2>
              <form onSubmit={handleRecordPayment}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label className="label">Invoice *</label>
                    <select className="select" required value={paymentForm.invoiceId} onChange={(e) => setPaymentForm({ ...paymentForm, invoiceId: e.target.value })}>
                      <option value="">Select invoice</option>
                      {project.invoices.map((inv) => (
                        <option key={inv.id} value={inv.id}>{inv.invoiceNumber} - {formatCurrency(inv.amount)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Amount *</label>
                    <input type="number" className="input" required min="0" step="0.01" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} placeholder="0.00" />
                  </div>
                  <div>
                    <label className="label">Payment Method</label>
                    <select className="select" value={paymentForm.paymentMethod} onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cash">Cash</option>
                      <option value="check">Check</option>
                      <option value="online">Online</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Transaction Date (optional)</label>
                    <input type="date" className="input" value={paymentForm.paymentDate} onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowPaymentModal(false)} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Record Payment</button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {showEmployeeModal && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', zIndex: 1040 }} onClick={() => setShowEmployeeModal(false)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', maxWidth: '500px', zIndex: 1050 }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Assign Employee</h2>
              <form onSubmit={handleAssignEmployee}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label className="label">Employee *</label>
                    <select className="select" required value={employeeForm.employeeId} onChange={(e) => setEmployeeForm({ ...employeeForm, employeeId: e.target.value })}>
                      <option value="">Select employee</option>
                      {availableEmployees.map((emp) => (
                        <option key={emp.id} value={emp.id}>{emp.name} - {emp.role || 'Team Member'}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Payout Amount *</label>
                    <input type="number" className="input" required min="0" step="0.01" value={employeeForm.payoutAmount} onChange={(e) => setEmployeeForm({ ...employeeForm, payoutAmount: e.target.value })} placeholder="0.00" />
                  </div>
                  <div>
                    <label className="label">Payout Type</label>
                    <select className="select" value={employeeForm.payoutType} onChange={(e) => setEmployeeForm({ ...employeeForm, payoutType: e.target.value })}>
                      <option value="fixed">Fixed</option>
                      <option value="variable">Variable</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowEmployeeModal(false)} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Assign Employee</button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {showPayoutModal && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', zIndex: 1040 }} onClick={() => setShowPayoutModal(false)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', maxWidth: '500px', zIndex: 1050 }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Record Payout</h2>
              <form onSubmit={handleRecordPayout}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label className="label">Employee *</label>
                    <select className="select" required value={payoutForm.employeeId} onChange={(e) => setPayoutForm({ ...payoutForm, employeeId: e.target.value })}>
                      <option value="">Select employee</option>
                      {project.projectEmployees.map((pe) => (
                        <option key={pe.id} value={pe.employeeId}>{pe.employee.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Amount *</label>
                    <input type="number" className="input" required min="0" step="0.01" value={payoutForm.amount} onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })} placeholder="0.00" />
                  </div>
                  <div>
                    <label className="label">Payout Type</label>
                    <select className="select" value={payoutForm.payoutType} onChange={(e) => setPayoutForm({ ...payoutForm, payoutType: e.target.value })}>
                      <option value="regular">Regular</option>
                      <option value="advance">Advance</option>
                      <option value="bonus">Bonus</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Transaction Date (optional)</label>
                    <input type="date" className="input" value={payoutForm.payoutDate} onChange={(e) => setPayoutForm({ ...payoutForm, payoutDate: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowPayoutModal(false)} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Record Payout</button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', zIndex: 1040 }} onClick={() => { setShowNoteModal(false); setSelectedNote(null); }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', maxWidth: '500px', zIndex: 1050 }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>{selectedNote ? 'Edit Note' : 'Add Note'}</h2>
              <form onSubmit={handleNoteSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label className="label">Title (optional)</label>
                    <input
                      type="text"
                      className="input"
                      value={noteForm.title}
                      onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                      placeholder="Note title"
                    />
                  </div>
                  <div>
                    <label className="label">Content *</label>
                    <textarea
                      className="input"
                      required
                      rows={5}
                      value={noteForm.content}
                      onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                      placeholder="Write your note here..."
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                  <div>
                    <label className="label">Color</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '0.5rem' }}>
                      {[
                        { name: 'White', value: '#ffffff' },
                        { name: 'Yellow', value: '#fff9c4' },
                        { name: 'Orange', value: '#ffcc80' },
                        { name: 'Pink', value: '#f8bbd0' },
                        { name: 'Purple', value: '#e1bee7' },
                        { name: 'Blue', value: '#bbdefb' },
                        { name: 'Green', value: '#c5e1a5' },
                        { name: 'Gray', value: '#e0e0e0' },
                      ].map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setNoteForm({ ...noteForm, color: color.value })}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: 'var(--radius-md)',
                            background: color.value,
                            border: noteForm.color === color.value ? '3px solid var(--primary-500)' : '1px solid rgba(0, 0, 0, 0.2)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                          }}
                          title={color.name}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => { setShowNoteModal(false); setSelectedNote(null); }} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{selectedNote ? 'Update Note' : 'Add Note'}</button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Edit Team Member Modal */}
      {showEditEmployeeModal && selectedTeamMember && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', zIndex: 1040 }} onClick={() => { setShowEditEmployeeModal(false); setSelectedTeamMember(null); }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', maxWidth: '500px', zIndex: 1050 }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Edit Team Member Allocation</h2>
              <form onSubmit={handleUpdateTeamMember}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label className="label">Employee</label>
                    <input type="text" className="input" disabled value={selectedTeamMember.employee.name} style={{ background: 'var(--dark-surface)', cursor: 'not-allowed' }} />
                  </div>
                  <div>
                    <label className="label">Allocated Amount *</label>
                    <input type="number" className="input" required min="0" step="0.01" value={employeeForm.payoutAmount} onChange={(e) => setEmployeeForm({ ...employeeForm, payoutAmount: e.target.value })} placeholder="0.00" />
                  </div>
                  <div>
                    <label className="label">Payout Type</label>
                    <select className="select" value={employeeForm.payoutType} onChange={(e) => setEmployeeForm({ ...employeeForm, payoutType: e.target.value })}>
                      <option value="fixed">Fixed</option>
                      <option value="variable">Variable</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Notes</label>
                    <textarea className="input" rows={3} value={employeeForm.notes} onChange={(e) => setEmployeeForm({ ...employeeForm, notes: e.target.value })} placeholder="Additional notes (optional)" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => { setShowEditEmployeeModal(false); setSelectedTeamMember(null); }} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Update Allocation</button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Edit Payment Modal */}
      {showEditPaymentModal && selectedPayment && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', zIndex: 1040 }} onClick={() => { setShowEditPaymentModal(false); setSelectedPayment(null); }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', maxWidth: '500px', zIndex: 1050 }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Edit Payment</h2>
              <form onSubmit={handleUpdatePayment}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label className="label">Amount *</label>
                    <input type="number" className="input" required min="0" step="0.01" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} placeholder="0.00" />
                  </div>
                  <div>
                    <label className="label">Payment Method</label>
                    <select className="select" value={paymentForm.paymentMethod} onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cash">Cash</option>
                      <option value="check">Check</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Transaction Date (optional)</label>
                    <input type="date" className="input" value={paymentForm.paymentDate} onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Notes</label>
                    <textarea className="input" rows={3} value={paymentForm.notes} onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })} placeholder="Additional notes (optional)" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => { setShowEditPaymentModal(false); setSelectedPayment(null); }} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Update Payment</button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Edit Payout Modal */}
      {showEditPayoutModal && selectedPayout && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', zIndex: 1040 }} onClick={() => { setShowEditPayoutModal(false); setSelectedPayout(null); }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', maxWidth: '500px', zIndex: 1050 }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Edit Payout</h2>
              <form onSubmit={handleUpdatePayout}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label className="label">Amount *</label>
                    <input type="number" className="input" required min="0" step="0.01" value={payoutForm.amount} onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })} placeholder="0.00" />
                  </div>
                  <div>
                    <label className="label">Payout Type</label>
                    <select className="select" value={payoutForm.payoutType} onChange={(e) => setPayoutForm({ ...payoutForm, payoutType: e.target.value })}>
                      <option value="regular">Regular</option>
                      <option value="advance">Advance</option>
                      <option value="bonus">Bonus</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Transaction Date (optional)</label>
                    <input type="date" className="input" value={payoutForm.payoutDate} onChange={(e) => setPayoutForm({ ...payoutForm, payoutDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Notes</label>
                    <textarea className="input" rows={3} value={payoutForm.notes} onChange={(e) => setPayoutForm({ ...payoutForm, notes: e.target.value })} placeholder="Additional notes (optional)" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => { setShowEditPayoutModal(false); setSelectedPayout(null); }} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Update Payout</button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
