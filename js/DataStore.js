'use strict'

const Store = require('electron-store')

class DataStore extends Store {
  constructor (settings) {
    super(settings)
    this.beforeQuitValue = false;
  }

  setWindow(id, url, bounds) {
    const list = this.get("windows", {})
    list[id] = [url, bounds]
    this.set("windows", list)
  }
  
  delWindow(id) {
    const list = this.get("windows", {})
    if (Object.keys(list).length > 1 && !this.beforeQuit) {
      delete list[id]
      this.set("windows", list)
    }
  }

  getWindows() {
    return this.get("windows", {})
  }

  get beforeQuit() {
    return this.beforeQuitValue
  }

  set beforeQuit(value){
    this.beforeQuitValue = value
  }
}

module.exports = DataStore
