import Device from './arduino/devices/Device';
import Feature from './arduino/features/Feature';
import { addDevice, getSavedData } from './fileHandler';

export interface DataHandlerData {
	[roomName: string]: {
		[deviceName: string]: Device;
	};
}

class DataHandler {
	private data: DataHandlerData = {};
	constructor() {
		this.setup();
	}

	async setup() {
		// Setup from the saved data
		let data = await getSavedData();
		const tmp = { ...this.data };
		for (const dev of data.devices) {
			if (!tmp[dev.getRoom()]) {
				tmp[dev.getRoom()] = {};
			}
			tmp[dev.getRoom()][dev.getName()] = dev;
		}
		this.data = tmp;
	}

	getData() {
		return this.data;
	}

	getRoom(room: string) {
		return this.data[room] ?? null;
	}

	getRoomNames() {
		return Object.keys(this.data);
	}

	getDevice(room: string, device: string): Device | undefined {
		return this.data[room]?.[device] ?? null;
	}

	getFeature(
		room: string,
		device: string,
		feature: string
	): Feature | undefined {
		return this.data[room]?.[device]?.getFeatureWithName(feature) ?? null;
	}

	registerDevice(device: Device) {
		const room = device.getRoom();
		if (!this.data[room]) {
			this.data[room] = {};
		}
		this.data[room][device.getName()] = device;
		addDevice(device);
	}
}

const dataHandler = new DataHandler();
export default dataHandler;
