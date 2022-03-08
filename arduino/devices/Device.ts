import Feature, { FeatureJsonInterface } from '../features/Feature';

export interface DeviceJsonInterface {
	room: string;
	name: string;
	features: FeatureJsonInterface[];
}

class Device {
	private features: { [featureName: string]: Feature } = {};
	private room: string;
	private name: string;
	constructor(dev: DeviceJsonInterface) {
		this.name = dev.name;
		this.room = dev.room;
		dev.features.forEach((fea) => {
			this.features[fea.name] = new Feature({ ...fea, device: this });
		});
	}

	toJSON(): DeviceJsonInterface {
		return {
			name: this.name,
			room: this.room,
			features: this.getFeaturesArray().map((fea) => fea.toJSON()),
		};
	}

	getUrl() {
		return `${this.room}/${this.name}`;
	}

	getName() {
		return this.name;
	}

	setName(name: string) {
		this.name = name;
	}

	getRoom() {
		return this.room;
	}

	setRoom(room: string) {
		this.room = room;
	}

	addFeature(feature: Feature) {
		this.features[feature.getName()] = feature;
	}

	removeFeature(feature: Feature) {
		delete this.features[feature.getName()];
	}

	getFeature(feature: Feature) {
		return this.features[feature.getName()];
	}

	getFeatureWithName(featureName: string) {
		return this.features[featureName];
	}

	getFeaturesObject() {
		return this.features;
	}

	getFeaturesArray() {
		return Object.values(this.features);
	}
}

export default Device;
