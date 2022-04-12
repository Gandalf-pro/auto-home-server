import dataHandler from './dataHandler';
import { getSavedData } from './fileHandler';
import mqttServer from './mqttServer';

export async function requestDataFromDevices() {
	console.log('Getting data');

	mqttServer.publish('all/data', { data: true });
}

// Request data every 5 minutes and now
setTimeout(requestDataFromDevices, 5 * 1000);
setInterval(requestDataFromDevices, 5 * 60 * 1000);

export async function deleteWeekNotUpdatedDevices() {
	const data = await getSavedData();
	// 6.048e+8 is 1 week
	const weekBefore = new Date().getTime() - 6.048e8;

	const urlsForDeletion: string[] = [];
	for (const [url, value] of Object.entries(data.extraData)) {
		// It has been a week without update
		if (value.lastRegisteryDate.getTime() < weekBefore) {
			urlsForDeletion.push(url);
		}
	}

	for (const url of urlsForDeletion) {
		await dataHandler.deleteDeviceWithUrl(url);
	}
}

setInterval(deleteWeekNotUpdatedDevices, 15 * 60 * 1000);

export async function handleAutomations() {
    console.log("Handling automations");
	const automations = Object.values(dataHandler.getAutomations());
	
	for (const automation of automations) {
        try {
			await automation.execute();
		} catch (error) {
			console.error(
				'Error executing automation:',
				automation,
				' Error:',
				error
			);
		}
	}
}

setInterval(handleAutomations, 1 * 60 * 1000);
