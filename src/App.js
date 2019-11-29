import React from 'react';
import { Route, Switch } from 'react-router-dom';
import './App.css';

const CLIENT_ID = 'client-id';

class SpotifyLogInButton extends React.Component {

  constructor(props) {
    super(props);
    this.logIn = this.logIn.bind(this);
  }

  logIn() {
    let url = new URL('https://accounts.spotify.com/authorize');
    let params = {
      client_id: CLIENT_ID,
      response_type: 'token',
      redirect_uri: 'http://localhost:3000/callback/',
      scope: ["streaming", "user-read-email", "user-read-private"]
    };
    url.search = new URLSearchParams(params);
    window.location = url;
  }

  render() {
    return (
        <button onClick={this.logIn}>
          Log In to Spotify
        </button>
    );
  };

}

class SpotifySearchForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      q: '',
      type: 'track'
    };

    this.handleSearchTextChange = this.handleSearchTextChange.bind(this);
    this.handleTypeChange = this.handleTypeChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSearchTextChange (event) {
    this.setState({q: event.target.value});
  }

  handleTypeChange (event) {
    this.setState({type: event.target.value});
  }

  handleSubmit(event) {
    let url = new URL('http://localhost:3000/results/');
    url.search = new URLSearchParams(this.state);
    window.location = url.toString();
    event.preventDefault();
  }

  render() {
    return (
        <div>
          <form onSubmit={this.handleSubmit}>
            <label>
              Search:
              <input type='text' value={this.state.q} onChange={this.handleSearchTextChange} placeholder="Search.." required="required"/>
            </label>
            <label>
              Type:
              <select value={this.state.type} onChange={this.handleTypeChange} >
                <option value='album'>Album</option>
                <option value='artist'>Artist</option>
                <option value='playlist'>Playlist</option>
                <option value='track'>Track</option>
              </select>
            </label>
            <input type='submit' value='Submit' />
          </form>
        </div>
    );
  }
}


function SpotifyLogin() {
  return (
    <div>
      <SpotifyLogInButton />
    </div>
  );
}

function parseToken(hash) {
  return hash.substr(1).split('&').reduce(
    (o, value) => ({...o, [value.split('=')[0]]: value.split('=')[1]}), {});
}


function LogInCallback() {
  let token = parseToken(window.location.hash);
  localStorage.setItem('test', JSON.stringify(token));
  window.location = "/search";
  return (<p>Ok.</p>);
}

function getHeaders() {
  let token = JSON.parse(localStorage.getItem('test'));
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token['access_token']}`
  };
}

function Search() {
  return (
      <div>
        <SpotifySearchForm />
      </div>
  );
}

class PlayButton extends React.Component {
  constructor(props) {
    super(props);

    this.handlePlay = this.handlePlay.bind(this);
    this.uri = props.uri;
    this.type = props.type;
  }

  handlePlay() {
    window.Player.playUri(this.uri, this.type);
  }

  render() {
    return (
      <button onClick={this.handlePlay}>
        Play it
      </button>
    );
  }

}

function Table(props) {
  const items = props.type ? props.results[props.type + 's'].items : [];
  const columns = [
    {
      name: 'name',
      display: 'Name',
      reduce: x => x
    },
    {
      name: 'id',
      display: 'ID',
      reduce: x => x
    },
    {
      name: 'popularity',
      display: 'Popularity',
      reduce: x => x
    },
    {
      name: 'uri',
      display: 'Play it',
      reduce: uri => (<PlayButton type={props.type} uri={uri}/>)
    }
  ];

  if (props.type === 'artist') {
    columns[1] = {
      name: 'genres',
      display: 'Genres',
      reduce: genres => genres.join(', ')
    };
  } else if (props.type === 'track') {
    columns[1] = {
      name: 'artists',
      display: 'Artists',
      reduce: artists => artists.reduce((list, artist) => list.concat(artist.name), []).join(', ')
    };
  } else if (props.type === 'album') {
    columns[1] = {
      name: 'artists',
      display: 'Artists',
      reduce: artists => artists.reduce((list, artist) => list.concat(artist.name), []).join(', ')
    };
    columns[2] = {
      name: 'release_date',
      display: 'Release Date',
      reduce: x => x
    };
  } else if (props.type === 'playlist') {
    columns[1] = {
      name: 'owner',
      display: 'Owner',
      reduce: owner => owner.display_name
    };
    columns[2] = {
      name: 'tracks',
      display: 'Track Count',
      reduce: tracks => tracks.total
    };
  }

  const table = (
    <div>
      <div className="headerRow">
        {columns.map(col => <div>{col.display}</div>)}
      </div>
        {items.map(result => (
          <div className="row" key={result.id}>
            {columns.map(col => <div>{col.reduce(result[col.name])}</div>)}
          </div>
        ))}
    </div>
  );
  return (
    <div>
      {table}
    </div>
  );
}

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

class ResultsList extends React.Component{

  constructor(props) {
    super(props);
    this.state = {results: {'': {items: []}}, type: '', displayType: ''};

    this.returnToSearch = this.returnToSearch.bind(this);
  }

  componentDidMount() {
    let location = new URL(window.location);
    let type = location.searchParams.get('type');
    // this.setState({type: type.charAt(0).toUpperCase() + type.substr(1)});

    let url = new URL('https://api.spotify.com/v1/search');
    url.search = location.search;
    fetch(url, {headers: getHeaders()})
      .then(response => response.json())
      .then(results => this.setState({
        results: results,
        type: type,
        displayType: type.charAt(0).toUpperCase() + type.substr(1)
      }));
  }

  returnToSearch() {
    window.location = '/search';
  }

  render() {
    return (
        <div>
          <script src="https://sdk.scdn.co/spotify-player.js"></script>
          <Player/>
          <h1>{this.state.displayType} Results</h1>
          <div className="return">
            <button onClick={this.returnToSearch}>Back to search</button>
          </div>
          <Table results={this.state.results} type={this.state.type}/>
        </div>
    );
  }
}

function App() {
  return (
    <Switch>
      <Route exact path="/" component={SpotifyLogin} />
      <Route path="/callback" component={LogInCallback} />
      <Route path="/search" component={Search} />
      <Route path="/results" component={ResultsList} />
    </Switch>
  );
}

export default App;
