const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export async function getAccessToken(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    }),
  });

  return response.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
}> {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  return response.json();
}

export async function getUserTopTracks(accessToken: string, timeRange: string = 'medium_term', limit: number = 50) {
  const response = await fetch(
    `${SPOTIFY_API_BASE}/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) throw new Error('Failed to fetch top tracks');
  return response.json();
}

export async function getUserPlaylists(accessToken: string, limit: number = 50) {
  const response = await fetch(
    `${SPOTIFY_API_BASE}/me/playlists?limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) throw new Error('Failed to fetch playlists');
  return response.json();
}

export async function getPlaylistTracks(accessToken: string, playlistId: string) {
  const response = await fetch(
    `${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks?limit=100`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) throw new Error('Failed to fetch playlist tracks');
  return response.json();
}

export async function getRecentlyPlayed(accessToken: string, limit: number = 50) {
  const response = await fetch(
    `${SPOTIFY_API_BASE}/me/player/recently-played?limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) throw new Error('Failed to fetch recently played');
  return response.json();
}

export function getSpotifyAuthUrl(): string {
  const scopes = [
    'user-read-recently-played',
    'user-top-read',
    'playlist-read-private',
    'playlist-read-collaborative',
    'streaming',
    'user-read-playback-state',
  ].join(' ');

  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
    response_type: 'code',
    redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!,
    scope: scopes,
    show_dialog: 'true',
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}
