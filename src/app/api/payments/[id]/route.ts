import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/payments/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: {
          include: {
            project: true,
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error fetching payment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment' },
      { status: 500 }
    )
  }
}

// PUT /api/payments/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { amount, paymentMethod, paymentDate, notes } = body

    // Validate payment exists
    const existingPayment = await prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: {
          include: {
            payments: true,
          },
        },
      },
    })

    if (!existingPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Update payment
    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        amount: amount ? parseFloat(amount) : existingPayment.amount,
        paymentMethod: paymentMethod || existingPayment.paymentMethod,
        paymentDate: paymentDate ? new Date(paymentDate) : existingPayment.paymentDate,
        notes: notes !== undefined ? notes : existingPayment.notes,
      },
    })

    // Recalculate invoice status based on new payment amount
    const allPayments = await prisma.payment.findMany({
      where: { invoiceId: existingPayment.invoiceId },
    })

    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0)
    const invoiceAmount = existingPayment.invoice.amount

    let newStatus = 'draft'
    if (totalPaid >= invoiceAmount) {
      newStatus = 'paid'
    } else if (totalPaid > 0) {
      newStatus = 'sent'
    }

    await prisma.invoice.update({
      where: { id: existingPayment.invoiceId },
      data: { status: newStatus },
    })

    return NextResponse.json(updatedPayment)
  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    )
  }
}

// DELETE /api/payments/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: {
          include: {
            payments: true,
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Delete payment
    await prisma.payment.delete({
      where: { id },
    })

    // Update invoice status
    const remainingPayments = payment.invoice.payments.filter(
      (p) => p.id !== id
    )
    const totalPaid = remainingPayments.reduce(
      (sum, p) => sum + p.amount,
      0
    )

    if (totalPaid === 0) {
      await prisma.invoice.update({
        where: { id: payment.invoiceId },
        data: { status: 'draft' },
      })
    } else if (totalPaid < payment.invoice.amount) {
      await prisma.invoice.update({
        where: { id: payment.invoiceId },
        data: { status: 'sent' },
      })
    }

    return NextResponse.json({ message: 'Payment deleted successfully' })
  } catch (error) {
    console.error('Error deleting payment:', error)
    return NextResponse.json(
      { error: 'Failed to delete payment' },
      { status: 500 }
    )
  }
}
