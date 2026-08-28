import { Difficulty, DifficultyConfig } from '@/types';

export const CLIP_DURATIONS = [0.1, 1, 2, 5, 15] as const;

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: {
    label: 'Easy',
    description: 'Mega hits with 1B+ streams',
    minStreams: 1_000_000_000,
    maxStreams: Infinity,
    color: '#22c55e',
    snippetDuration: 0.1,
  },
  medium: {
    label: 'Medium',
    description: 'Popular songs with 500M-1B streams',
    minStreams: 500_000_000,
    maxStreams: 1_000_000_000,
    color: '#eab308',
    snippetDuration: 0.1,
  },
  hard: {
    label: 'Hard',
    description: 'Well-known songs with 100M-500M streams',
    minStreams: 100_000_000,
    maxStreams: 500_000_000,
    color: '#f97316',
    snippetDuration: 0.1,
  },
  expert: {
    label: 'Expert',
    description: 'Deep cuts with 10M-100M streams',
    minStreams: 10_000_000,
    maxStreams: 100_000_000,
    color: '#ef4444',
    snippetDuration: 0.1,
  },
  impossible: {
    label: 'Impossible',
    description: 'Obscure tracks with <10M streams',
    minStreams: 0,
    maxStreams: 10_000_000,
    color: '#7c3aed',
    snippetDuration: 0.1,
  },
};

export const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard', 'expert', 'impossible'];
