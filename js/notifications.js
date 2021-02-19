const {
	Notification
} = require("electron")

exports.showPersistent = function (ws, token, data) {
	for (let notification of data) {
		const ns = {
			title: notification.title,
			silent: true,
			subtitle: new Date(notification.created_at).toLocaleString(),
			body: notification.message,
			actions: [{
				type: "button",
				text: "Dismiss",
			}, ],
		}

		const item = new Notification(ns)
		item.show()
		item.on("action", () => {
			api.dismissPersistentNotification(ws, notification.notification_id)
		})
	}
}
