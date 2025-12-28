import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH /api/projects/:id/employees/:employeeId - Update team member allocation
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; employeeId: string }> }
) {
  try {
    const { id, employeeId } = await params
    const body = await request.json()
    const { payoutAmount, payoutType, notes } = body

    if (!payoutAmount) {
      return NextResponse.json(
        { error: 'Payout amount is required' },
        { status: 400 }
      )
    }

    // Find the project employee assignment
    const projectEmployee = await prisma.projectEmployee.findUnique({
      where: {
        projectId_employeeId: {
          projectId: id,
          employeeId,
        },
      },
    })

    if (!projectEmployee) {
      return NextResponse.json(
        { error: 'Team member assignment not found' },
        { status: 404 }
      )
    }

    // Update the assignment
    const updated = await prisma.projectEmployee.update({
      where: {
        projectId_employeeId: {
          projectId: id,
          employeeId,
        },
      },
      data: {
        payoutAmount: parseFloat(payoutAmount),
        payoutType: payoutType || projectEmployee.payoutType,
        notes: notes !== undefined ? notes : projectEmployee.notes,
      },
      include: {
        employee: true,
        project: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating team member:', error)
    return NextResponse.json(
      { error: 'Failed to update team member' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/:id/employees/:employeeId - Remove team member from project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; employeeId: string }> }
) {
  try {
    const { id, employeeId } = await params

    // Check if the assignment exists
    const projectEmployee = await prisma.projectEmployee.findUnique({
      where: {
        projectId_employeeId: {
          projectId: id,
          employeeId,
        },
      },
    })

    if (!projectEmployee) {
      return NextResponse.json(
        { error: 'Team member assignment not found' },
        { status: 404 }
      )
    }

    // Delete the assignment
    await prisma.projectEmployee.delete({
      where: {
        projectId_employeeId: {
          projectId: id,
          employeeId,
        },
      },
    })

    return NextResponse.json({ success: true, message: 'Team member removed from project' })
  } catch (error) {
    console.error('Error deleting team member:', error)
    return NextResponse.json(
      { error: 'Failed to remove team member' },
      { status: 500 }
    )
  }
}
