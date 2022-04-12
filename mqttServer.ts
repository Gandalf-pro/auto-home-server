import { connect, IPublishPacket, MqttClient } from 'mqtt';
import { EventEmitter } from 'events';
import Device from './arduino/devices/Device';
import dataHandler from './dataHandler';

declare interface MqttServer {
	on(
		event: string,
		listener: (payload: string, packet: IPublishPacket) => void
	): this;
}

class MqttServer extends EventEmitter {
	private client: MqttClient;
	constructor() {
		super();
		this.client = connect({
			host: process.env.MQTT_HOST,
			username: process.env.MQTT_USER,
			password: process.env.MQTT_PASS,
		});
		this.client.on('connect', (packet) => {
			console.log(
				`Client connected to mqtt server:${process.env.MQTT_HOST}`
			);
		});

		// Subscribe to the topics
		// When a device registers itself
		this.client.subscribe('register-device');
		this.client.subscribe('devices');
		this.client.subscribe('data');

		// Emit events on topic when we get a message from the arduinos
		this.client.on('message', (topic, payload, packet) => {
			this.emit(topic, payload.toString(), packet);
		});

		// Handlers
		this.on('register-device', this.handleRegisterDevice);
		this.on('data', this.handleDataUpdate);
		this.on('devices', this.handleHello);
	}

	// Handles the device registration
	private handleRegisterDevice(payload: string, packet: IPublishPacket) {
		// Turn the data into a Device object
		console.log('Payload:', payload);
		const data = JSON.parse(payload);
		console.log('Register device:', data);

		const device = new Device(data);
		dataHandler.registerDevice(device);
	}

	private handleHello(payload: string, packet: IPublishPacket) {
		console.log('Data:', payload);
	}

	// Handles data updates from devices
	private handleDataUpdate(payload: string, packet: IPublishPacket) {
		const data = JSON.parse(payload);
		console.log("Got data:", data);
		
		const device = new Device(data);
		dataHandler.handleFreshDataFromDevice(device);
	}

	async sendDataToDevice(room: string, device: string, data = {}) {
		return new Promise<number>((resolve, reject) => {
			// Sending to topic
			console.log('Topic:', `${room}/${device}`);
			console.log('Data:', data);

			this.client.publish(
				`${room}/${device}`,
				JSON.stringify(data),
				(error, packet) => {
					if (error) {
						reject(error);
					} else {
						resolve(packet?.messageId);
					}
				}
			);
		});
	}

	async publish(
		topic: string,
		payload: string | Buffer | { [x: string]: any }
	) {
		if (typeof payload === 'object' && !Buffer.isBuffer(payload)) {
			payload = JSON.stringify(payload);
		}
		return new Promise<number>((resolve, reject) => {
			this.client.publish(topic, payload as string, (error, packet) => {
				if (error) {
					reject(error);
				} else {
					resolve(packet?.messageId);
				}
			});
		});
	}
}

const mqttServer = new MqttServer();
export default mqttServer;
