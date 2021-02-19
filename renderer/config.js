'use strict'

const { ipcRenderer } = require('electron')
const { defatutStore } = require('../js/DataStore')


document.getElementById('modeKiosk').addEventListener('change', function() {
  defatutStore.setKiosk(this.checked);
  console.log(this.checked);
  ipcRenderer.send('mode-kiosk', this.checked);
});

document.getElementById('resetApp').addEventListener('click', () => {
  ipcRenderer.send('reset-app', {})
})

document.getElementById('modeKiosk').checked = store.isKiosk();
console.log("DOM completamente carregado e analisado");




