'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { UserPlaylist } from '@/types';

interface Props {
  onStartPersonalGame: (tracks: any[]) => void;
}

export default function PersonalMode({ onStartPersonalGame }: Props) {
  const { data: session } = useSession();
  const [playlists, setPlaylists] = useState<UserPlaylist[]>([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<'top' | 'recent' | 'playlist'>('top');

  useEffect(() => {
    if (session && source === 'playlist') {
      fetchPlaylists();
    }
  }, [session, source]);

  const fetchPlaylists = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/spotify?token=${(session as any).accessToken}&action=playlists`);
      const data = await res.json();
      setPlaylists(data.items || []);
    } catch (err) {
      console.error('Failed to fetch playlists:', err);
    }
    setLoading(false);
  };

  const startGame = async (playlistId?: string) => {
    if (!session) return;
    setLoading(true);

    try {
      let action = source === 'recent' ? 'recently-played' : 'top-tracks';
      const res = await fetch(`/api/spotify?token=${(session as any).accessToken}&action=${action}`);
      const data = await res.json();
      const tracks = data.items?.map((item: any) => item.track || item) || [];
      onStartPersonalGame(tracks);
    } catch (err) {
      console.error('Failed to start personal game:', err);
    }
    setLoading(false);
  };

  if (!session) {
    return (
      <div className="text-center text-gray-400 p-8 bg-gray-800/30 rounded-2xl border border-gray-700">
        <p className="text-lg mb-2">Connect your Spotify account</p>
        <p className="text-sm">to play with your personal music library</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4 text-center">Personal Mode</h3>
        <p className="text-sm text-gray-400 mb-4 text-center">
          Guess songs from your own listening history
        </p>

        <div className="flex gap-2 mb-4">
          {(['top', 'recent'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSource(s)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                source === s
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                  : 'bg-gray-700/50 text-gray-400 border border-gray-600 hover:border-gray-500'
              }`}
            >
              {s === 'top' ? 'Top Tracks' : 'Recently Played'}
            </button>
          ))}
        </div>

        <button
          onClick={() => startGame()}
          disabled={loading}
          className="w-full py-3 bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? 'Loading...' : 'Start Personal Game'}
        </button>
      </div>
    </div>
  );
}
