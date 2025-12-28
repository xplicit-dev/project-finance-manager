'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, DollarSign, TrendingUp, TrendingDown, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useCurrency } from '@/contexts/CurrencyProvider'

interface Project {
  id: string
  name: string
  client: string
  totalAmount: number
  description?: string
  status: string
  totalIncome: number
  totalExpenses: number
  profit: number
  createdAt: string
}

export default function ProjectsPage() {
  const { formatCurrency } = useCurrency()
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    totalAmount: '',
    description: '',
    status: 'active',
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    filterProjects()
  }, [projects, searchTerm, statusFilter])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching projects:', error)
      setLoading(false)
    }
  }

  const filterProjects = () => {
    let filtered = projects

    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.client.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredProjects(filtered)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setShowModal(false)
        setFormData({
          name: '',
          client: '',
          totalAmount: '',
          description: '',
          status: 'active',
        })
        fetchProjects()
      }
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  const handleEdit = (e: React.MouseEvent, project: Project) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedProject(project)
    setFormData({
      name: project.name,
      client: project.client,
      totalAmount: project.totalAmount.toString(),
      description: project.description || '',
      status: project.status,
    })
    setShowEditModal(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProject) return

    try {
      const res = await fetch(`/api/projects/${selectedProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setShowEditModal(false)
        setSelectedProject(null)
        setFormData({
          name: '',
          client: '',
          totalAmount: '',
          description: '',
          status: 'active',
        })
        fetchProjects()
      }
    } catch (error) {
      console.error('Error updating project:', error)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent, project: Project) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedProject(project)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    if (!selectedProject) return

    try {
      const res = await fetch(`/api/projects/${selectedProject.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setShowDeleteModal(false)
        setSelectedProject(null)
        fetchProjects()
      }
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'badge-success'
      case 'completed':
        return 'badge-info'
      case 'on-hold':
        return 'badge-warning'
      default:
        return 'badge-info'
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div className="animate-pulse" style={{ fontSize: '1.25rem', color: 'var(--dark-text-secondary)' }}>
          Loading projects...
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>Projects</h1>
          <p style={{ color: 'var(--dark-text-secondary)' }}>Manage all your projects and track their finances</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          New Project
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search
              size={20}
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--dark-text-secondary)' }}
            />
            <input
              type="text"
              className="input"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '3rem' }}
            />
          </div>
          <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '200px' }}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--dark-text-secondary)', fontSize: '1.125rem' }}>
            {searchTerm || statusFilter !== 'all' ? 'No projects found matching your filters' : 'No projects yet. Create your first project!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
          {filteredProjects.map((project) => (
            <div key={project.id} className="glass-card" style={{ padding: '1.5rem', position: 'relative' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <Link href={`/projects/${project.id}`} style={{ flex: 1, textDecoration: 'none' }}>
                  <h3 style={{ marginBottom: '0.25rem', color: 'var(--dark-text)' }}>{project.name}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--dark-text-secondary)', margin: 0 }}>{project.client}</p>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className={`badge ${getStatusColor(project.status)}`}>{project.status}</span>
                  <button
                    onClick={(e) => handleEdit(e, project)}
                    className="btn-icon"
                    style={{ padding: '0.5rem' }}
                    title="Edit project"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, project)}
                    className="btn-icon"
                    style={{ padding: '0.5rem', color: '#ef4444' }}
                    title="Delete project"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <Link href={`/projects/${project.id}`} style={{ textDecoration: 'none', display: 'block' }}>

              {/* Budget */}
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--dark-surface)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--dark-text-secondary)', marginBottom: '0.25rem' }}>Total Budget</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <DollarSign size={20} color="var(--primary-500)" />
                  <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--dark-text)' }}>
                    {formatCurrency(project.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Financial Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--dark-text-secondary)', marginBottom: '0.25rem' }}>Income</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <TrendingUp size={14} color="#10b981" />
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#10b981' }}>
                      {formatCurrency(project.totalIncome)}
                    </span>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--dark-text-secondary)', marginBottom: '0.25rem' }}>Expenses</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <TrendingDown size={14} color="#ef4444" />
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#ef4444' }}>
                      {formatCurrency(project.totalExpenses)}
                    </span>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--dark-text-secondary)', marginBottom: '0.25rem' }}>Profit</p>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: project.profit >= 0 ? '#10b981' : '#ef4444',
                    }}
                  >
                    {formatCurrency(project.profit)}
                  </span>
                </div>
              </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(4px)',
              zIndex: 1040,
            }}
            onClick={() => setShowModal(false)}
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
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Create New Project</h2>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label className="label">Project Name *</label>
                    <input
                      type="text"
                      className="input"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter project name"
                    />
                  </div>
                  <div>
                    <label className="label">Client Name *</label>
                    <input
                      type="text"
                      className="input"
                      required
                      value={formData.client}
                      onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                      placeholder="Enter client name"
                    />
                  </div>
                  <div>
                    <label className="label">Total Budget *</label>
                    <input
                      type="number"
                      className="input"
                      required
                      min="0"
                      step="0.01"
                      value={formData.totalAmount}
                      onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="label">Description</label>
                    <textarea
                      className="input"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Project description (optional)"
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                  <div>
                    <label className="label">Status</label>
                    <select className="select" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                      <option value="active">Active</option>
                      <option value="on-hold">On Hold</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)} style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
      {/* Edit Project Modal */}
      {showEditModal && selectedProject && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(4px)',
              zIndex: 1040,
            }}
            onClick={() => setShowEditModal(false)}
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
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Edit Project</h2>
              <form onSubmit={handleUpdate}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label className="label">Project Name *</label>
                    <input
                      type="text"
                      className="input"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter project name"
                    />
                  </div>
                  <div>
                    <label className="label">Client Name *</label>
                    <input
                      type="text"
                      className="input"
                      required
                      value={formData.client}
                      onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                      placeholder="Enter client name"
                    />
                  </div>
                  <div>
                    <label className="label">Total Budget *</label>
                    <input
                      type="number"
                      className="input"
                      required
                      min="0"
                      step="0.01"
                      value={formData.totalAmount}
                      onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="label">Description</label>
                    <textarea
                      className="input"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Project description (optional)"
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                  <div>
                    <label className="label">Status</label>
                    <select className="select" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                      <option value="active">Active</option>
                      <option value="on-hold">On Hold</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowEditModal(false)} style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Update Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProject && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(4px)',
              zIndex: 1040,
            }}
            onClick={() => setShowDeleteModal(false)}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              maxWidth: '400px',
              zIndex: 1050,
            }}
          >
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h2 style={{ marginBottom: '1rem', color: '#ef4444' }}>Delete Project</h2>
              <p style={{ marginBottom: '1.5rem', color: 'var(--dark-text-secondary)' }}>
                Are you sure you want to delete <strong>{selectedProject.name}</strong>? This action cannot be undone and will also delete all associated invoices, payments, and payouts.
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
