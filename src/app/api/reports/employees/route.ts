import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/reports/employees - Employee-wise payout summary
export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        payouts: {
          include: {
            project: true,
          },
        },
        projectEmployees: {
          include: {
            project: true,
          },
        },
      },
    })

    const report = employees.map((employee) => {
      const totalPayouts = employee.payouts.reduce(
        (sum, payout) => sum + payout.amount,
        0
      )

      const projectsWorkedOn = employee.projectEmployees.length

      const payoutsByProject = employee.payouts.reduce((acc, payout) => {
        const projectName = payout.project.name
        if (!acc[projectName]) {
          acc[projectName] = 0
        }
        acc[projectName] += payout.amount
        return acc
      }, {} as Record<string, number>)

      return {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        totalPayouts,
        projectsWorkedOn,
        payoutsByProject,
      }
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error generating employee report:', error)
    return NextResponse.json(
      { error: 'Failed to generate employee report' },
      { status: 500 }
    )
  }
}
