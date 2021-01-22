'use strict'

const path = require('path')
const {
	app,
	ipcMain
} = require('electron')
const menu = require("./js/Menu")

var appRoot = require('app-root-path');
require('electron-reload')(__dirname)

const Discovery = require('./js/Discovery')
const Window = require('./js/Window')

const webSocket = require("./js/webSocket");

function main() {
	let url = `file://${appRoot}/${path.join('renderer', 'index.html')}`
	let mainWindow = new Window({
		url: url
	})
	
	mainWindow.once('show', () => {
		menu.hosts(mainWindow);
	});
	mainWindow.on("move", () => mainWindow.saveSize())
	mainWindow.on("resize", () => mainWindow.saveSize())

	ipcMain.on('login-to', (event, url) => {
		mainWindow.loadURL(url)
		menu.hosts(mainWindow)
	})
}

app.on('ready', main)
app.on('window-all-closed', () => app.quit())
