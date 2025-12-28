import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE /api/destroy - Deletes ALL data from the database
export async function DELETE() {
  try {
    // Delete all data in the correct order (respecting foreign key constraints)
    await prisma.payment.deleteMany()
    await prisma.invoice.deleteMany()
    await prisma.payout.deleteMany()
    await prisma.projectEmployee.deleteMany()
    await prisma.note.deleteMany()
    await prisma.project.deleteMany()
    await prisma.employee.deleteMany()
    await prisma.settings.deleteMany()

    return NextResponse.json({ 
      success: true, 
      message: 'All data has been permanently deleted' 
    })
  } catch (error) {
    console.error('Error destroying database:', error)
    return NextResponse.json(
      { error: 'Failed to destroy database' },
      { status: 500 }
    )
  }
}
