'use client';

import { useState, useRef, useEffect } from 'react';
import { Song } from '@/types';

interface Props {
  songs: Song[];
  onGuess: (songName: string) => void;
  disabled: boolean;
}

export default function SongSearch({ songs, onGuess, disabled }: Props) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = query.length > 0
    ? songs
        .filter(s => {
          const searchStr = `${s.name} ${s.artist}`.toLowerCase();
          return searchStr.includes(query.toLowerCase());
        })
        .slice(0, 8)
    : [];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const handleSelect = (song: Song) => {
    const answer = `${song.name} - ${song.artist}`;
    setQuery('');
    setShowDropdown(false);
    onGuess(answer);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered.length > 0) {
        handleSelect(filtered[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative w-full max-w-lg">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Start typing a song name or artist..."
        className="w-full px-4 py-3 bg-gray-800/80 border-2 border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      />

      {showDropdown && filtered.length > 0 && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-xl overflow-hidden shadow-2xl max-h-64 overflow-y-auto"
        >
          {filtered.map((song, i) => (
            <button
              key={song.id}
              onClick={() => handleSelect(song)}
              className={`w-full px-4 py-2.5 text-left transition-colors flex flex-col ${
                i === selectedIndex
                  ? 'bg-green-500/20 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="font-medium text-sm">{song.name}</span>
              <span className="text-xs text-gray-400">{song.artist}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
