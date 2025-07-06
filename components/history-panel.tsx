"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X, History, Star, Search, Calendar, Download, Trash2, Copy, Clock } from "lucide-react"

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
  const [filterType, setFilterType] = useState<"all" | "algebra" | "calculus" | "geometry">("all")
  const [activeTab, setActiveTab] = useState<"recent" | "favorites">("recent")

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.input.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.result.solution.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterType === "all" || item.result.type.toLowerCase().includes(filterType.toLowerCase())

    return matchesSearch && matchesFilter
  })

  const filteredFavorites = favorites.filter((item) => {
    const matchesSearch =
      item.input.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.result.solution.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const exportHistory = () => {
    const data = {
      history: history,
      favorites: favorites,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "math-calculator-history.json"
    a.click()
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Calculation History
          </DialogTitle>
          <DialogDescription>View and manage your previous calculations and favorite problems</DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          {/* Search and Filter */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search calculations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={exportHistory} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="recent" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent ({history.length})
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Favorites ({favorites.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="flex-1 overflow-hidden">
              <ScrollArea className="h-[500px]">
                {filteredHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      {searchTerm ? "No calculations match your search" : "No calculations yet"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredHistory.map((item) => (
                      <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer group">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0" onClick={() => onSelectItem(item)}>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {item.result.type}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(item.timestamp)}
                                </span>
                              </div>
                              <p className="font-medium text-sm mb-1 truncate">{item.input}</p>
                              <p className="text-sm text-muted-foreground truncate">{item.result.solution}</p>
                              {item.result.steps && item.result.steps.length > 0 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {item.result.steps.length} solution steps
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  copyToClipboard(item.input)
                                }}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onToggleFavorite(item)
                                }}
                              >
                                <Star className={`h-3 w-3 ${item.favorite ? "fill-current text-primary" : ""}`} />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="favorites" className="flex-1 overflow-hidden">
              <ScrollArea className="h-[500px]">
                {filteredFavorites.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
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
                      <Card
                        key={item.id}
                        className="hover:shadow-md transition-shadow cursor-pointer group border-primary/20"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0" onClick={() => onSelectItem(item)}>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                                  {item.result.type}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(item.timestamp)}
                                </span>
                                <Star className="h-3 w-3 fill-current text-primary" />
                              </div>
                              <p className="font-medium text-sm mb-1 truncate">{item.input}</p>
                              <p className="text-sm text-muted-foreground truncate">{item.result.solution}</p>
                              {item.result.steps && item.result.steps.length > 0 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {item.result.steps.length} solution steps
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  copyToClipboard(item.input)
                                }}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onToggleFavorite(item)
                                }}
                                className="hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
