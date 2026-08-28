'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { CLIP_DURATIONS } from '@/lib/difficulties';

interface Props {
  previewUrl: string | null;
  clipIndex: number;
  loading: boolean;
  onSkip: () => void;
  hasGuessed: boolean;
  gameOver: boolean;
}

export default function AudioPlayer({ previewUrl, clipIndex, loading, onSkip, hasGuessed, gameOver }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);

  const currentDuration = CLIP_DURATIONS[clipIndex];
  const isLastClip = clipIndex >= CLIP_DURATIONS.length - 1;

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    return () => stopPlayback();
  }, [stopPlayback]);

  // Reset when clip index changes (new clip level)
  useEffect(() => {
    stopPlayback();
    setProgress(0);
    setHasPlayed(false);
  }, [clipIndex, previewUrl, stopPlayback]);

  const playSnippet = () => {
    if (!previewUrl || isPlaying) return;

    const audio = new Audio(previewUrl);
    audioRef.current = audio;

    audio.currentTime = 0;
    audio.play().catch(() => {});

    setIsPlaying(true);
    setHasPlayed(true);
    startTimeRef.current = Date.now();

    const durationMs = currentDuration * 1000;

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(elapsed / durationMs, 1);
      setProgress(pct * 100);

      if (pct >= 1) {
        stopPlayback();
        setProgress(100);
      }
    }, 16);
  };

  const durationLabel = currentDuration >= 1
    ? `${currentDuration}s`
    : `${Math.round(currentDuration * 1000)}ms`;

  return (
    <div className="w-full max-w-lg">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-5 border border-gray-700">
        {/* Clip duration indicators */}
        <div className="flex items-center justify-center gap-1.5 mb-4">
          {CLIP_DURATIONS.map((dur, i) => {
            const label = dur >= 1 ? `${dur}s` : `${Math.round(dur * 1000)}ms`;
            const isActive = i === clipIndex;
            const isPast = i < clipIndex;
            return (
              <div
                key={dur}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-green-500 text-black scale-110'
                    : isPast
                      ? 'bg-gray-600 text-gray-400 line-through'
                      : 'bg-gray-700/50 text-gray-500'
                }`}
              >
                {label}
              </div>
            );
          })}
        </div>

        {/* Play button + progress */}
        <div className="flex items-center gap-4">
          <button
            onClick={playSnippet}
            disabled={isPlaying || loading || !previewUrl || gameOver}
            className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center transition-all duration-300 ${
              loading
                ? 'bg-gray-600 cursor-wait'
                : isPlaying
                  ? 'bg-green-500 shadow-lg shadow-green-500/30'
                  : !previewUrl || gameOver
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-white hover:bg-gray-200 hover:scale-110 cursor-pointer'
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
            ) : isPlaying ? (
              <div className="flex gap-0.5">
                <div className="w-1 h-4 bg-white rounded animate-pulse" />
                <div className="w-1 h-4 bg-white rounded animate-pulse [animation-delay:150ms]" />
                <div className="w-1 h-4 bg-white rounded animate-pulse [animation-delay:300ms]" />
              </div>
            ) : (
              <svg className="w-6 h-6 text-gray-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <div className="flex-1">
            <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>Playing {durationLabel}</span>
              <button
                onClick={playSnippet}
                disabled={isPlaying || loading || !previewUrl || gameOver}
                className="text-green-400 hover:text-green-300 disabled:text-gray-600 font-medium"
              >
                Replay
              </button>
            </div>
          </div>
        </div>

        {/* Skip button */}
        {!hasGuessed && !gameOver && hasPlayed && !isLastClip && (
          <button
            onClick={onSkip}
            disabled={isPlaying}
            className="w-full mt-3 py-2 text-sm text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skip → play {CLIP_DURATIONS[clipIndex + 1] >= 1 ? `${CLIP_DURATIONS[clipIndex + 1]}s` : `${Math.round(CLIP_DURATIONS[clipIndex + 1] * 1000)}ms`} clip
          </button>
        )}

        {!previewUrl && !loading && (
          <p className="text-center text-sm text-red-400 mt-3">
            No preview available — skipping...
          </p>
        )}
      </div>
    </div>
  );
}
