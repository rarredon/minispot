import React from 'react';

const CLIENT_ID = '3d2ca4bf6527408f90512e06bb0e99bb';


class LoginButton extends React.Component {

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

export default LoginButton;
