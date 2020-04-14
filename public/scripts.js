function buttonClick(id) {
  const xhr = new XMLHttpRequest();
  xhr.open('DELETE', `/homeworks/${id}`);
  xhr.send();
  xhr.onload = () => {
    location.reload();
  }
}


