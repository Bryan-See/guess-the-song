export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'impossible';

export interface DifficultyConfig {
  label: string;
  description: string;
  minStreams: number;
  maxStreams: number;
  color: string;
  snippetDuration: number; // seconds of audio to play
}

export interface Song {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  previewUrl: string | null;
  streams: number;
  releaseYear: number;
}

export interface GameState {
  difficulty: Difficulty;
  currentSong: Song | null;
  options: string[];
  score: number;
  round: number;
  totalRounds: number;
  isPlaying: boolean;
  hasGuessed: boolean;
  isCorrect: boolean | null;
  streak: number;
  bestStreak: number;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  preview_url: string | null;
  popularity: number;
}

export interface UserPlaylist {
  id: string;
  name: string;
  images: { url: string }[];
  tracks: { total: number };
}
