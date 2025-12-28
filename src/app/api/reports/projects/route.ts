import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/reports/projects - Project-wise financial summary
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
      },
    })

    const report = projects.map((project) => {
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
        id: project.id,
        name: project.name,
        client: project.client,
        totalAmount: project.totalAmount,
        totalIncome,
        totalExpenses,
        profit,
        status: project.status,
      }
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error generating project report:', error)
    return NextResponse.json(
      { error: 'Failed to generate project report' },
      { status: 500 }
    )
  }
}
