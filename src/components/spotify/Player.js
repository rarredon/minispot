import React from 'react';
import { getHeaders } from '../../utils.js';

class Player extends React.Component {
  constructor (props) {
    super(props);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const token = JSON.parse(localStorage.getItem('test')).access_token;
      const player = new window.Spotify.Player({
        name: 'Web Playback SDK Quick Start Player',
        getOAuthToken: cb => { cb(token); }
      });

      // Error handling
      player.addListener('initialization_error', ({ message }) => { console.error(message); });
      player.addListener('authentication_error', ({ message }) => { console.error(message); });
      player.addListener('account_error', ({ message }) => { console.error(message); });
      player.addListener('playback_error', ({ message }) => { console.error(message); });

      // Playback status updates
      player.addListener('player_state_changed', state => {});

      // Ready
      player.addListener('ready', ({ device_id }) => {
        this.device_id = device_id;
      });

      // Not Ready
      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });

      // Connect to the player!
      player.connect();

      window.Player = this;
    };
  }

  async playUri(spotify_uri, type) {
    const uris = await this.getUris(spotify_uri, type);
    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.device_id}`, {
      method: 'PUT',
      body: JSON.stringify({ uris: uris }),
      headers: getHeaders(),
    });
  }

  async getUris(spotify_uri, type) {

    var url;
    const id = spotify_uri.split(':')[2];
    let uris = [];
    if (type === 'track') {
      return [spotify_uri];
    }
    else if (type  === 'artist') {
      // get top tracks for artist
      url = new URL(`https://api.spotify.com/v1/artists/${id}/top-tracks?country=from_token`);
    } else if (type === 'album') {
      // get album tracks
      url = new URL(`https://api.spotify.com/v1/albums/${id}/tracks`);
    } else if (type === 'playlist') {
      // get playlist tracks
      url = new URL(`https://api.spotify.com/v1/playlists/${id}/tracks`);
    } else {
      return uris;
    }
    await fetch(url, {headers: getHeaders()})
      .then(response => response.json())
      .then(results => results.tracks || results.items)
      .then(items => items.map(item => uris.push(item.uri || item.track.uri)));
    return uris;
  }

  render() {
    return (
      <div>
      </div>
    );
  }
}

export default Player;

