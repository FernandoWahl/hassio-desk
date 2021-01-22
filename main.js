'use strict'

const path = require('path')
const {
	app,
	ipcMain
} = require('electron')
var appRoot = require('app-root-path');
require('electron-reload')(__dirname)

const Discovery = require('./js/Discovery')
const Window = require('./js/Window')

function main() {
	let url = `file://${appRoot}/${path.join('renderer', 'index.html')}`
	let mainWindow = new Window({
		url: url
	})

	mainWindow.once('show', () => {
		Discovery.find(function (urls) {
			mainWindow.send('urls', urls)
		})
	});
	mainWindow.on("move", () => mainWindow.saveSize())
	mainWindow.on("resize", () => mainWindow.saveSize())

	ipcMain.on('login-to', (event, url) => {
		mainWindow.loadURL(url);
	})
}

app.on('ready', main)
app.on('window-all-closed', () => app.quit())
