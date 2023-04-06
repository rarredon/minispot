function getHeaders() {
  let token = JSON.parse(localStorage.getItem('test'));
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token['access_token']}`
  };
}


export { getHeaders };
