import Automation from './arduino/automation/Automation';
import Device from './arduino/devices/Device';
import Feature from './arduino/features/Feature';
import {
	addDevice,
	getSavedData,
	setDeviceUpdateDate,
	deleteDevice,
	addAutomation,
	deleteAutomation,
	updateAutomation,
} from './fileHandler';

export interface DataHandlerData {
	[roomName: string]: {
		[deviceName: string]: Device;
	};
}
export interface AutomationsData {
	[id: string]: Automation;
}

class DataHandler {
	private data: DataHandlerData = {};
	private automations: AutomationsData = {};
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
		const autTmp = { ...this.automations };
		for (const aut of data.automations) {
			autTmp[aut.getId()] = aut;
		}
		this.automations = autTmp;
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

	getDeviceWithUrl(url: string): Device | undefined {
		const [room, device] = url.split('/');
		return this.data[room]?.[device] ?? null;
	}

	getFeature(
		room: string,
		device: string,
		feature: string
	): Feature | undefined {
		return this.data[room]?.[device]?.getFeatureWithName(feature) ?? null;
	}
	getFeatureWithUrl(url: string): Feature | undefined {
		const [room, device, feature] = url.split('/');
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

	private async deviceUpsert(device: Device) {
		// insert device if not present
		const room = device.getRoom();
		if (!this.data[room]) {
			this.data[room] = {};
		}
		const devPresent = this.data[room][device.getName()];
		if (!devPresent) {
			this.data[room][device.getName()] = device;
			await addDevice(device);
		}
	}

	async handleFreshDataFromDevice(device: Device) {
		// If device is not present
		await this.deviceUpsert(device);
		// Set the lates interaction date
		await setDeviceUpdateDate(device);
		// Set the data
		const devicePresent = this.data[device.getRoom()]?.[device.getName()];
		if (devicePresent) {
			devicePresent.updateFeatureDatas(device);
		}
	}

	async deleteDeviceWithUrl(url: string) {
		const device = this.getDeviceWithUrl(url);
		if (!device) return;
		// Delete it from data handler
		delete this.data[device.getRoom()]?.[device.getName()];
		// Delete room if no devices are left in the room
		if (!Object.keys(this.data[device.getRoom()]).length) {
			delete this.data[device.getRoom()];
		}

		// Delete it from fileHandler
		await deleteDevice(device);
	}

	async addAutomation(automation: Automation) {
		const id = automation.getId();
		if (this.automations[id]) return;
		this.automations[id] = automation;
		await addAutomation(automation);
	}
	async deleteAutomation(automation: Automation) {
		const id = automation.getId();
		if (!this.automations[id]) return;
		delete this.automations[id];
		await deleteAutomation(automation);
	}
	async updateAutomation(automation: Automation) {
		const id = automation.getId();
		if (!this.automations[id]) return;
		this.automations[id] = automation;
		await updateAutomation(automation);
	}
	getAutomationWithId(id: string) {
		return this.automations[id];
	}
	getAutomations() {
		return this.automations;
	}
}

const dataHandler = new DataHandler();
export default dataHandler;
