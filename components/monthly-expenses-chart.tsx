"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import type { Transaction } from "@/app/page"

interface MonthlyExpensesChartProps {
  transactions: Transaction[]
}

export function MonthlyExpensesChart({ transactions }: MonthlyExpensesChartProps) {
  // Group expenses by month
  const monthlyData = transactions
    .filter((t) => t.type === "expense")
    .reduce(
      (acc, transaction) => {
        const month = transaction.date.slice(0, 7) // YYYY-MM format
        const monthName = new Date(transaction.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        })

        if (!acc[month]) {
          acc[month] = { month: monthName, expenses: 0 }
        }
        acc[month].expenses += transaction.amount

        return acc
      },
      {} as Record<string, { month: string; expenses: number }>,
    )

  const chartData = Object.values(monthlyData)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6) // Show last 6 months

  const chartConfig = {
    expenses: {
      label: "Expenses",
      color: "hsl(var(--chart-1))",
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Expenses</CardTitle>
        <CardDescription>Your expense trends over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <ChartTooltip content={<ChartTooltipContent />} formatter={(value) => [`$${value}`, "Expenses"]} />
              <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
