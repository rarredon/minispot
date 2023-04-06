import React from 'react';

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

export default PlayButton;
