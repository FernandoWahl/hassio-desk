'use strict'

const bonjour = require("bonjour")()
let discoveryFound = []

exports.find = function (callback) {
	bonjour.find({
		type: "home-assistant"
	}, function (service) {
		if (service.hasOwnProperty("txt") && service.txt.hasOwnProperty("base_url")) {
			let url = service.txt.base_url
			if (!discoveryFound.includes(url)) {
				discoveryFound.push(url)
			}
		} else {
			for (let host of service.addresses) {
				let urlHttp = "http://" + host + ":" + service.port
				let urlHttps = "https://" + host + ":" + service.port
				if (!discoveryFound.includes(urlHttp)) {
					discoveryFound.push(urlHttp)
				}
				if (!discoveryFound.includes(urlHttps)) {
					discoveryFound.push(urlHttps)
				}
			}
		}
		callback(discoveryFound);
	});
}
