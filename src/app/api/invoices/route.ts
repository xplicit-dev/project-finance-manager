import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/invoices - List all invoices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const projectId = searchParams.get('projectId')

    const where: any = {}
    if (status) where.status = status
    if (projectId) where.projectId = projectId

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        project: true,
        payments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate paid amount for each invoice
    const invoicesWithPaid = invoices.map((invoice) => {
      const paidAmount = invoice.payments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      )
      return {
        ...invoice,
        paidAmount,
        remainingAmount: invoice.amount - paidAmount,
      }
    })

    return NextResponse.json(invoicesWithPaid)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

// POST /api/invoices - Create new invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, amount, dueDate, notes, invoiceNumber } = body

    if (!projectId || !amount || !dueDate) {
      return NextResponse.json(
        { error: 'Project ID, amount, and due date are required' },
        { status: 400 }
      )
    }

    // Generate invoice number if not provided
    const finalInvoiceNumber =
      invoiceNumber ||
      `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: finalInvoiceNumber,
        projectId,
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
        notes: notes || null,
        status: 'draft',
      },
      include: {
        project: true,
      },
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}
