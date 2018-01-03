class Store {
	constructor() {
		this.store = {};
	}

	get(name) {
		return this.store[name];
	}

	set(name, value) {
		this.store[name] = value;
		return this.store[name];
	}
}

export default Store;