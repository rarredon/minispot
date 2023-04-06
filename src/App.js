import React from 'react';
import { Route, Switch } from 'react-router-dom';
import './App.css';
import ResultsList from './components/ResultsList.js';
import SpotifyLoginButton from './components/spotify/LoginButton.js';
import SpotifySearchForm from './components/spotify/SearchForm.js';


function SpotifyLogin() {
  return (
    <div>
      <SpotifyLoginButton />
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


function Search() {
  return (
      <div>
        <SpotifySearchForm />
      </div>
  );
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
