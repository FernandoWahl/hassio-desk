'use strict'

const { ipcRenderer } = require('electron')

const validURL = (str) => {
  var pattern = new RegExp('^(https?:\\/\\/)?'+
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+
    '((\\d{1,3}\\.){3}\\d{1,3}))'+
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+
    '(\\?[;&a-z\\d%_.~+=-]*)?'+
    '(\\#[-a-z\\d_]*)?$','i');
  return !!pattern.test(str);
}

const loginTo = (e) => {
  ipcRenderer.send('login-to', e.target.textContent)
}

document.getElementById('customUrl').addEventListener('click', () => {
  let url = document.getElementById('customUrlText').value;
  if(url == "" || !validURL(url)){
    alert("The uri is invalid!");
    return;
  }
  ipcRenderer.send('login-to', url);
})

ipcRenderer.on('urls', (event, urls) => {
  const urlList = document.getElementById('urlList')

  if(urls.length != 0){
    const urlItems = urls.reduce((html, url) => {
      html += `<button class="btn btn-primary url-item" type="button">${url}</button>`
      return html
    }, '')
  
    urlList.innerHTML = urlItems
    urlList.querySelectorAll('.url-item').forEach(item => {
      item.addEventListener('click', loginTo)
    })
  }
});