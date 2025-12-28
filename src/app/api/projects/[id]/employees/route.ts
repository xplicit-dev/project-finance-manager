import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/projects/:id/employees - Assign employee to project
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { employeeId, payoutAmount, payoutType, notes } = body

    if (!employeeId || !payoutAmount) {
      return NextResponse.json(
        { error: 'Employee ID and payout amount are required' },
        { status: 400 }
      )
    }

    // Check if already assigned
    const existing = await prisma.projectEmployee.findUnique({
      where: {
        projectId_employeeId: {
          projectId: id,
          employeeId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Employee already assigned to this project' },
        { status: 400 }
      )
    }

    const projectEmployee = await prisma.projectEmployee.create({
      data: {
        projectId: id,
        employeeId,
        payoutAmount: parseFloat(payoutAmount),
        payoutType: payoutType || 'fixed',
        notes: notes || null,
      },
      include: {
        employee: true,
        project: true,
      },
    })

    return NextResponse.json(projectEmployee, { status: 201 })
  } catch (error) {
    console.error('Error assigning employee:', error)
    return NextResponse.json(
      { error: 'Failed to assign employee' },
      { status: 500 }
    )
  }
}
