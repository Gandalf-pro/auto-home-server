import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import Automation, { AutomationJson } from './arduino/automation/Automation';
import Device, { DeviceJsonInterface } from './arduino/devices/Device';

const filePath = path.join(__dirname, 'data.json');

export interface ConsistancyFile {
	devices: Device[];
	automations: Automation[];
	extraData: { [url: string]: { lastRegisteryDate: Date } };
}

export interface ConsistancyFileSaved {
	devices: DeviceJsonInterface[];
	automations: AutomationJson[];
	extraData: { [url: string]: { lastRegisteryDate: Date } };
}

let fileReadBefore = false;
let file: ConsistancyFile = {
	devices: [],
	automations: [],
	extraData: {},
};

export async function getSavedData(forceRead = false) {
	try {
		if (!fs.existsSync(filePath)) {
			return file;
		}
		if (fileReadBefore && !forceRead) {
			return file;
		}
		const readFile = await fsp.readFile(filePath);

		const tmp: ConsistancyFileSaved = JSON.parse(readFile.toString());

		// Convert json to object
		file.devices = tmp?.devices?.map((dev) => new Device(dev)) || [];
		file.automations =
			tmp?.automations?.map((aut) => new Automation(aut)) || [];

		fileReadBefore = true;
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
	} catch (error) {
		console.error('Got error registering device');
	}
}

export async function setDeviceUpdateDate(device: Device) {
	try {
		// Check if it exists
		if (!file.extraData[device.getUrl()]) {
			return;
		}

		// Give the current timestamp
		file.extraData[device.getUrl()].lastRegisteryDate = new Date();

		// Save it to file
		await fsp.writeFile(filePath, JSON.stringify(file));
	} catch (error) {
		console.error('Got error updating device date');
	}
}

export async function deleteDevice(device: Device) {
	// Find the index if its and slice it
	const index = file.devices.findIndex((val) => {
		return val.getUrl() === device.getUrl();
	});
	if (index === -1) return;
	file.devices.splice(index, 1);
	// Remove it from extra data
	if (device.getUrl()) delete file.extraData[device.getUrl()];

	// Save it to file
	await fsp.writeFile(filePath, JSON.stringify(file));
}

export async function addAutomation(automation: Automation) {
	try {
		// Check if it exists
		for (const aut of file.automations) {
			if (aut.getId() === automation.getId()) return;
		}
		file.automations.push(automation);
		// Save it to file
		await fsp.writeFile(filePath, JSON.stringify(file));
	} catch (error) {
		console.log(
			'🚀 ~ file: fileHandler.ts ~ line 112 ~ addAutomation ~ error',
			error
		);
	}
}
export async function deleteAutomation(automation: Automation) {
	try {
		// Check if it exists
		const delIndex = file.automations.findIndex(
			(aut) => aut.getId() === automation.getId()
		);
		if (delIndex === -1) return;
		file.automations.splice(delIndex, 1);
		// Save it to file
		await fsp.writeFile(filePath, JSON.stringify(file));
	} catch (error) {
		console.log(
			'🚀 ~ file: fileHandler.ts ~ line 129 ~ deleteAutomation ~ error',
			error
		);
	}
}
export async function updateAutomation(automation: Automation) {
	try {
		// Check if it exists
		const index = file.automations.findIndex(
			(aut) => aut.getId() === automation.getId()
		);
		if (index === -1) return;
		file.automations[index] = automation;
		// Save it to file
		await fsp.writeFile(filePath, JSON.stringify(file));
	} catch (error) {
		console.log(
			'🚀 ~ file: fileHandler.ts ~ line 146 ~ updateAutomation ~ error',
			error
		);
	}
}
