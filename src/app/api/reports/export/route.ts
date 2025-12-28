import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/reports/export - Export data as CSV
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'projects'

    let csvContent = ''

    if (type === 'projects') {
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

      csvContent = 'Project Name,Client,Total Amount,Total Income,Total Expenses,Profit,Status\n'
      
      projects.forEach((project) => {
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

        csvContent += `"${project.name}","${project.client}",${project.totalAmount},${totalIncome},${totalExpenses},${profit},${project.status}\n`
      })
    } else if (type === 'employees') {
      const employees = await prisma.employee.findMany({
        include: {
          payouts: true,
          projectEmployees: {
            include: {
              project: true,
            },
          },
        },
      })

      csvContent = 'Employee Name,Email,Role,Total Payouts,Projects Worked On\n'
      
      employees.forEach((employee) => {
        const totalPayouts = employee.payouts.reduce(
          (sum, payout) => sum + payout.amount,
          0
        )

        csvContent += `"${employee.name}","${employee.email}","${employee.role || ''}",${totalPayouts},${employee.projectEmployees.length}\n`
      })
    } else if (type === 'transactions') {
      const payments = await prisma.payment.findMany({
        include: {
          invoice: {
            include: {
              project: true,
            },
          },
        },
        orderBy: {
          paymentDate: 'desc',
        },
      })

      const payouts = await prisma.payout.findMany({
        include: {
          project: true,
          employee: true,
        },
        orderBy: {
          payoutDate: 'desc',
        },
      })

      csvContent = 'Date,Type,Project,Amount,Details\n'
      
      // Combine and sort transactions
      const transactions: any[] = []
      
      payments.forEach((payment) => {
        transactions.push({
          date: payment.paymentDate,
          type: 'Payment',
          project: payment.invoice.project.name,
          amount: payment.amount,
          details: `Invoice: ${payment.invoice.invoiceNumber}`,
        })
      })

      payouts.forEach((payout) => {
        transactions.push({
          date: payout.payoutDate,
          type: 'Payout',
          project: payout.project.name,
          amount: payout.amount,
          details: `Employee: ${payout.employee.name}`,
        })
      })

      transactions.sort((a, b) => b.date.getTime() - a.date.getTime())

      transactions.forEach((transaction) => {
        csvContent += `${transaction.date.toISOString().split('T')[0]},${transaction.type},"${transaction.project}",${transaction.amount},"${transaction.details}"\n`
      })
    }

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${type}-report-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}
