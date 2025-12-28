import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT /api/payouts/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { amount, payoutType, payoutDate, notes } = body

    // Validate payout exists
    const existingPayout = await prisma.payout.findUnique({
      where: { id },
    })

    if (!existingPayout) {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 })
    }

    // Update payout
    const updatedPayout = await prisma.payout.update({
      where: { id },
      data: {
        amount: amount ? parseFloat(amount) : existingPayout.amount,
        payoutType: payoutType || existingPayout.payoutType,
        payoutDate: payoutDate ? new Date(payoutDate) : existingPayout.payoutDate,
        notes: notes !== undefined ? notes : existingPayout.notes,
      },
    })

    return NextResponse.json(updatedPayout)
  } catch (error) {
    console.error('Error updating payout:', error)
    return NextResponse.json(
      { error: 'Failed to update payout' },
      { status: 500 }
    )
  }
}

// DELETE /api/payouts/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.payout.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Payout deleted successfully' })
  } catch (error) {
    console.error('Error deleting payout:', error)
    return NextResponse.json(
      { error: 'Failed to delete payout' },
      { status: 500 }
    )
  }
}
