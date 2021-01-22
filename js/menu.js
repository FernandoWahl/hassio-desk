const {
	Menu,
	MenuItem,
	dialog,
	Notification,
	TouchBar
} = require("electron")
const {
	TouchBarButton,
	TouchBarLabel
} = TouchBar
const Discovery = require("./Discovery")
const mdi = require("./mdi")
const {
	URL
} = require("url")
const lodash = require("lodash")
const webSocket = require("./webSocket");

let hostsData = []
let mainWindow = null
let panelsData = {}
let servicesData = {}
let statesData = []
let themesData = {}
let currentTheme = null

function buildHelpMenu() {
	const helpMenu = new Menu()
	helpMenu.append(
		new MenuItem({
			role: 'reload',
			accelerator: 'CmdOrCtrl+Y',
			icon: mdi.path("mdi:reload")
		})
	)
	helpMenu.append(
		new MenuItem({
			role: 'togglefullscreen',
			icon: mdi.path("mdi:fullscreen")
		})
	)

	helpMenu.append(
		new MenuItem({
			role: "about",
			icon: mdi.path("mdi:information-outline")
		})
	)

	const helpMenuItem = new MenuItem({
		label: "Help",
		type: "submenu",
		submenu: helpMenu,
	})
	return helpMenuItem;
}

function buildEditMenu() {
	const editMenu = new Menu()
	const editMenuItem = new MenuItem({
		label: "Edit",
		type: "submenu",
		submenu: editMenu,
	})
	editMenu.append(new MenuItem({
		role: "undo"
	}))
	editMenu.append(new MenuItem({
		role: "redo"
	}))
	editMenu.append(new MenuItem({
		type: "separator"
	}))
	editMenu.append(new MenuItem({
		role: "cut"
	}))
	editMenu.append(new MenuItem({
		role: "copy"
	}))
	editMenu.append(new MenuItem({
		role: "paste"
	}))
	if (process.platform === "darwin") {
		editMenu.append(new MenuItem({
			role: "pasteAndMatchStyle"
		}))
	}
	editMenu.append(new MenuItem({
		role: "delete"
	}))
	editMenu.append(new MenuItem({
		role: "selectAll"
	}))
	return editMenuItem
}

function buildAppMenu() {
	const appMenu = new Menu()
	appMenu.append(new MenuItem({
		type: "separator"
	}))
	appMenu.append(
		new MenuItem({
			label: "Developer Tools Info",
			click: (menuItem, browserWindow, event) => {
				const urlMenu = new URL(browserWindow.webContents.getURL())
				urlMenu.pathname = "/developer-tools/info"
				browserWindow.loadURL(urlMenu.toString())
			},
			icon: mdi.path("mdi:hammer")
		})
	)
	appMenu.append(
		new MenuItem({
			label: "Debug events fire/listen...",
			click: (menuItem, browserWindow, event) => {
				const urlMenu = new URL(browserWindow.webContents.getURL())
				urlMenu.pathname = "/developer-tools/event"
				browserWindow.loadURL(urlMenu.toString())
			},
			icon: mdi.path("mdi:bug")
		})
	)
	appMenu.append(
		new MenuItem({
			label: "Restart server",
			click: (menuItem, browserWindow, event) => {
				let options = {
					buttons: ["Yes", "No"],
					message: "Do you really want to restart the server?"
				}
				dialog.showMessageBox(options, (response, checkboxChecked) => {
					if (response == 0) {
						webSocket.serverRestart(mainWindow, (data) => {
							const notification = {
								title: 'Hassio Desk',
								body: 'Server restarted, Wait a moment!'
							}
							new Notification(notification).show()
							console.log("SERVER RESTART", data)
						})
					}
				})

			},
			icon: mdi.path("mdi:restart")
		})
	)
	appMenu.append(new MenuItem({
		type: "separator"
	}))

	for (let url of hostsData) {
		const settings = {
			label: url,
			click: (menuItem, browserWindow, event) => {
				mainWindow.loadURL(url)
			},
		}
		if (url.startsWith("https://")) {
			settings.icon = mdi.path("mdi:lock")
		}
		appMenu.append(new MenuItem(settings))
	}
	appMenu.append(
		new MenuItem({
			type: "separator",
		})
	)

	appMenu.append(
		new MenuItem({
			role: "quit",
			icon: mdi.path("mdi:exit-to-app")
		})
	)

	const appMenuItem = new MenuItem({
		label: "Home Assistant",
		type: "submenu",
		submenu: appMenu,
	})

	return appMenuItem
}

function buildDashboardsMenu() {
	if (Object.keys(panelsData).length > 0) {
		const panels = new Menu()
		const touchbarItems = []
		for (let [id, item] of Object.entries(panelsData)) {
			if (item.component_name == "lovelace") {
				const label = id == "lovelace" ? "Overview" : item.title || id
				const settings = {
					label: label,
					click: (menuItem, browserWindow, event) => {
						const url = new URL(browserWindow.webContents.getURL())
						url.pathname = "/" + item.url_path
						browserWindow.webContents.loadURL(url.toString())
					},
				}
				const tbSettings = {
					label: label,
					click: () => {
						const url = new URL(mainWindow.webContents.getURL())
						url.pathname = "/" + item.url_path
						mainWindow.webContents.loadURL(url.toString())
					},
				}
				if (item.icon && item.icon.startsWith("mdi:")) {
					tbSettings.icon = settings.icon = mdi.path(item.icon)
					tbSettings.iconPosition = "left"
				} else if (id == "lovelace") {
					tbSettings.icon = settings.icon = mdi.path("mdi:view-dashboard")
					tbSettings.iconPosition = "left"
				}
				touchbarItems.push(new TouchBarButton(tbSettings))
				panels.append(new MenuItem(settings))
			}
		}
		panels.append(
			new MenuItem({
				type: "separator",
			})
		)

		panels.append(
			new MenuItem({
				label: "Edit Dashbords",
				icon: mdi.path("mdi:pencil"),
				click: (menuItem, browserWindow, event) => {
					let url = new URL(browserWindow.webContents.getURL())
					url.pathname = "/config/lovelace/dashboards"
					browserWindow.loadURL(url.toString())
				},
			})
		)
		const panelsItem = new MenuItem({
			label: "Panels",
			type: "submenu",
			submenu: panels,
		})

		  if (mainWindow) {
		  	const touchbar = new TouchBar({
		  		items: touchbarItems,
		  	})
		  	mainWindow.setTouchBar(touchbar)
		  }
		return panelsItem
	}
}

function _rebuildMenu() {
	console.log("Menu Rebuild")
	const top = new Menu()
	top.append(buildAppMenu())
	let menuPanel = buildDashboardsMenu();
	if (menuPanel) {
		top.append(menuPanel)
	}
	//top.append(buildEditMenu())
	top.append(buildHelpMenu())

	console.log("Menu Rebuild Done")
	Menu.setApplicationMenu(top)
}
const rebuildMenu = lodash.debounce(_rebuildMenu, 100)

exports.hosts = function (win) {
	mainWindow = win;
	rebuildMenu();
	Discovery.find(function (urls) {
		hostsData = urls
		mainWindow.send('urls', urls)
		rebuildMenu()
	});
	webSocket.panels(mainWindow, (data) => {
		panelsData = data;
		rebuildMenu()
	})
}
