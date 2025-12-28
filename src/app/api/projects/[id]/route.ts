import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/projects/:id - Get single project with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        invoices: {
          include: {
            payments: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        payouts: {
          include: {
            employee: true,
          },
          orderBy: {
            payoutDate: 'desc',
          },
        },
        projectEmployees: {
          include: {
            employee: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Calculate financial details
    const totalIncome = project.invoices.reduce((sum, invoice) => {
      const invoicePayments = invoice.payments.reduce(
        (pSum, payment) => pSum + payment.amount,
        0
      )
      return sum + invoicePayments
    }, 0)

    const totalExpenses = project.payouts.reduce(
      (sum, payout) => sum + payout.amount,
      0
    )

    const profit = totalIncome - totalExpenses

    return NextResponse.json({
      ...project,
      totalIncome,
      totalExpenses,
      profit,
    })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

// PUT /api/projects/:id - Update project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, client, totalAmount, description, status } = body

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(client && { client }),
        ...(totalAmount && { totalAmount: parseFloat(totalAmount) }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
      },
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/:id - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.project.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}
