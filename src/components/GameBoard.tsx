'use client';

import { useState, useCallback, useEffect } from 'react';
import { Difficulty, Song } from '@/types';
import { DIFFICULTIES, CLIP_DURATIONS } from '@/lib/difficulties';
import { getAllSongs } from '@/lib/songs';
import AudioPlayer from './AudioPlayer';
import SongSearch from './SongSearch';

interface Props {
  difficulty: Difficulty;
  onBack: () => void;
  personalTracks?: Song[];
  modeLabel?: string;
}

const TOTAL_ROUNDS = 10;
const POINTS_PER_CLIP = [1000, 750, 500, 250, 100];

export default function GameBoard({ difficulty, onBack, personalTracks, modeLabel }: Props) {
  const config = DIFFICULTIES[difficulty];
  const isPersonal = !!personalTracks && personalTracks.length > 0;
  const allSongs = isPersonal ? personalTracks : getAllSongs();
  const [playedSongIds, setPlayedSongIds] = useState<Set<string>>(new Set());

  const getNextSong = useCallback((): Song => {
    const songPool = isPersonal ? personalTracks! : getAllSongs();
    const available = songPool.filter(s => !playedSongIds.has(s.id));
    const pool = available.length > 0 ? available : songPool;
    const song = pool[Math.floor(Math.random() * pool.length)];
    setPlayedSongIds(prev => new Set(prev).add(song.id));
    return song;
  }, [isPersonal, personalTracks, playedSongIds]);

  const [currentSong, setCurrentSong] = useState<Song>(() => getNextSong());
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [clipIndex, setClipIndex] = useState(0);
  const [hasGuessed, setHasGuessed] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [roundOver, setRoundOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [roundScores, setRoundScores] = useState<number[]>([]);

  const fetchPreview = useCallback(async (song: Song) => {
    setLoadingPreview(true);
    setPreviewUrl(null);
    try {
      const res = await fetch(
        `/api/preview?song=${encodeURIComponent(song.name)}&artist=${encodeURIComponent(song.artist)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.previewUrl) {
          setPreviewUrl(data.previewUrl);
          setLoadingPreview(false);
          return;
        }
      }
    } catch {
      // Preview unavailable
    }
    setLoadingPreview(false);
    setPreviewUrl(null);
  }, []);

  useEffect(() => {
    fetchPreview(currentSong);
  }, [currentSong, fetchPreview]);

  useEffect(() => {
    if (!loadingPreview && !previewUrl && !roundOver && !gameOver) {
      const timer = setTimeout(() => {
        if (round >= TOTAL_ROUNDS) {
          setGameOver(true);
        } else {
          setCurrentSong(getNextSong());
          setRound(prev => prev + 1);
          setClipIndex(0);
          setHasGuessed(false);
          setIsCorrect(null);
          setRoundOver(false);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [loadingPreview, previewUrl, roundOver, gameOver, round, getNextSong]);

  const handleGuess = (answer: string) => {
    if (hasGuessed || roundOver) return;

    const correctAnswer = `${currentSong.name} - ${currentSong.artist}`;
    const correct = answer === correctAnswer;

    setHasGuessed(true);
    setIsCorrect(correct);

    if (correct) {
      const points = POINTS_PER_CLIP[clipIndex] || 100;
      setScore(prev => prev + points);
      setRoundScores(prev => [...prev, points]);
      setRoundOver(true);
    } else {
      // Wrong guess — move to next clip
      if (clipIndex >= CLIP_DURATIONS.length - 1) {
        setRoundScores(prev => [...prev, 0]);
        setRoundOver(true);
      } else {
        setClipIndex(prev => prev + 1);
        setHasGuessed(false);
        setIsCorrect(null);
      }
    }
  };

  const handleSkip = () => {
    if (clipIndex >= CLIP_DURATIONS.length - 1) {
      setRoundScores(prev => [...prev, 0]);
      setRoundOver(true);
    } else {
      setClipIndex(prev => prev + 1);
    }
  };

  const nextRound = () => {
    if (round >= TOTAL_ROUNDS) {
      setGameOver(true);
      return;
    }

    setCurrentSong(getNextSong());
    setRound(prev => prev + 1);
    setClipIndex(0);
    setHasGuessed(false);
    setIsCorrect(null);
    setRoundOver(false);
  };

  const restartGame = () => {
    setPlayedSongIds(new Set());
    setRound(1);
    setScore(0);
    setClipIndex(0);
    setHasGuessed(false);
    setIsCorrect(null);
    setRoundOver(false);
    setGameOver(false);
    setRoundScores([]);
    const songPool = isPersonal ? personalTracks! : getAllSongs();
    const song = songPool[Math.floor(Math.random() * songPool.length)];
    setPlayedSongIds(new Set([song.id]));
    setCurrentSong(song);
  };

  if (gameOver) {
    const maxPossible = TOTAL_ROUNDS * 1000;
    const accuracy = Math.round((score / maxPossible) * 100);
    return (
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <h2 className="text-4xl font-bold">Game Over!</h2>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 text-center">
          <p className="text-6xl font-bold mb-2" style={{ color: config.color }}>
            {score}
          </p>
          <p className="text-gray-400 mb-4">out of {maxPossible} points</p>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="bg-gray-700/50 rounded-lg p-3">
              <p className="text-2xl font-bold">{accuracy}%</p>
              <p className="text-gray-400">Score</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3">
              <p className="text-2xl font-bold">{roundScores.filter(s => s === 1000).length}</p>
              <p className="text-gray-400">Perfect (0.1s)</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3">
              <p className="text-2xl font-bold">{roundScores.filter(s => s > 0).length}/{TOTAL_ROUNDS}</p>
              <p className="text-gray-400">Correct</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={restartGame}
            className="px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
            style={{ backgroundColor: config.color }}
          >
            Play Again
          </button>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-700 rounded-xl font-semibold hover:bg-gray-600 transition-all hover:scale-105"
          >
            Change Difficulty
          </button>
        </div>
      </div>
    );
  }

  const clipLabel = CLIP_DURATIONS[clipIndex] >= 1
    ? `${CLIP_DURATIONS[clipIndex]}s`
    : `${Math.round(CLIP_DURATIONS[clipIndex] * 1000)}ms`;

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-2xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Back
        </button>
        <div className="flex items-center gap-3">
          <span
            className="px-3 py-1 rounded-full text-sm font-medium"
            style={{
              backgroundColor: modeLabel ? '#ef444430' : isPersonal ? '#1DB95430' : `${config.color}30`,
              color: modeLabel ? '#ef4444' : isPersonal ? '#1DB954' : config.color,
            }}
          >
            {modeLabel || (isPersonal ? 'Personal' : config.label)}
          </span>
          <span className="text-gray-400 text-sm">
            Round {round}/{TOTAL_ROUNDS}
          </span>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Score</p>
          <p className="font-bold text-lg">{score}</p>
        </div>
      </div>

      {/* Points available */}
      {!roundOver && (
        <p className="text-sm text-gray-400">
          Guess now for <span className="text-white font-bold">{POINTS_PER_CLIP[clipIndex]}</span> points
        </p>
      )}

      {/* Audio Player */}
      <AudioPlayer
        previewUrl={previewUrl}
        clipIndex={clipIndex}
        loading={loadingPreview}
        onSkip={handleSkip}
        hasGuessed={roundOver}
        gameOver={roundOver}
      />

      {/* Search Input */}
      {!roundOver && (
        <SongSearch
          songs={allSongs}
          onGuess={handleGuess}
          disabled={roundOver}
        />
      )}

      {/* Skip Song + Wrong guess feedback */}
      {!roundOver && (
        <div className="flex flex-col items-center gap-2">
          {hasGuessed && !isCorrect && (
            <p className="text-red-400 text-sm animate-fade-in">
              Wrong! Try again with a longer clip...
            </p>
          )}
          <button
            onClick={() => {
              setRoundScores(prev => [...prev, 0]);
              setRoundOver(true);
            }}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Skip Song
          </button>
        </div>
      )}

      {/* Round result */}
      {roundOver && (
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          {isCorrect ? (
            <div className="text-center">
              <p className="text-green-400 text-lg font-bold">
                Correct! +{POINTS_PER_CLIP[clipIndex]} pts
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Got it at the {clipLabel} clip
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-red-400 text-lg font-bold">Not this time</p>
              <p className="text-gray-400 text-sm mt-1">
                It was: <span className="text-white font-medium">{currentSong.name}</span> by{' '}
                <span className="text-white font-medium">{currentSong.artist}</span>
              </p>
            </div>
          )}
          <button
            onClick={nextRound}
            className="px-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-all hover:scale-105"
          >
            {round >= TOTAL_ROUNDS ? 'See Results' : 'Next Song →'}
          </button>
        </div>
      )}
    </div>
  );
}
