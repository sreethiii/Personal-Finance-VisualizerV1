"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Edit } from "lucide-react"
import type { Budget, Transaction } from "@/app/page"

interface BudgetManagerProps {
  budgets: Budget[]
  categories: string[]
  onUpdateBudget: (category: string, amount: number, month: string) => void
  transactions: Transaction[]
}

export function BudgetManager({ budgets, categories, onUpdateBudget, transactions }: BudgetManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
  })

  const currentMonthBudgets = budgets.filter((b) => b.month === selectedMonth)

  // Calculate actual spending for selected month
  const actualSpending = transactions
    .filter((t) => t.type === "expense" && t.date.startsWith(selectedMonth))
    .reduce(
      (acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount
        return acc
      },
      {} as Record<string, number>,
    )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.category && formData.amount) {
      onUpdateBudget(formData.category, Number.parseFloat(formData.amount), selectedMonth)
      setFormData({ category: "", amount: "" })
      setIsFormOpen(false)
    }
  }

  const availableCategories = categories.filter((cat) => !currentMonthBudgets.some((budget) => budget.category === cat))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Budget Manager</CardTitle>
              <CardDescription>Set and manage your monthly budgets by category</CardDescription>
            </div>
            <Button onClick={() => setIsFormOpen(true)} disabled={availableCategories.length === 0}>
              <Plus className="w-4 h-4 mr-2" />
              Add Budget
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Month Selector */}
          <div className="flex items-center space-x-4">
            <Label htmlFor="month">Month:</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => {
                  const date = new Date()
                  date.setMonth(date.getMonth() - 6 + i)
                  const monthValue = date.toISOString().slice(0, 7)
                  const monthLabel = date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })
                  return (
                    <SelectItem key={monthValue} value={monthValue}>
                      {monthLabel}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Budget Form */}
          {isFormOpen && (
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Budget Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit">Add Budget</Button>
                    <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Budget List */}
      <div className="grid gap-4 md:grid-cols-2">
        {currentMonthBudgets.length === 0 ? (
          <Card className="md:col-span-2">
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">
                No budgets set for{" "}
                {new Date(selectedMonth).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
              </p>
            </CardContent>
          </Card>
        ) : (
          currentMonthBudgets.map((budget) => {
            const actual = actualSpending[budget.category] || 0
            const percentage = budget.amount > 0 ? (actual / budget.amount) * 100 : 0
            const isOverBudget = actual > budget.amount
            const remaining = budget.amount - actual

            return (
              <Card key={budget.category}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{budget.category}</CardTitle>
                    <Badge variant={isOverBudget ? "destructive" : "default"}>
                      ${actual.toFixed(2)} / ${budget.amount.toFixed(2)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={Math.min(percentage, 100)} className="h-3" />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{remaining >= 0 ? "Remaining" : "Over Budget"}</span>
                      <span className={`font-medium ${remaining < 0 ? "text-destructive" : "text-green-600"}`}>
                        ${Math.abs(remaining).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData({
                          category: budget.category,
                          amount: budget.amount.toString(),
                        })
                        setIsFormOpen(true)
                      }}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
