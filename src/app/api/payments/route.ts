import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/payments - List all payments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const invoiceId = searchParams.get('invoiceId')

    const where: any = {}
    if (invoiceId) where.invoiceId = invoiceId

    const payments = await prisma.payment.findMany({
      where,
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

    return NextResponse.json(payments)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

// POST /api/payments - Record new payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { invoiceId, amount, paymentDate, paymentMethod, notes } = body

    if (!invoiceId || !amount) {
      return NextResponse.json(
        { error: 'Invoice ID and amount are required' },
        { status: 400 }
      )
    }

    // Get invoice to check remaining amount
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        payments: true,
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const paidAmount = invoice.payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    )
    const remainingAmount = invoice.amount - paidAmount

    if (parseFloat(amount) > remainingAmount) {
      return NextResponse.json(
        {
          error: `Payment amount exceeds remaining invoice amount (${remainingAmount})`,
        },
        { status: 400 }
      )
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount: parseFloat(amount),
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        paymentMethod: paymentMethod || 'bank_transfer',
        notes: notes || null,
      },
      include: {
        invoice: {
          include: {
            project: true,
          },
        },
      },
    })

    // Update invoice status if fully paid
    const newPaidAmount = paidAmount + parseFloat(amount)
    if (newPaidAmount >= invoice.amount) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: 'paid' },
      })
    } else if (invoice.status === 'draft') {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: 'sent' },
      })
    }

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}
