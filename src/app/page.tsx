'use client';

import { useState } from 'react';
import { Difficulty, Song } from '@/types';
import DifficultySelector from '@/components/DifficultySelector';
import GameBoard from '@/components/GameBoard';
import SpotifyLogin from '@/components/SpotifyLogin';
import PersonalMode from '@/components/PersonalMode';
import { getPhonkSongs } from '@/lib/phonk';

type GameMode = 'menu' | 'popular' | 'personal' | 'phonk';

export default function Home() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [gameStarted, setGameStarted] = useState(false);
  const [personalTracks, setPersonalTracks] = useState<Song[]>([]);

  const handleDifficultySelect = (d: Difficulty) => {
    setDifficulty(d);
  };

  const startGame = () => {
    if (difficulty) {
      setGameStarted(true);
    }
  };

  const startPhonkGame = () => {
    setPersonalTracks(getPhonkSongs());
    setGameStarted(true);
  };

  const handleBack = () => {
    setGameStarted(false);
    setDifficulty(null);
    setPersonalTracks([]);
    setGameMode('menu');
  };

  const handleStartPersonalGame = (tracks: any[]) => {
    const seen = new Set<string>();
    const songs: Song[] = [];
    for (const t of tracks) {
      if (seen.has(t.id)) continue;
      seen.add(t.id);
      songs.push({
        id: t.id,
        name: t.name,
        artist: t.artists?.map((a: any) => a.name).join(', ') || 'Unknown',
        album: t.album?.name || '',
        albumArt: t.album?.images?.[0]?.url || '',
        previewUrl: t.preview_url || null,
        streams: t.popularity || 0,
        releaseYear: parseInt(t.album?.release_date?.split('-')[0]) || 2020,
      });
    }
    setPersonalTracks(songs);
    setGameStarted(true);
  };

  if (gameStarted && (difficulty || personalTracks.length > 0)) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6">
        <GameBoard
          difficulty={difficulty || 'medium'}
          onBack={handleBack}
          personalTracks={personalTracks.length > 0 ? personalTracks : undefined}
          modeLabel={gameMode === 'phonk' ? 'Phonk' : undefined}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 gap-8">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent -z-10" />

      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-5xl sm:text-7xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
          Guess The Song
        </h1>
        <p className="text-gray-400 text-lg">
          How well do you know your music?
        </p>
      </div>

      {/* Spotify Connection */}
      <SpotifyLogin />

      {/* Game Mode Tabs */}
      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={() => setGameMode('popular')}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
            gameMode === 'popular'
              ? 'bg-white text-black'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Popular Songs
        </button>
        <button
          onClick={() => setGameMode('phonk')}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
            gameMode === 'phonk'
              ? 'bg-red-500 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Phonk
        </button>
        <button
          onClick={() => setGameMode('personal')}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
            gameMode === 'personal'
              ? 'bg-white text-black'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          My Library
        </button>
      </div>

      {/* Popular Mode */}
      {gameMode === 'popular' && (
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <h2 className="text-xl font-semibold">Choose Difficulty</h2>
          <DifficultySelector
            onSelect={handleDifficultySelect}
            selectedDifficulty={difficulty}
          />
          {difficulty && (
            <button
              onClick={startGame}
              className="px-8 py-3 bg-white text-black rounded-xl font-bold text-lg hover:bg-gray-200 transition-all hover:scale-105 animate-fade-in"
            >
              Start Game
            </button>
          )}
        </div>
      )}

      {/* Phonk Mode */}
      {gameMode === 'phonk' && (
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-red-500/30 text-center max-w-md">
            <h3 className="text-2xl font-bold text-red-400 mb-2">Phonk Mode</h3>
            <p className="text-gray-400 text-sm mb-4">
              100 phonk tracks from Kordhell, DXRK, INTERWORLD, KSLV Noh, and more. How well do you know your drift music?
            </p>
            <button
              onClick={startPhonkGame}
              className="px-8 py-3 bg-red-500 hover:bg-red-400 text-white rounded-xl font-bold text-lg transition-all hover:scale-105"
            >
              Start Phonk Game
            </button>
          </div>
        </div>
      )}

      {/* Personal Mode */}
      {gameMode === 'personal' && (
        <PersonalMode onStartPersonalGame={handleStartPersonalGame} />
      )}

      {/* Info */}
      {gameMode === 'menu' && (
        <div className="text-center text-gray-500 text-sm max-w-md">
          <p>Select a mode above to begin. Popular Songs mode challenges you with tracks from different stream tiers. Phonk mode tests your knowledge of drift/phonk music. My Library mode uses your Spotify listening history.</p>
        </div>
      )}
    </main>
  );
}
