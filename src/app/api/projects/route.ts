import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/projects - List all projects with calculated balances
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        invoices: {
          include: {
            payments: true,
          },
        },
        payouts: true,
        projectEmployees: {
          include: {
            employee: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate balances for each project
    const projectsWithBalances = projects.map((project) => {
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

      return {
        ...project,
        totalIncome,
        totalExpenses,
        profit,
      }
    })

    return NextResponse.json(projectsWithBalances)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, client, totalAmount, description, status } = body

    // Validation
    if (!name || !client || !totalAmount) {
      return NextResponse.json(
        { error: 'Name, client, and total amount are required' },
        { status: 400 }
      )
    }

    if (totalAmount <= 0) {
      return NextResponse.json(
        { error: 'Total amount must be greater than 0' },
        { status: 400 }
      )
    }

    const project = await prisma.project.create({
      data: {
        name,
        client,
        totalAmount: parseFloat(totalAmount),
        description: description || null,
        status: status || 'active',
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
