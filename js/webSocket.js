const {
	BrowserWindow
} = require("electron")
const {
	URL
} = require("url")
const WebSocket = require("ws")
const notifications = require("./notifications")

function withToken(window, callback) {
	var gotToken = function (token) {
		if (token) {
			const parsedToken = JSON.parse(token)
			callback(parsedToken)
		}
	}

	const baseUrls = []
	let p = Promise.resolve()
	const contentUrl = new URL(window.webContents.getURL())
	contentUrl.pathname = ""
	baseUrls.push(contentUrl)
	const wp = window.webContents.executeJavaScript(
		'localStorage.getItem("hassTokens");',
		true
	)
	p = p.then((token) => {
		gotToken(token)
		return wp
	})

	p.then((token) => gotToken(token))
}

function socketUrl(hassUrl) {
	const url = new URL(hassUrl)
	url.protocol = url.protocol == "https:" ? "wss:" : "ws:"
	url.pathname = "/api/websocket"
	return url.toString()
}

const tokenSockets = {}

function getSocket(token, callback) {
	const socketId = token.hassUrl
	if (tokenSockets[socketId]) {
		callback(tokenSockets[socketId])
	} else {
		console.log("Create " + token.hassUrl)
		const ws = new WebSocket(socketUrl(token.hassUrl))
		ws.once("message", (data) => {
			const jd = JSON.parse(data)
			if (jd.type == "auth_required") {
				ws.send(
					JSON.stringify({
						type: "auth",
						access_token: token.access_token,
					})
				)
				ws.once("message", (data) => {
					const authResponse = JSON.parse(data)
					if (authResponse.type == "auth_ok") {
						const messageIdCallbacks = {}
						ws.onceForId = function (id, callback) {
							messageIdCallbacks[id] = [callback, "once"]
						}
						ws.subscribeForId = function (id, callback) {
							messageIdCallbacks[id] = [callback, "subscribe"]
						}
						ws.on("error", (data) => {
							delete tokenSockets[socketId]
						})
						ws.on("close", (data) => {
							delete tokenSockets[socketId]
						})
						ws.on("message", (data) => {
							const parsedData = JSON.parse(data)
							const id = parsedData.id
							if (parsedData.id && messageIdCallbacks[id]) {
								const [callback, type] = messageIdCallbacks[id]
								callback(parsedData)
								if (type == "once") {
									delete messageIdCallbacks[id]
								}
							}
						})
						tokenSockets[socketId] = ws
						getPersistentNotifications(ws, (data) => notifications.showPersistent(ws, token, data))
						subscribePersistentNotifications(ws, () => {
							getPersistentNotifications(ws, (data) => notifications.showPersistent(ws, token, data))
						})
						callback(ws)
					} else {
						console.log("no sucessful socket => no callback => authorize first")

					}
				})
			}
		})
	}
}

let messageId = 1

function wsid() {
	return messageId++
}

function subscribePersistentNotifications(ws, callback) {
	const id = wsid()
	ws.subscribeForId(id, (data) => {
		if (data.event) {
			callback(data.result)
		}
	})
	ws.send(
		JSON.stringify({
			type: "subscribe_events",
			event_type: "persistent_notifications_updated",
			id: id,
		})
	)
}

function getPanels(ws, callback) {
	const id = wsid()
	ws.onceForId(id, (data) => {
		callback(data.result)
	})
	ws.send(
		JSON.stringify({
			type: "get_panels",
			id: id,
		})
	)
}

function getPersistentNotifications(ws, callback) {
	const id = wsid()
	ws.onceForId(id, (data) => {
		callback(data.result)
	})
	ws.send(
		JSON.stringify({
			type: "persistent_notification/get",
			id: id,
		})
	)
}

exports.dismissPersistentNotification = function (ws, notificationId) {
	const id = wsid()
	ws.send(
		JSON.stringify({
			type: "call_service",
			domain: "persistent_notification",
			service: "dismiss",
			service_data: {
				notification_id: notificationId,
			},
			id: id,
		})
	)
}

function getServices(ws, callback) {
	const id = wsid()
	ws.onceForId(id, (data) => {
		callback(data.result)
	})
	ws.send(
		JSON.stringify({
			type: "get_services",
			id: id,
		})
	)
}

function getStates(ws, callback) {
	const id = wsid()
	ws.onceForId(id, (data) => {
		callback(data.result)
	})
	ws.send(
		JSON.stringify({
			type: "get_states",
			id: id,
		})
	)
}

function getThemes(ws, callback) {
	const id = wsid()
	ws.onceForId(id, (data) => {
		callback(data.result)
		//console.log(data.result)
	})
	ws.send(
		JSON.stringify({
			type: "frontend/get_themes",
			id: id,
		})
	)
}

function scriptReload(ws, callback) {
	const id = wsid()
	ws.onceForId(id, (data) => {
		callback(data)
		//console.log(data.result)
	})
	ws.send(
		JSON.stringify({
			type: "call_service",
			domain: "script",
			service: "reload",
			id: id,
		})
	)
}

function sceneReload(ws, callback) {
	const id = wsid()
	ws.onceForId(id, (data) => {
		callback(data)
		//console.log(data.result)
	})
	ws.send(
		JSON.stringify({
			type: "call_service",
			domain: "scene",
			service: "reload",
			id: id,
		})
	)
}

function automationReload(ws, callback) {
	const id = wsid()
	ws.onceForId(id, (data) => {
		callback(data)
		//console.log(data.result)
	})
	ws.send(
		JSON.stringify({
			type: "call_service",
			domain: "automation",
			service: "reload",
			id: id,
		})
	)
}

function serverRestart(ws, callback) {
	const id = wsid()
	ws.onceForId(id, (data) => {
		callback(data)
	})
	ws.send(
		JSON.stringify({
			type: "call_service",
			domain: "homeassistant",
			service: "restart",
			id: id,
		})
	)
}

function _methodBuilder(impl) {
	return function (window, callback) {
		withToken(window, (token) => {
			getSocket(token, (socket) => {
				impl(socket, (themes) => {
					callback(themes)
				})
			})
		})
	}
}

exports.serverRestart = _methodBuilder(serverRestart)
exports.automationReload = _methodBuilder(automationReload)
exports.scriptReload = _methodBuilder(scriptReload)
exports.sceneReload = _methodBuilder(sceneReload)
exports.themes = _methodBuilder(getThemes)
exports.panels = _methodBuilder(getPanels)
exports.states = _methodBuilder(getStates)
exports.services = _methodBuilder(getServices)
exports.persistentNotifications = _methodBuilder(getPersistentNotifications)
