import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/db/export - Export entire database as JSON
export async function GET() {
  try {
    // Fetch all data from all tables
    const [
      projects,
      invoices,
      payments,
      employees,
      projectEmployees,
      payouts,
      notes,
      settings,
    ] = await Promise.all([
      prisma.project.findMany(),
      prisma.invoice.findMany(),
      prisma.payment.findMany(),
      prisma.employee.findMany(),
      prisma.projectEmployee.findMany(),
      prisma.payout.findMany(),
      prisma.note.findMany(),
      prisma.settings.findMany(),
    ])

    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      data: {
        projects,
        invoices,
        payments,
        employees,
        projectEmployees,
        payouts,
        notes,
        settings,
      },
    }

    // Return as downloadable JSON file
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="pm-backup-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export database' },
      { status: 500 }
    )
  }
}
