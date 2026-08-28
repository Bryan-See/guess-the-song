import phonkData from '@/data/phonk.json';
import { Song } from '@/types';

const phonkSongs: Song[] = phonkData.songs.map((s) => ({
  ...s,
  albumArt: '',
  previewUrl: null,
}));

export function getPhonkSongs(): Song[] {
  return phonkSongs;
}

export function getRandomPhonkSong(): Song {
  const idx = Math.floor(Math.random() * phonkSongs.length);
  return phonkSongs[idx];
}
