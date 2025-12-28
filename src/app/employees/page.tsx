'use client'

import { useEffect, useState } from 'react'
import { Plus, Users, DollarSign, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useCurrency } from '@/contexts/CurrencyProvider'

interface Employee {
  id: string
  name: string
  email: string
  role?: string
  phone?: string
  totalPayouts: number
  totalAllocated: number
  totalPending: number
  projectEmployees: any[]
}

export default function EmployeesPage() {
  const { formatCurrency } = useCurrency()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    phone: '',
  })

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees')
      const data = await res.json()
      setEmployees(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching employees:', error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setShowModal(false)
        setFormData({ name: '', email: '', role: '', phone: '' })
        fetchEmployees()
      }
    } catch (error) {
      console.error('Error creating employee:', error)
    }
  }

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee)
    setFormData({
      name: employee.name,
      email: employee.email,
      role: employee.role || '',
      phone: employee.phone || '',
    })
    setShowEditModal(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmployee) return

    try {
      const res = await fetch(`/api/employees/${selectedEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setShowEditModal(false)
        setSelectedEmployee(null)
        setFormData({ name: '', email: '', role: '', phone: '' })
        fetchEmployees()
      }
    } catch (error) {
      console.error('Error updating employee:', error)
    }
  }

  const handleDeleteClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    if (!selectedEmployee) return

    try {
      const res = await fetch(`/api/employees/${selectedEmployee.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setShowDeleteModal(false)
        setSelectedEmployee(null)
        fetchEmployees()
      }
    } catch (error) {
      console.error('Error deleting employee:', error)
    }
  }


  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div className="animate-pulse" style={{ fontSize: '1.25rem', color: 'var(--dark-text-secondary)' }}>
          Loading employees...
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>Employees</h1>
          <p style={{ color: 'var(--dark-text-secondary)' }}>Manage team members and track payouts</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      {employees.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <Users size={48} color="var(--dark-text-secondary)" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--dark-text-secondary)', fontSize: '1.125rem' }}>No employees yet. Add your first team member!</p>
        </div>
      ) : (
        <div className="grid grid-cols-3" style={{ gap: '1.5rem' }}>
          {employees.map((employee) => (
            <div key={employee.id} className="glass-card" style={{ padding: '1.5rem', position: 'relative' }}>
              {/* Action Buttons */}
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleEdit(employee)}
                  className="btn-icon"
                  style={{ padding: '0.5rem' }}
                  title="Edit employee"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDeleteClick(employee)}
                  className="btn-icon"
                  style={{ padding: '0.5rem', color: '#ef4444' }}
                  title="Delete employee"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary-600), var(--primary-700))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: 'white',
                  }}
                >
                  {employee.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, marginBottom: '0.25rem' }}>{employee.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--dark-text-secondary)' }}>
                    {employee.role || 'Team Member'}
                  </p>
                </div>
              </div>

              <div style={{ padding: '1rem', background: 'var(--dark-surface)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--dark-text-secondary)', marginBottom: '0.25rem' }}>Total Allocated</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--primary-500)' }}>
                        {formatCurrency(employee.totalAllocated || 0)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--dark-text-secondary)', marginBottom: '0.25rem' }}>Total Paid</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.125rem', fontWeight: '600', color: '#10b981' }}>
                        {formatCurrency(employee.totalPayouts)}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--dark-border)' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--dark-text-secondary)', marginBottom: '0.25rem' }}>Pending Amount</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: '700', color: (employee.totalPending || 0) > 0 ? '#f59e0b' : '#6b7280' }}>
                      {formatCurrency(employee.totalPending || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--dark-text-secondary)' }}>Email:</span>
                  <span style={{ color: 'var(--dark-text)' }}>{employee.email}</span>
                </div>
                {employee.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--dark-text-secondary)' }}>Phone:</span>
                    <span style={{ color: 'var(--dark-text)' }}>{employee.phone}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--dark-text-secondary)' }}>Projects:</span>
                  <span style={{ color: 'var(--dark-text)' }}>{employee.projectEmployees.length}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Employee Modal */}
      {showModal && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', zIndex: 1040 }}
            onClick={() => setShowModal(false)}
          />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', maxWidth: '500px', zIndex: 1050 }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Add Employee</h2>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label className="label">Name *</label>
                    <input
                      type="text"
                      className="input"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter employee name"
                    />
                  </div>
                  <div>
                    <label className="label">Email *</label>
                    <input
                      type="email"
                      className="input"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="employee@example.com"
                    />
                  </div>
                  <div>
                    <label className="label">Role</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="e.g. Developer, Designer"
                    />
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input
                      type="tel"
                      className="input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)} style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Add Employee
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', zIndex: 1040 }}
            onClick={() => setShowEditModal(false)}
          />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', maxWidth: '500px', zIndex: 1050 }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Edit Employee</h2>
              <form onSubmit={handleUpdate}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label className="label">Name *</label>
                    <input
                      type="text"
                      className="input"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter employee name"
                    />
                  </div>
                  <div>
                    <label className="label">Email *</label>
                    <input
                      type="email"
                      className="input"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="employee@example.com"
                    />
                  </div>
                  <div>
                    <label className="label">Role</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="e.g. Developer, Designer"
                    />
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input
                      type="tel"
                      className="input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowEditModal(false)} style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Update Employee
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedEmployee && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', zIndex: 1040 }}
            onClick={() => setShowDeleteModal(false)}
          />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', maxWidth: '400px', zIndex: 1050 }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h2 style={{ marginBottom: '1rem', color: '#ef4444' }}>Delete Employee</h2>
              <p style={{ marginBottom: '1.5rem', color: 'var(--dark-text-secondary)' }}>
                Are you sure you want to delete <strong>{selectedEmployee.name}</strong>? This action cannot be undone and will also delete all associated payouts.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowDeleteModal(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="button" className="btn" onClick={handleDelete} style={{ flex: 1, background: '#ef4444', color: 'white' }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
