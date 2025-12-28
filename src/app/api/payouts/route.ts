import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/payouts - List all payouts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const employeeId = searchParams.get('employeeId')

    const where: any = {}
    if (projectId) where.projectId = projectId
    if (employeeId) where.employeeId = employeeId

    const payouts = await prisma.payout.findMany({
      where,
      include: {
        project: true,
        employee: true,
      },
      orderBy: {
        payoutDate: 'desc',
      },
    })

    return NextResponse.json(payouts)
  } catch (error) {
    console.error('Error fetching payouts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payouts' },
      { status: 500 }
    )
  }
}

// POST /api/payouts - Record new payout
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, employeeId, amount, payoutDate, payoutType, notes } =
      body

    if (!projectId || !employeeId || !amount) {
      return NextResponse.json(
        { error: 'Project ID, employee ID, and amount are required' },
        { status: 400 }
      )
    }

    // Verify employee is assigned to project
    const projectEmployee = await prisma.projectEmployee.findUnique({
      where: {
        projectId_employeeId: {
          projectId,
          employeeId,
        },
      },
    })

    if (!projectEmployee) {
      return NextResponse.json(
        { error: 'Employee is not assigned to this project' },
        { status: 400 }
      )
    }

    const payout = await prisma.payout.create({
      data: {
        projectId,
        employeeId,
        amount: parseFloat(amount),
        payoutDate: payoutDate ? new Date(payoutDate) : new Date(),
        payoutType: payoutType || 'regular',
        status: 'completed',
        notes: notes || null,
      },
      include: {
        project: true,
        employee: true,
      },
    })

    return NextResponse.json(payout, { status: 201 })
  } catch (error) {
    console.error('Error creating payout:', error)
    return NextResponse.json(
      { error: 'Failed to create payout' },
      { status: 500 }
    )
  }
}
