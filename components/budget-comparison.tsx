"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { Transaction, Budget } from "@/app/page"

interface BudgetComparisonProps {
  transactions: Transaction[]
  budgets: Budget[]
  currentMonth: string
}

export function BudgetComparison({ transactions, budgets, currentMonth }: BudgetComparisonProps) {
  // Calculate actual spending by category for current month
  const actualSpending = transactions
    .filter((t) => t.type === "expense" && t.date.startsWith(currentMonth))
    .reduce(
      (acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount
        return acc
      },
      {} as Record<string, number>,
    )

  // Get budgets for current month
  const currentBudgets = budgets.filter((b) => b.month === currentMonth)

  if (currentBudgets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget vs Actual</CardTitle>
          <CardDescription>Compare your spending against budgets</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <p className="text-muted-foreground">No budgets set for this month</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget vs Actual</CardTitle>
        <CardDescription>
          Compare your spending against budgets for{" "}
          {new Date(currentMonth).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentBudgets.map((budget) => {
          const actual = actualSpending[budget.category] || 0
          const percentage = budget.amount > 0 ? (actual / budget.amount) * 100 : 0
          const isOverBudget = actual > budget.amount
          const remaining = budget.amount - actual

          return (
            <div key={budget.category} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{budget.category}</span>
                <Badge variant={isOverBudget ? "destructive" : "default"}>
                  ${actual.toFixed(2)} / ${budget.amount.toFixed(2)}
                </Badge>
              </div>

              <Progress value={Math.min(percentage, 100)} className="h-2" />

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{percentage.toFixed(1)}% used</span>
                <span>
                  {remaining >= 0
                    ? `$${remaining.toFixed(2)} remaining`
                    : `$${Math.abs(remaining).toFixed(2)} over budget`}
                </span>
              </div>
            </div>
          )
        })}

        {/* Summary */}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total</span>
            <div className="text-right">
              <div className="font-medium">
                $
                {Object.values(actualSpending)
                  .reduce((sum, amount) => sum + amount, 0)
                  .toFixed(2)}{" "}
                / ${currentBudgets.reduce((sum, budget) => sum + budget.amount, 0).toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">
                {(
                  (Object.values(actualSpending).reduce((sum, amount) => sum + amount, 0) /
                    currentBudgets.reduce((sum, budget) => sum + budget.amount, 0)) *
                  100
                ).toFixed(1)}
                % of total budget
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
