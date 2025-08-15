"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Search, Clock, Trash2, Download } from "lucide-react"

interface CalculationStep {
  step: string
  explanation: string
  result?: string
}

interface CalculationResult {
  input: string
  result: string
  steps: CalculationStep[]
  timestamp: Date
  method: string
}

interface HistoryPanelProps {
  history: CalculationResult[]
  onClose: () => void
  onSelectProblem: (problem: CalculationResult) => void
  onClearHistory: () => void
}

export function HistoryPanel({ history, onClose, onSelectProblem, onClearHistory }: HistoryPanelProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.input.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.result.toLowerCase().includes(searchTerm.toLowerCase())

    if (selectedFilter === "all") return matchesSearch
    if (selectedFilter === "today") {
      const today = new Date()
      return matchesSearch && item.timestamp.toDateString() === today.toDateString()
    }
    if (selectedFilter === "week") {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return matchesSearch && item.timestamp >= weekAgo
    }

    return matchesSearch
  })

  const exportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `math-calculator-history-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden glass-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-border/50">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 pulse-glow">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-headline">Calculation History</CardTitle>
              <CardDescription>
                {history.length} problem{history.length !== 1 ? "s" : ""} solved
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 rounded-xl">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search problems and solutions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 elegant-input"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("all")}
              >
                All
              </Button>
              <Button
                variant={selectedFilter === "today" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("today")}
              >
                Today
              </Button>
              <Button
                variant={selectedFilter === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("week")}
              >
                This Week
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportHistory} disabled={history.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            <Button variant="destructive" size="sm" onClick={onClearHistory} disabled={history.length === 0}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>

          {/* History List */}
          <ScrollArea className="h-[50vh] elegant-scrollbar">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-title mb-2">
                  {searchTerm ? "No matching problems found" : "No calculation history"}
                </h3>
                <p className="text-caption">
                  {searchTerm
                    ? "Try adjusting your search terms or filters"
                    : "Start solving problems to see your history here"}
                </p>
              </div>
            ) : (
              <div className="space-y-4 pr-4">
                {filteredHistory.map((item, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.01] border-border/50"
                    onClick={() => onSelectProblem(item)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {item.method}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{item.timestamp.toLocaleString()}</span>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-1">Problem:</p>
                              <p className="text-sm font-mono bg-muted/50 p-2 rounded-lg">{item.input}</p>
                            </div>

                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-1">Solution:</p>
                              <p className="text-sm font-mono bg-primary/5 p-2 rounded-lg text-primary">
                                {item.result}
                              </p>
                            </div>
                          </div>

                          {item.steps && item.steps.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs text-muted-foreground mb-2">
                                {item.steps.length} solution step{item.steps.length !== 1 ? "s" : ""}
                              </p>
                              <div className="flex gap-1">
                                {item.steps.slice(0, 3).map((_, stepIndex) => (
                                  <div key={stepIndex} className="w-2 h-2 bg-primary/30 rounded-full" />
                                ))}
                                {item.steps.length > 3 && (
                                  <span className="text-xs text-muted-foreground ml-1">
                                    +{item.steps.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
            <p className="text-caption">
              Showing {filteredHistory.length} of {history.length} problems
            </p>
            <Button onClick={onClose} className="gradient-button">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
