'use strict'

const path = require('path')
const {
	app,
	ipcMain,
	dialog
} = require('electron')
const Window = require('./js/Window')
const appRoot = require('app-root-path')
const {
	defatutStore
} = require('./js/DataStore')
const menu = require('./js/menu')


let save = function (window) {
	defatutStore.setWindow(window.id, window.webContents.getURL(), window.getBounds())
}

app.on('ready', () => {
	let id = null;
	let uri = `file://${appRoot}/${path.join('renderer', 'index.html')}`;
	let bounds = null;

	const list = Object.entries(defatutStore.getWindows());
	if (list.length > 0) {
		[id, [uri, bounds]] = list[0];
	}
	let mainWindow = new Window({
		id: id,
		uri: uri,
		bounds: bounds,
		store: defatutStore
	})

	mainWindow.webContents.on("did-navigate-in-page", () => save(mainWindow))
	mainWindow.on("move", () => save(mainWindow))
	mainWindow.on("resize", () => save(mainWindow))
	mainWindow.webContents.on("dom-ready", () => {
		save(mainWindow)
		menu.hosts(mainWindow)
	})

	ipcMain.on('login-to', (event, url) => mainWindow.loadURL(url))
	ipcMain.on('reset-app', (event) => {
		let options = {
			buttons: ["Yes", "No"],
			message: "Do you really want to reset the app?"
		}
		dialog.showMessageBox(options, (response, checkboxChecked) => {
			if (response == 0) {
				mainWindow.webContents.session.clearStorageData([], function (data) {
					defatutStore.deleteAll()
					setTimeout(() => {
						app.quit()
					}, 100)
				})
			}
		})
	})
})

app.on('window-all-closed', () => app.quit())
