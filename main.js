'use strict'

const path = require('path')
const {
	app,
	ipcMain,
	dialog
} = require('electron')
const Window = require('./js/Window')
const appRoot = require('app-root-path');
const DataStore = require('./js/DataStore')

const store = new DataStore({
	name: 'HassIO-DB'
})

app.on('ready', () => {
	let mainWindow = new Window({
		uri: `file://${appRoot}/${path.join('renderer', 'index.html')}`
	})
	mainWindow.on("move", () => mainWindow.saveSize())
	mainWindow.on("resize", () => mainWindow.saveSize())

	ipcMain.on('login-to', (event, url) => mainWindow.loadURL(url))
	ipcMain.on('reset-app', (event) => {
		let options = {
			buttons: ["Yes", "No"],
			message: "Do you really want to reset the app?"
		}
		dialog.showMessageBox(options, (response, checkboxChecked) => {
			if (response == 0) {
				mainWindow.webContents.session.clearStorageData([], function (data) {
					console.log(data);
					store.delAllWindow();
					setTimeout(() => {
						app.quit();
					}, 100);
				})
			}
		})
	})
})
app.on('window-all-closed', () => app.quit())
