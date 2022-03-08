import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import Device, { DeviceJsonInterface } from './arduino/devices/Device';

const filePath = path.join(__dirname, 'data.json');

export interface ConsistancyFile {
	devices: Device[];
	extraData: { [url: string]: { lastRegisteryDate: Date } };
}

export interface ConsistancyFileSaved {
	devices: DeviceJsonInterface[];
	extraData: { [url: string]: { lastRegisteryDate: Date } };
}

let file: ConsistancyFile = {
	devices: [],
	extraData: {},
};

export async function getSavedData() {
	try {
		if (!fs.existsSync(filePath)) {
			return file;
		}

		const readFile = await fsp.readFile(filePath);

		const tmp: ConsistancyFileSaved = JSON.parse(readFile.toString());

		// Convert json to object
		file.devices = tmp?.devices?.map((dev) => new Device(dev)) || [];

		return file;
	} catch (error) {
		return file;
	}
}

export async function addDevice(device: Device) {
	try {
		// Check if it exists
		if (!file.extraData[device.getUrl()]) {
			file.extraData[device.getUrl()] = {} as any;
			// Add it to the file object
			file.devices.push(device);
		}

		// Give the current timestamp
		file.extraData[device.getUrl()].lastRegisteryDate = new Date();

		// Save it to file
		await fsp.writeFile(filePath, JSON.stringify(file));
	} catch (error) {}
}
