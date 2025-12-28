import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/employees - List all employees
export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        payouts: true,
        projectEmployees: {
          include: {
            project: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate total payouts for each employee
    const employeesWithTotals = employees.map((employee) => {
      const totalPayouts = employee.payouts.reduce(
        (sum, payout) => sum + payout.amount,
        0
      )
      
      // Calculate total allocated amount from all project assignments
      const totalAllocated = employee.projectEmployees.reduce(
        (sum, pe) => sum + pe.payoutAmount,
        0
      )
      
      // Calculate pending amount (allocated - paid)
      const totalPending = totalAllocated - totalPayouts
      
      return {
        ...employee,
        totalPayouts,
        totalAllocated,
        totalPending,
      }
    })

    return NextResponse.json(employeesWithTotals)
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}

// POST /api/employees - Create new employee
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, role, phone } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existing = await prisma.employee.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Employee with this email already exists' },
        { status: 400 }
      )
    }

    const employee = await prisma.employee.create({
      data: {
        name,
        email,
        role: role || null,
        phone: phone || null,
      },
    })

    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    console.error('Error creating employee:', error)
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    )
  }
}
