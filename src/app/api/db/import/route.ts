import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/db/import - Import database from JSON
export async function POST(request: NextRequest) {
  try {
    const importData = await request.json()

    // Validate import data structure
    if (!importData.data || !importData.version) {
      return NextResponse.json(
        { error: 'Invalid import file format' },
        { status: 400 }
      )
    }

    const { data } = importData

    // Delete all existing data (in correct order for foreign keys)
    await prisma.payment.deleteMany()
    await prisma.invoice.deleteMany()
    await prisma.payout.deleteMany()
    await prisma.projectEmployee.deleteMany()
    await prisma.note.deleteMany()
    await prisma.project.deleteMany()
    await prisma.employee.deleteMany()
    // Don't delete settings to preserve password

    // Import data (in correct order for foreign keys)
    if (data.employees?.length > 0) {
      await prisma.employee.createMany({ data: data.employees })
    }

    if (data.projects?.length > 0) {
      await prisma.project.createMany({ data: data.projects })
    }

    if (data.notes?.length > 0) {
      await prisma.note.createMany({ data: data.notes })
    }

    if (data.projectEmployees?.length > 0) {
      await prisma.projectEmployee.createMany({ data: data.projectEmployees })
    }

    if (data.invoices?.length > 0) {
      await prisma.invoice.createMany({ data: data.invoices })
    }

    if (data.payments?.length > 0) {
      await prisma.payment.createMany({ data: data.payments })
    }

    if (data.payouts?.length > 0) {
      await prisma.payout.createMany({ data: data.payouts })
    }

    // Import settings (currency only, preserve password)
    if (data.settings?.length > 0) {
      const currentSettings = await prisma.settings.findFirst()
      const importedSettings = data.settings[0]
      
      if (currentSettings) {
        await prisma.settings.update({
          where: { id: currentSettings.id },
          data: { currency: importedSettings.currency },
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database imported successfully' 
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Failed to import database' },
      { status: 500 }
    )
  }
}
