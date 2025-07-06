"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Search, Star, Clock } from "lucide-react"

interface HistoryItem {
  id: string
  input: string
  result: any
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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              History & Favorites
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          <Tabs defaultValue="history" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="history">History ({filteredHistory.length})</TabsTrigger>
              <TabsTrigger value="favorites">Favorites ({filteredFavorites.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                {filteredHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "No matching history items" : "No history yet"}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredHistory.map((item) => (
                      <Card key={item.id} className="hover:bg-muted/50 cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0" onClick={() => onSelectItem(item)}>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {item.result.type}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {item.timestamp.toLocaleDateString()} {item.timestamp.toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="font-medium text-sm mb-1 truncate">{item.input}</p>
                              <p className="text-sm text-muted-foreground truncate">{item.result.solution}</p>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onToggleFavorite(item)
                                }}
                              >
                                <Star className={`h-4 w-4 ${item.favorite ? "fill-current text-yellow-500" : ""}`} />
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
              <ScrollArea className="h-full">
                {filteredFavorites.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "No matching favorites" : "No favorites yet"}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredFavorites.map((item) => (
                      <Card key={item.id} className="hover:bg-muted/50 cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0" onClick={() => onSelectItem(item)}>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {item.result.type}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {item.timestamp.toLocaleDateString()} {item.timestamp.toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="font-medium text-sm mb-1 truncate">{item.input}</p>
                              <p className="text-sm text-muted-foreground truncate">{item.result.solution}</p>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onToggleFavorite(item)
                                }}
                              >
                                <Star className="h-4 w-4 fill-current text-yellow-500" />
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
        </CardContent>
      </Card>
    </div>
  )
}
