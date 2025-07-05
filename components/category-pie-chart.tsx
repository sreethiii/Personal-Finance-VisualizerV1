"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import type { Transaction } from "@/app/page"

interface CategoryPieChartProps {
  transactions: Transaction[]
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#00ff00",
]

export function CategoryPieChart({ transactions }: CategoryPieChartProps) {
  const currentMonth = new Date().toISOString().slice(0, 7)

  // Group expenses by category for current month
  const categoryData = transactions
    .filter((t) => t.type === "expense" && t.date.startsWith(currentMonth))
    .reduce(
      (acc, transaction) => {
        if (!acc[transaction.category]) {
          acc[transaction.category] = 0
        }
        acc[transaction.category] += transaction.amount
        return acc
      },
      {} as Record<string, number>,
    )

  const chartData = Object.entries(categoryData)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: 0, // Will be calculated
    }))
    .sort((a, b) => b.amount - a.amount)

  const total = chartData.reduce((sum, item) => sum + item.amount, 0)
  chartData.forEach((item) => {
    item.percentage = total > 0 ? (item.amount / total) * 100 : 0
  })

  const chartConfig = chartData.reduce(
    (config, item, index) => {
      config[item.category] = {
        label: item.category,
        color: COLORS[index % COLORS.length],
      }
      return config
    },
    {} as Record<string, { label: string; color: string }>,
  )

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>Expense distribution by category this month</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No expense data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
        <CardDescription>Expense distribution by category this month</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="amount"
                label={({ category, percentage }) => `${category}: ${percentage.toFixed(1)}%`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} formatter={(value, name) => [`$${value}`, name]} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {chartData.slice(0, 6).map((item, index) => (
            <div key={item.category} className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span className="text-sm truncate">
                {item.category}: ${item.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
