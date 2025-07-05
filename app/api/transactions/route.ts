import { type NextRequest, NextResponse } from "next/server"

// Mock database - in production, use actual MongoDB connection
const transactions = [
  {
    id: "1",
    amount: 1200,
    date: "2024-01-15",
    description: "Salary",
    category: "Income",
    type: "income",
  },
  {
    id: "2",
    amount: 45.5,
    date: "2024-01-14",
    description: "Grocery shopping",
    category: "Food & Dining",
    type: "expense",
  },
]

export async function GET() {
  try {
    return NextResponse.json({ transactions })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newTransaction = {
      id: Date.now().toString(),
      ...body,
    }

    transactions.unshift(newTransaction)

    return NextResponse.json({ transaction: newTransaction }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    const index = transactions.findIndex((t) => t.id === id)
    if (index === -1) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    transactions[index] = { ...transactions[index], ...updateData }

    return NextResponse.json({ transaction: transactions[index] })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 })
    }

    const index = transactions.findIndex((t) => t.id === id)
    if (index === -1) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    transactions.splice(index, 1)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 })
  }
}
