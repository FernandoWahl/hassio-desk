const fs = require("fs");
const appRoot = require('app-root-path');

function getPath(name, size) {
	return (
		appRoot +
		"/icons/" +
		name.replace(/\:/, "-") +
		"Template" +
		size +
		".png"
	);
}

exports.path = function (name, size = 16) {
	if (name == "mdi:playstation") {
		name = "mdi:sony-playstation"
	}
	name = name.replace("hass:", "mdi:");
	try {
		if (fs.existsSync(getPath(name, size))) {
			return getPath(name, size)
		}
	} catch (err) {
		console.error(err)
	}
	return getPath("mdi:help", size);
}
