"use client"

import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

interface SuggestedQueriesProps {
  queries: string[]
  onQueryClick: (query: string) => void
}

export function SuggestedQueries({ queries, onQueryClick }: SuggestedQueriesProps) {
  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Sparkles className="h-4 w-4" />
        <span>Suggested queries</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {queries.map((query, index) => (
          <Button key={index} variant="outline" size="sm" onClick={() => onQueryClick(query)} className="text-sm">
            {query}
          </Button>
        ))}
      </div>
    </div>
  )
}
