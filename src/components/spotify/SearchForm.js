import React from 'react';

class SearchForm extends React.Component {
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


export default SearchForm;
