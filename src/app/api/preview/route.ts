import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const song = searchParams.get('song');
  const artist = searchParams.get('artist');

  if (!song || !artist) {
    return NextResponse.json({ error: 'Missing song or artist' }, { status: 400 });
  }

  try {
    // Try Deezer first — previews start from the beginning of the track
    const deezerUrl = await fetchDeezerPreview(song, artist);
    if (deezerUrl) {
      return NextResponse.json({ previewUrl: deezerUrl, artworkUrl: '' });
    }

    // Fallback to iTunes
    const itunesUrl = await fetchItunesPreview(song, artist);
    if (itunesUrl) {
      return NextResponse.json({ previewUrl: itunesUrl, artworkUrl: '' });
    }

    return NextResponse.json({ error: 'No preview found' }, { status: 404 });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch preview' }, { status: 500 });
  }
}

async function fetchDeezerPreview(song: string, artist: string): Promise<string | null> {
  try {
    const query = encodeURIComponent(`${song} ${artist}`);
    const response = await fetch(`https://api.deezer.com/search?q=${query}&limit=5`);
    if (!response.ok) return null;

    const data = await response.json();
    const results = data.data || [];

    const match = results.find((r: any) => {
      const trackName = r.title?.toLowerCase() || '';
      const artistName = r.artist?.name?.toLowerCase() || '';
      return (
        trackName.includes(song.toLowerCase()) ||
        song.toLowerCase().includes(trackName)
      ) && (
        artistName.includes(artist.toLowerCase().split(' ft.')[0].split(' &')[0]) ||
        artist.toLowerCase().includes(artistName.split(' &')[0])
      );
    }) || results[0];

    return match?.preview || null;
  } catch {
    return null;
  }
}

async function fetchItunesPreview(song: string, artist: string): Promise<string | null> {
  try {
    const query = encodeURIComponent(`${song} ${artist}`);
    const response = await fetch(
      `https://itunes.apple.com/search?term=${query}&media=music&limit=5`
    );
    if (!response.ok) return null;

    const data = await response.json();
    const results = data.results || [];

    const match = results.find((r: any) => {
      const trackName = r.trackName?.toLowerCase() || '';
      const artistName = r.artistName?.toLowerCase() || '';
      return (
        trackName.includes(song.toLowerCase()) ||
        song.toLowerCase().includes(trackName)
      ) && (
        artistName.includes(artist.toLowerCase().split(' ft.')[0].split(' &')[0]) ||
        artist.toLowerCase().includes(artistName.split(' &')[0])
      );
    }) || results[0];

    return match?.previewUrl || null;
  } catch {
    return null;
  }
}
