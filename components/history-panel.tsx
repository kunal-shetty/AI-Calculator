"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X, Search, Star, Clock, Copy, Download, Calendar } from "lucide-react"

interface MathResult {
  input: string
  solution: string
  steps?: string[]
  type: string
  images?: string[]
  plots?: string[]
  assumptions?: string[]
  warnings?: string[]
  success: boolean
  queryresult?: any
}

interface HistoryItem {
  id: string
  input: string
  result: MathResult
  timestamp: Date
  favorite: boolean
}

interface HistoryPanelProps {
  history: HistoryItem[]
  favorites: HistoryItem[]
  onClose: () => void
  onSelectItem: (item: HistoryItem) => void
  onToggleFavorite: (item: HistoryItem) => void
}

export function HistoryPanel({ history, favorites, onClose, onSelectItem, onToggleFavorite }: HistoryPanelProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null)

  const filteredHistory = history.filter(
    (item) =>
      item.input.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.result.solution.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredFavorites = favorites.filter(
    (item) =>
      item.input.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.result.solution.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const exportItem = (item: HistoryItem) => {
    const data = {
      input: item.input,
      solution: item.result.solution,
      steps: item.result.steps,
      timestamp: item.timestamp.toISOString(),
    }

    const text = `Problem: ${data.input}\n\nSolution: ${data.solution}\n\nSteps:\n${data.steps?.join("\n") || "N/A"}\n\nDate: ${item.timestamp.toLocaleDateString()}`
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `math-solution-${item.id}.txt`
    a.click()
  }

  const ItemCard = ({ item }: { item: HistoryItem }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0" onClick={() => onSelectItem(item)}>
            <p className="font-medium text-sm truncate text-primary mb-1">{item.input}</p>
            <p className="text-xs text-muted-foreground truncate mb-2">{item.result.solution}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {item.timestamp.toLocaleDateString()}
              <Badge variant="outline" className="text-xs">
                {item.result.type}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite(item)
              }}
              className="h-8 w-8 p-0"
            >
              <Star className={`h-3 w-3 ${item.favorite ? "fill-current text-primary" : ""}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                copyToClipboard(item.result.solution)
              }}
              className="h-8 w-8 p-0"
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedItem(item)
              }}
              className="h-8 w-8 p-0"
            >
              <Download className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Calculation History
              </span>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search calculations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="history" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  All History ({filteredHistory.length})
                </TabsTrigger>
                <TabsTrigger value="favorites" className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Favorites ({filteredFavorites.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="history" className="mt-4">
                <ScrollArea className="h-[500px]">
                  {filteredHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm ? "No calculations match your search" : "No calculations yet"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredHistory.map((item) => (
                        <ItemCard key={item.id} item={item} />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="favorites" className="mt-4">
                <ScrollArea className="h-[500px]">
                  {filteredFavorites.length === 0 ? (
                    <div className="text-center py-12">
                      <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm ? "No favorites match your search" : "No favorite calculations yet"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Click the star icon on any calculation to add it to favorites
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredFavorites.map((item) => (
                        <ItemCard key={item.id} item={item} />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      {selectedItem && (
        <Dialog open={true} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Calculation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium text-sm mb-2">{selectedItem.input}</p>
                <p className="text-sm text-muted-foreground">{selectedItem.result.solution}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => exportItem(selectedItem)} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Export as Text
                </Button>
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(selectedItem.result.solution)}
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Solution
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
