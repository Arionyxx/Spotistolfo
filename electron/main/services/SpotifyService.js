import crypto from 'crypto';

export class SpotifyService {
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID || 'your-client-id-here';
    this.redirectUri = 'http://localhost:3000/callback';
    this.scopes = [
      'playlist-read-private',
      'playlist-read-collaborative',
      'user-read-private',
      'user-read-email'
    ];
  }

  // Generate PKCE code challenge
  generateCodeChallenge() {
    const codeVerifier = this.generateCodeVerifier();
    const hashed = crypto.createHash('sha256').update(codeVerifier).digest();
    const codeChallenge = this.base64URLEncode(hashed);
    
    // Store code verifier in memory for later use
    this.codeVerifier = codeVerifier;
    
    return { codeChallenge, codeVerifier };
  }

  generateCodeVerifier() {
    return this.base64URLEncode(crypto.randomBytes(32));
  }

  base64URLEncode(buffer) {
    return buffer.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  async getAuthUrl() {
    const { codeChallenge } = this.generateCodeChallenge();
    const state = this.generateCodeVerifier();
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      scope: this.scopes.join(' '),
      state: state
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  async handleCallback(code) {
    if (!this.codeVerifier) {
      throw new Error('Code verifier not found. Please try the authentication flow again.');
    }

    const tokenData = await this.exchangeCodeForToken(code);
    const userData = await this.getUser(tokenData.access_token);

    return {
      ...tokenData,
      user: userData
    };
  }

  async exchangeCodeForToken(code) {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: this.redirectUri,
      client_id: this.clientId,
      code_verifier: this.codeVerifier
    });

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Add user_id to token data for easier access
    data.user_id = data.user?.id || null;
    
    return data;
  }

  async refreshToken(refreshToken) {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.clientId
    });

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async getUser(accessToken) {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user data: ${response.statusText}`);
    }

    return await response.json();
  }

  async getPlaylists(accessToken) {
    let playlists = [];
    let offset = 0;
    const limit = 50;

    try {
      while (true) {
        const response = await fetch(
          `https://api.spotify.com/v1/me/playlists?offset=${offset}&limit=${limit}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch playlists: ${response.statusText}`);
        }

        const data = await response.json();
        
        playlists = playlists.concat(data.items.map(playlist => ({
          id: playlist.id,
          name: playlist.name,
          description: playlist.description,
          image: playlist.images.length > 0 ? playlist.images[0].url : null,
          trackCount: playlist.tracks.total,
          owner: playlist.owner.display_name,
          isPublic: playlist.public,
          isCollaborative: playlist.collaborative,
          href: playlist.href,
          uri: playlist.uri
        })));

        if (!data.next) {
          break;
        }

        offset += limit;
      }

      return playlists;
    } catch (error) {
      console.error('Error fetching playlists:', error);
      throw error;
    }
  }

  async getPlaylistTracks(accessToken, playlistId) {
    let tracks = [];
    let offset = 0;
    const limit = 100;

    try {
      while (true) {
        const response = await fetch(
          `https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=${offset}&limit=${limit}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch playlist tracks: ${response.statusText}`);
        }

        const data = await response.json();
        
        const playlistTracks = data.items
          .filter(item => item.track && !item.track.is_local && item.track.type === 'track')
          .map(item => ({
            id: item.track.id,
            name: item.track.name,
            artist: item.track.artists.map(artist => artist.name).join(', '),
            album: item.track.album.name,
            duration: item.track.duration_ms,
            trackNumber: item.track.track_number,
            discNumber: item.track.disc_number,
            previewUrl: item.track.preview_url,
            spotifyUrl: item.track.external_urls.spotify,
            images: item.track.album.images,
            explicit: item.track.explicit,
            addedAt: item.added_at,
            popularity: item.track.popularity
          }));

        tracks = tracks.concat(playlistTracks);

        if (!data.next) {
          break;
        }

        offset += limit;
      }

      return tracks;
    } catch (error) {
      console.error('Error fetching playlist tracks:', error);
      throw error;
    }
  }

  async searchTrack(accessToken, query, type = 'track', limit = 10) {
    const params = new URLSearchParams({
      q: query,
      type: type,
      limit: limit.toString()
    });

    const response = await fetch(`https://api.spotify.com/v1/search?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.tracks?.items || [];
  }
}