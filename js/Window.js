'use strict'

const { BrowserWindow } = require('electron')
var appRoot = require('app-root-path');
const { v4: uuid } = require("uuid")

const DataStore = require('./DataStore')

const store = new DataStore({
	name: 'HassioDesk'
})

const defaultProps = {
  width: 1024,
  height: 720,
  //frame: false,
  //titleBarStyle: "hidden",
  show: false,
  webPreferences: {
    preload: `${appRoot}/preload.js`,
    nodeIntegration: true,
    devTools: true,
  }
};

class Window extends BrowserWindow {
  constructor ({ uri, ...windowSettings}) {
    let bounds = null;
    let id = uuid();
    let url = uri;

    const list = Object.entries(store.getWindows());
    if(list.length > 0){
      [id, [url, bounds]] = list[0];
    }

    if (bounds) {
      defaultProps.x = bounds.x
      defaultProps.y = bounds.y
      defaultProps.width = bounds.width
      defaultProps.height = bounds.height
    }

    super({ ...defaultProps, ...windowSettings })
    this.uuid = id;
    this.loadURL(url)
    this.once('ready-to-show', () => {
      this.show()
    })
    this.webContents.on("dom-ready", () => {
      store.setWindow(id, this.webContents.getURL(), this.getBounds());
    })
  
    this.webContents.on("did-navigate-in-page", () => {
      store.setWindow(id, this.webContents.getURL(), this.getBounds());
    })
  }

  loadURL(url){
    if(!url.includes('file:')){
      store.setWindow(this.id, url, this.getBounds());
    }
    super.loadURL(url);
  }
  
  saveSize(){
    store.setWindow(this.id, this.webContents.getURL(), this.getBounds());
  }

  get id(){
    return this.uuid;
  }
  set id(id) {
    this.uuid = id
  }

}

module.exports = Window
