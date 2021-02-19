'use strict'

const {
	BrowserWindow
} = require('electron')
const appRoot = require('app-root-path')
const {
	v4: uuid
} = require("uuid")

const defaultProps = {
	width: 1024,
	height: 720,
	show: false,
	webPreferences: {
		preload: `${appRoot}/preload.js`,
		nodeIntegration: true,
		devTools: true,
	}
}

class Window extends BrowserWindow {
	constructor({
		id,
		uri,
		store,
		bounds,
		...windowSettings
	}) {
		super({
			...defaultProps,
			...windowSettings
		})
		this.uuid = id ? id : uuid()
		
		this.loadURL(uri)
		if(bounds){
			this.setBounds(bounds);
		}
		this.once('ready-to-show', () => {
			store.setWindow(this.uuid, uri, this.getBounds())
			this.show()
		})
	}

	get id() {
		return this.uuid
	}
	set id(id) {
		this.uuid = id
	}

}

module.exports = Window
