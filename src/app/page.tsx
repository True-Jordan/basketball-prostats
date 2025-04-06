'use client';

import { useState } from 'react';
import { saveAs } from 'file-saver';

type GameStats = {
  date: string;
  twoPoints: number;
  threePoints: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  rebounds: number;
  steals: number;
  blocks: number;
  assists: number;
};

type Player = {
  id: string;
  name: string;
  games: GameStats[];
};

export default function BasketballStatsApp() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');

  const addPlayer = () => {
    if (!newPlayerName.trim()) return;
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name: newPlayerName,
      games: [],
    };
    setPlayers([...players, newPlayer]);
    setNewPlayerName('');
  };

  const deletePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const addGameStats = (playerId: string, stats: GameStats) => {
    setPlayers(players.map(player =>
      player.id === playerId
        ? { ...player, games: [...player.games, stats] }
        : player
    ));
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(players, null, 2)], {
      type: 'application/json',
    });
    saveAs(blob, 'basketball_stats.json');
  };

  const calculateTotals = (games: GameStats[]) => {
    const totals = {
      gamesPlayed: games.length,
      twoPoints: 0,
      threePoints: 0,
      freeThrowsMade: 0,
      freeThrowsAttempted: 0,
      rebounds: 0,
      steals: 0,
      blocks: 0,
      assists: 0,
    };

    games.forEach(game => {
      totals.twoPoints += game.twoPoints;
      totals.threePoints += game.threePoints;
      totals.freeThrowsMade += game.freeThrowsMade;
      totals.freeThrowsAttempted += game.freeThrowsAttempted;
      totals.rebounds += game.rebounds;
      totals.steals += game.steals;
      totals.blocks += game.blocks;
      totals.assists += game.assists;
    });

    const totalPoints = totals.twoPoints * 2 + totals.threePoints * 3;
    return {
      ...totals,
      totalPoints,
      freeThrowPct:
        totals.freeThrowsAttempted > 0
          ? ((totals.freeThrowsMade / totals.freeThrowsAttempted) * 100).toFixed(1)
          : '0.0',
      reboundsPerGame: (totals.rebounds / games.length).toFixed(1),
      assistsPerGame: (totals.assists / games.length).toFixed(1),
      stealsPerGame: (totals.steals / games.length).toFixed(1),
      blocksPerGame: (totals.blocks / games.length).toFixed(1),
      pointsPerGame: (totalPoints / games.length).toFixed(1),
    };
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">🏀 Basketball Pro Stats</h1>
      <div className="space-x-2">
        <input
          className="border p-2"
          placeholder="Player name"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
        />
        <button className="bg-blue-500 text-white p-2 rounded" onClick={addPlayer}>
          Add Player
        </button>
        <button className="bg-green-500 text-white p-2 rounded" onClick={exportData}>
          Export Data
        </button>
      </div>

      {players.map(player => {
        const totals = calculateTotals(player.games);
        return (
          <div key={player.id} className="border p-4 rounded space-y-2">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{player.name}</h2>
              <button className="text-red-500" onClick={() => deletePlayer(player.id)}>
                Delete
              </button>
            </div>

            <form
              className="grid grid-cols-4 gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const stats = {
                  date: form.date.value,
                  twoPoints: +form.twoPoints.value,
                  threePoints: +form.threePoints.value,
                  freeThrowsMade: +form.ftMade.value,
                  freeThrowsAttempted: +form.ftAtt.value,
                  rebounds: +form.rebounds.value,
                  steals: +form.steals.value,
                  blocks: +form.blocks.value,
                  assists: +form.assists.value,
                };
                addGameStats(player.id, stats);
                form.reset();
              }}
            >
              <input type="date" name="date" className="border p-1" required />
              <input name="twoPoints" placeholder="2PT" className="border p-1" required />
              <input name="threePoints" placeholder="3PT" className="border p-1" required />
              <input name="ftMade" placeholder="FT Made" className="border p-1" required />
              <input name="ftAtt" placeholder="FT Attempted" className="border p-1" required />
              <input name="rebounds" placeholder="Rebounds" className="border p-1" required />
              <input name="steals" placeholder="Steals" className="border p-1" required />
              <input name="blocks" placeholder="Blocks" className="border p-1" required />
              <input name="assists" placeholder="Assists" className="border p-1" required />
              <button className="col-span-4 bg-gray-800 text-white p-2 mt-2" type="submit">
                Add Game Stats
              </button>
            </form>

            <div className="text-sm space-y-1">
              <div>Total Games: {totals.gamesPlayed}</div>
              <div>Total Points: {totals.totalPoints} (PPG: {totals.pointsPerGame})</div>
              <div>FT %: {totals.freeThrowPct}%</div>
              <div>Rebounds: {totals.rebounds} (RPG: {totals.reboundsPerGame})</div>
              <div>Assists: {totals.assists} (APG: {totals.assistsPerGame})</div>
              <div>Steals: {totals.steals} (SPG: {totals.stealsPerGame})</div>
              <div>Blocks: {totals.blocks} (BPG: {totals.blocksPerGame})</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}