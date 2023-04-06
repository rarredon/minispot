import React from 'react';
import Player from './spotify/Player.js';
import PlayButton from './PlayButton.js';
import { getHeaders } from '../utils.js';


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

export default ResultsList;
