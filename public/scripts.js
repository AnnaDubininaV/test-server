function buttonClick(id) {

  const xhr = new XMLHttpRequest();
  xhr.open('DELETE', `/homeworks/${id}`, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send();
  xhr.onload = () => {
    location.reload();
  }
}
