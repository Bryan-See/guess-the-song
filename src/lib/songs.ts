import { Song, Difficulty } from '@/types';
import { DIFFICULTIES } from './difficulties';
import songsData from '@/data/songs.json';

const SONG_DATABASE: Song[] = songsData.map(s => ({
  ...s,
  albumArt: '',
  previewUrl: null,
}));

export function getSongsForDifficulty(difficulty: Difficulty): Song[] {
  const config = DIFFICULTIES[difficulty];
  return SONG_DATABASE.filter(
    song => song.streams >= config.minStreams && song.streams < config.maxStreams
  );
}

export function getRandomSong(difficulty: Difficulty): Song {
  const songs = getSongsForDifficulty(difficulty);
  return songs[Math.floor(Math.random() * songs.length)];
}

export function getOptions(correctSong: Song, difficulty: Difficulty, count: number = 4): string[] {
  const songs = getSongsForDifficulty(difficulty);
  const correctAnswer = `${correctSong.name} - ${correctSong.artist}`;
  const otherSongs = songs
    .filter(s => s.id !== correctSong.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, count - 1)
    .map(s => `${s.name} - ${s.artist}`);

  const options = [correctAnswer, ...otherSongs].sort(() => Math.random() - 0.5);
  return options;
}

export function getAllSongs(): Song[] {
  return SONG_DATABASE;
}
