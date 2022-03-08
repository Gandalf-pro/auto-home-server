import mqttServer from '../../mqttServer';
import Device from '../devices/Device';

export interface DataInterface {
	[key: string]: any;
}

export interface FeatureJsonInterface {
	name: string;
	type: string;
	availableLogics: string[];
	availableActions: string[];
	data: DataInterface;
}

class Feature {
	private device: Device;
	private name: string;
	private type: string;
	private availableLogics: string[];
	private availableActions: string[];
	private data: DataInterface = {};
	constructor(params: FeatureJsonInterface & { device: Device }) {
		this.device = params.device;
		this.name = params.name;
		this.type = params.type;
		if (params.availableActions) {
			this.availableActions = params.availableActions;
		}
		if (params.availableLogics) {
			this.availableLogics = params.availableLogics;
		}
		this.data = params.data || {};
	}

	toJSON(): FeatureJsonInterface {
		return {
			availableActions: this.availableActions,
			availableLogics: this.availableLogics,
			data: this.data,
			name: this.name,
			type: this.type,
		};
	}

	getName() {
		return this.name;
	}

	setName(name: string) {
		this.name = name;
	}

	getType() {
		return this.type;
	}

	setType(type: string) {
		this.type = type;
	}

	getRoom() {
		return this.device.getRoom();
	}

	getDevice() {
		return this.device.getName();
	}

	getDeviceObject() {
		return this.device;
	}

	getUrl() {
		return `${this.getRoom()}/${this.getDevice()}/${this.getName()}`;
	}

	getData() {
		return this.data;
	}

	setData(data: DataInterface) {
		this.data = data;
	}

	getAvailableLogics() {
		return this.availableLogics;
	}

	setAvailableLogics(logics: string[]) {
		this.availableLogics = logics;
	}

	getAvailableActions() {
		return this.availableActions;
	}

	setAvailableActions(actions: string[]) {
		this.availableActions = actions;
	}

	async execute(data: DataInterface) {
		try {
			// Send the data to the device
			await mqttServer.sendDataToDevice(
				this.getRoom(),
				this.getDevice(),
				{
					feature: this.name,
					data,
				}
			);
			// Set the data
			this.setData({ ...this.getData(), ...data });
		} catch (error) {
			console.error('Error:', error);
		}
	}
}

export default Feature;
