import React from 'react';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react'
import { Button } from "../../components/ui/Button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
// import { ScrollArea } from "../../components/ui/scroll-area"

export default function SearchModal({ matches = [] }) {
  const [search, setSearch] = useState("")
  const [filteredMatches, setFilteredMatches] = React.useState(matches)

  // Fetch matches if not passed as props
  useEffect(() => {
    if (matches.length === 0) {
      const fetchMatches = async () => {
        try {
          const response = await axiosInstance.get('/live-matches')
          setFilteredMatches(response.data)
        } catch (error) {
          console.error('Error fetching matches:', error)
        }
      }
      fetchMatches()
    }
  }, [matches])

  useEffect(() => {
    setFilteredMatches(matches)
  }, [matches])

  const handleSearch = (value) => {
    setSearch(value)
    const filtered = matches.filter((match) => {
      const searchTerm = value.toLowerCase()
      return (
        match.competition.toLowerCase().includes(searchTerm) ||
        match.homeTeam.toLowerCase().includes(searchTerm) ||
        match.awayTeam.toLowerCase().includes(searchTerm)
      )
    })
    setFilteredMatches(filtered)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="px-6 py-1.5 text-sm font-medium bg-transparent hover:bg-blue-500 hover:border-white hover:text-white  text-gray-800 border-[1px] border-gray-800 bg-blue rounded-2xl">
          Search matches
          <Search className="mr-2 h-4 w-4 ml-2" />
          </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Search Matches</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <Input
            placeholder="Type competition or team name..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="h-9"
          />
          <div className="h-[300px] rounded-md border p-4">
            {filteredMatches.length > 0 ? (
              filteredMatches.map((match) => (
                <div
                  key={match.id}
                  className="mb-4 rounded-lg border p-3 hover:bg-muted/50"
                >
                  <div className="font-medium">{match.competition}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {match.homeTeam} vs {match.awayTeam}
                  </div>
                  <div className="mt-1 text-sm">
                    {match.homeScore} - {match.awayScore}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {match.venue} • {match.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-sm text-muted-foreground">
                {search ? "No matches found" : "No matches available"}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
