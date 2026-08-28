import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get('token');
  const action = searchParams.get('action');

  if (!accessToken) {
    return NextResponse.json({ error: 'No access token' }, { status: 401 });
  }

  const headers = { Authorization: `Bearer ${accessToken}` };
  const baseUrl = 'https://api.spotify.com/v1';

  try {
    let response;

    switch (action) {
      case 'top-tracks':
        response = await fetch(`${baseUrl}/me/top/tracks?limit=50&time_range=medium_term`, { headers });
        break;
      case 'playlists':
        response = await fetch(`${baseUrl}/me/playlists?limit=50`, { headers });
        break;
      case 'recently-played':
        response = await fetch(`${baseUrl}/me/player/recently-played?limit=50`, { headers });
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (!response.ok) {
      return NextResponse.json({ error: 'Spotify API error' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
