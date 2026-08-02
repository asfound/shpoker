import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  const navigate = useNavigate()
  const games = useGameStore((s) => s.games)
  const createGame = useGameStore((s) => s.createGame)

  const [name, setName] = useState('')
  const [chipValue, setChipValue] = useState('0.10')

  function handleCreate() {
    const trimmed = name.trim()
    if (!trimmed) return
    const value = Number(chipValue)
    if (!Number.isFinite(value) || value <= 0) return
    const id = createGame(trimmed, value)
    navigate(`/game/${id}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">shpoker</h1>

      <Card>
        <CardHeader>
          <CardTitle>New game</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="game-name">Game name</Label>
            <Input
              id="game-name"
              placeholder="Friday night"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="chip-value">Chip value ($)</Label>
            <Input
              id="chip-value"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={chipValue}
              onChange={(e) => setChipValue(e.target.value)}
            />
          </div>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            Start game
          </Button>
        </CardContent>
      </Card>

      {games.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-muted-foreground">Games</h2>
          {games
            .slice()
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((game) => (
              <button
                key={game.id}
                onClick={() => navigate(`/game/${game.id}`)}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-left"
              >
                <span className="font-medium">{game.name}</span>
                <span className="text-sm text-muted-foreground">
                  {game.status === 'settled' ? 'Settled' : `${game.players.length} players`}
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
