"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react"
import { TransactionForm } from "@/components/transaction-form"
import { TransactionList } from "@/components/transaction-list"
import { MonthlyExpensesChart } from "@/components/monthly-expenses-chart"
import { CategoryPieChart } from "@/components/category-pie-chart"
import { BudgetComparison } from "@/components/budget-comparison"
import { BudgetManager } from "@/components/budget-manager"
import { SpendingInsights } from "@/components/spending-insights"

export interface Transaction {
  id: string
  amount: number
  date: string
  description: string
  category: string
  type: "income" | "expense"
}

export interface Budget {
  category: string
  amount: number
  month: string
}

const CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Travel",
  "Education",
  "Income",
  "Other",
]

export default function FinanceTracker() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      // Simulate API calls - in real app, these would be actual API endpoints
      const sampleTransactions: Transaction[] = [
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
        {
          id: "3",
          amount: 25.0,
          date: "2024-01-13",
          description: "Gas station",
          category: "Transportation",
          type: "expense",
        },
        {
          id: "4",
          amount: 89.99,
          date: "2024-01-12",
          description: "Internet bill",
          category: "Bills & Utilities",
          type: "expense",
        },
        {
          id: "5",
          amount: 15.75,
          date: "2024-01-11",
          description: "Coffee shop",
          category: "Food & Dining",
          type: "expense",
        },
      ]

      const sampleBudgets: Budget[] = [
        { category: "Food & Dining", amount: 300, month: "2024-01" },
        { category: "Transportation", amount: 150, month: "2024-01" },
        { category: "Entertainment", amount: 100, month: "2024-01" },
        { category: "Bills & Utilities", amount: 200, month: "2024-01" },
      ]

      setTransactions(sampleTransactions)
      setBudgets(sampleBudgets)
      setError(null)
    } catch (err) {
      setError("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    }
    setTransactions((prev) => [newTransaction, ...prev])
    setIsFormOpen(false)
  }

  const updateTransaction = (id: string, transaction: Omit<Transaction, "id">) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...transaction, id } : t)))
    setEditingTransaction(null)
    setIsFormOpen(false)
  }

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  const updateBudget = (category: string, amount: number, month: string) => {
    setBudgets((prev) => {
      const existing = prev.find((b) => b.category === category && b.month === month)
      if (existing) {
        return prev.map((b) => (b.category === category && b.month === month ? { ...b, amount } : b))
      } else {
        return [...prev, { category, amount, month }]
      }
    })
  }

  // Calculate summary statistics
  const currentMonth = new Date().toISOString().slice(0, 7)
  const currentMonthTransactions = transactions.filter((t) => t.date.startsWith(currentMonth))

  const totalIncome = currentMonthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  const netIncome = totalIncome - totalExpenses

  const categoryExpenses = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      },
      {} as Record<string, number>,
    )

  const topCategory = Object.entries(categoryExpenses).sort(([, a], [, b]) => b - a)[0]

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={loadData}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Personal Finance Tracker</h1>
          <p className="text-muted-foreground">Track your expenses, manage budgets, and gain financial insights</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netIncome >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${netIncome.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{topCategory ? topCategory[0] : "None"}</div>
            <p className="text-xs text-muted-foreground">
              {topCategory ? `$${topCategory[1].toFixed(2)}` : "No expenses"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="charts" className="hidden lg:block">
            Charts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <MonthlyExpensesChart transactions={transactions} />
            <CategoryPieChart transactions={transactions} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <BudgetComparison transactions={transactions} budgets={budgets} currentMonth={currentMonth} />
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={transaction.type === "income" ? "default" : "secondary"}>
                        {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionList
            transactions={transactions}
            onEdit={(transaction) => {
              setEditingTransaction(transaction)
              setIsFormOpen(true)
            }}
            onDelete={deleteTransaction}
          />
        </TabsContent>

        <TabsContent value="budgets">
          <BudgetManager
            budgets={budgets}
            categories={CATEGORIES}
            onUpdateBudget={updateBudget}
            transactions={transactions}
          />
        </TabsContent>

        <TabsContent value="insights">
          <SpendingInsights transactions={transactions} budgets={budgets} />
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <MonthlyExpensesChart transactions={transactions} />
            <CategoryPieChart transactions={transactions} />
          </div>
          <BudgetComparison transactions={transactions} budgets={budgets} currentMonth={currentMonth} />
        </TabsContent>
      </Tabs>

      {/* Transaction Form Modal */}
      {isFormOpen && (
        <TransactionForm
          categories={CATEGORIES}
          transaction={editingTransaction}
          onSubmit={editingTransaction ? (data) => updateTransaction(editingTransaction.id, data) : addTransaction}
          onCancel={() => {
            setIsFormOpen(false)
            setEditingTransaction(null)
          }}
        />
      )}
    </div>
  )
}
