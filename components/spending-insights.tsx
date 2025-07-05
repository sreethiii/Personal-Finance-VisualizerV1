"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, AlertTriangle, Target, Calendar } from "lucide-react"
import type { Transaction, Budget } from "@/app/page"

interface SpendingInsightsProps {
  transactions: Transaction[]
  budgets: Budget[]
}

export function SpendingInsights({ transactions, budgets }: SpendingInsightsProps) {
  const currentMonth = new Date().toISOString().slice(0, 7)
  const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7)

  // Current month data
  const currentMonthTransactions = transactions.filter((t) => t.date.startsWith(currentMonth))
  const currentExpenses = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  const currentIncome = currentMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)

  // Last month data
  const lastMonthTransactions = transactions.filter((t) => t.date.startsWith(lastMonth))
  const lastMonthExpenses = lastMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  // Calculate trends
  const expenseChange = lastMonthExpenses > 0 ? ((currentExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0

  // Category analysis
  const categorySpending = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      },
      {} as Record<string, number>,
    )

  const topCategories = Object.entries(categorySpending)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  // Budget analysis
  const currentBudgets = budgets.filter((b) => b.month === currentMonth)
  const budgetAnalysis = currentBudgets.map((budget) => {
    const spent = categorySpending[budget.category] || 0
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0
    return {
      category: budget.category,
      budget: budget.amount,
      spent,
      percentage,
      status: percentage > 100 ? "over" : percentage > 80 ? "warning" : "good",
    }
  })

  const overBudgetCategories = budgetAnalysis.filter((b) => b.status === "over")
  const warningCategories = budgetAnalysis.filter((b) => b.status === "warning")

  // Savings rate
  const savingsRate = currentIncome > 0 ? ((currentIncome - currentExpenses) / currentIncome) * 100 : 0

  // Daily average
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  const currentDay = new Date().getDate()
  const dailyAverage = currentDay > 0 ? currentExpenses / currentDay : 0
  const projectedMonthly = dailyAverage * daysInMonth

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Trend</CardTitle>
            {expenseChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-red-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {expenseChange >= 0 ? "+" : ""}
              {expenseChange.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">vs last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${savingsRate >= 0 ? "text-green-600" : "text-red-600"}`}>
              {savingsRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">of income saved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dailyAverage.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">per day this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${projectedMonthly.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">monthly at current rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(overBudgetCategories.length > 0 || warningCategories.length > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Budget Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overBudgetCategories.map((category) => (
              <div key={category.category} className="flex justify-between items-center">
                <span className="font-medium text-red-800">{category.category} - Over Budget</span>
                <Badge variant="destructive">
                  ${category.spent.toFixed(2)} / ${category.budget.toFixed(2)}
                </Badge>
              </div>
            ))}
            {warningCategories.map((category) => (
              <div key={category.category} className="flex justify-between items-center">
                <span className="font-medium text-orange-800">
                  {category.category} - {category.percentage.toFixed(0)}% Used
                </span>
                <Badge variant="outline" className="border-orange-300">
                  ${category.spent.toFixed(2)} / ${category.budget.toFixed(2)}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Spending Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Top Spending Categories</CardTitle>
            <CardDescription>Your highest expense categories this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topCategories.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No expenses recorded this month</p>
            ) : (
              topCategories.map(([category, amount], index) => {
                const percentage = currentExpenses > 0 ? (amount / currentExpenses) * 100 : 0
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        #{index + 1} {category}
                      </span>
                      <Badge variant="outline">
                        ${amount.toFixed(2)} ({percentage.toFixed(1)}%)
                      </Badge>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Budget Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Performance</CardTitle>
            <CardDescription>How you're tracking against your budgets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgetAnalysis.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No budgets set for this month</p>
            ) : (
              budgetAnalysis.map((budget) => (
                <div key={budget.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{budget.category}</span>
                    <Badge
                      variant={
                        budget.status === "over" ? "destructive" : budget.status === "warning" ? "secondary" : "default"
                      }
                    >
                      {budget.percentage.toFixed(0)}%
                    </Badge>
                  </div>
                  <Progress value={Math.min(budget.percentage, 100)} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${budget.spent.toFixed(2)} spent</span>
                    <span>${budget.budget.toFixed(2)} budget</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Health Score */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Health Score</CardTitle>
          <CardDescription>Based on your spending patterns and budget adherence</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Calculate score based on various factors */}
            {(() => {
              let score = 100
              const factors = []

              // Savings rate factor
              if (savingsRate < 0) {
                score -= 30
                factors.push("Spending exceeds income (-30)")
              } else if (savingsRate < 10) {
                score -= 15
                factors.push("Low savings rate (-15)")
              } else if (savingsRate > 20) {
                factors.push("Excellent savings rate (+5)")
                score += 5
              }

              // Budget adherence factor
              const overBudgetPenalty = overBudgetCategories.length * 10
              const warningPenalty = warningCategories.length * 5
              score -= overBudgetPenalty + warningPenalty

              if (overBudgetCategories.length > 0) {
                factors.push(`${overBudgetCategories.length} categories over budget (-${overBudgetPenalty})`)
              }
              if (warningCategories.length > 0) {
                factors.push(`${warningCategories.length} categories approaching budget (-${warningPenalty})`)
              }

              // Expense trend factor
              if (expenseChange > 20) {
                score -= 15
                factors.push("High expense increase (-15)")
              } else if (expenseChange < -10) {
                score += 10
                factors.push("Reduced expenses (+10)")
              }

              score = Math.max(0, Math.min(100, score))

              return (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Progress value={score} className="h-4" />
                    </div>
                    <div className="text-2xl font-bold">{score}/100</div>
                  </div>

                  <div className="grid gap-2">
                    <h4 className="font-medium">Score Breakdown:</h4>
                    {factors.length > 0 ? (
                      factors.map((factor, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          • {factor}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">• No significant factors affecting score</div>
                    )}
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>
                        {score >= 80 ? "Excellent!" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Needs Improvement"}
                      </strong>{" "}
                      {score >= 80
                        ? "You're managing your finances very well. Keep up the great work!"
                        : score >= 60
                          ? "You're on the right track. Consider reviewing categories that are over budget."
                          : score >= 40
                            ? "There's room for improvement. Focus on staying within budgets and increasing savings."
                            : "Consider creating a more detailed budget and tracking your expenses more closely."}
                    </p>
                  </div>
                </div>
              )
            })()}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
