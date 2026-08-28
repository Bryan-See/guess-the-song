'use client';

import { Difficulty } from '@/types';
import { DIFFICULTIES, DIFFICULTY_ORDER } from '@/lib/difficulties';

interface Props {
  onSelect: (difficulty: Difficulty) => void;
  selectedDifficulty: Difficulty | null;
}

export default function DifficultySelector({ onSelect, selectedDifficulty }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 w-full max-w-4xl">
      {DIFFICULTY_ORDER.map((key) => {
        const config = DIFFICULTIES[key];
        const isSelected = selectedDifficulty === key;
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`relative overflow-hidden rounded-xl p-4 transition-all duration-300 border-2 hover:scale-105 hover:shadow-lg ${
              isSelected
                ? 'border-white shadow-xl scale-105'
                : 'border-transparent'
            }`}
            style={{
              backgroundColor: `${config.color}20`,
              borderColor: isSelected ? config.color : 'transparent',
            }}
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{ backgroundColor: config.color }}
            />
            <div className="relative z-10">
              <h3
                className="font-bold text-lg"
                style={{ color: config.color }}
              >
                {config.label}
              </h3>
              <p className="text-xs text-gray-400 mt-1">{config.description}</p>
              <p className="text-xs text-gray-500 mt-2">
                0.1s → 1s → 2s → 5s → 15s
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
