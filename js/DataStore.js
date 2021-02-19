'use strict'

const Store = require('electron-store')

class DataStore extends Store {
	constructor(settings) {
		super(settings)
		this.beforeQuitValue = false;
	}

	setWindow(id, url, bounds) {
		if (!url.includes('file:')) {
			const list = this.get("windows", {})
			list[id] = [url, bounds]
			this.set("windows", list)
		}
	}

	delWindow(id) {
		const list = this.get("windows", {})
		if (Object.keys(list).length > 1 && !this.beforeQuit) {
			delete list[id]
			this.set("windows", list)
		}
	}

	deleteAll() {
		this.delete('windows');
		this.delete("kioskmode")
	}

	getWindows() {
		return this.get("windows", {})
	}

	isKiosk() {
		return this.get("kioskmode", false)
	}

	setKiosk(kioskmode) {
		return this.set("kioskmode", kioskmode == true)
	}

	get beforeQuit() {
		return this.beforeQuitValue
	}

	set beforeQuit(value) {
		this.beforeQuitValue = value
	}
}

module.exports = {
	DataStore: DataStore,
	defatutStore: new DataStore({
		name: 'HassIO-DB'
	})
}
