import Device from '../arduino/devices/Device';

it('Tests the device methods', () => {
	const features = [
		{
			data: {
				r: 255,
				g: 213,
				b: 0,
			},
			name: 'northLights',
			type: 'LedFeature',
		},
		{
			data: {
				r: 255,
				g: 213,
				b: 0,
			},
			name: 'eastLights',
			type: 'LedFeature',
		},
	];
	const dev = new Device({
		name: 'leds',
		room: 'ozgur',
		features: [...features],
	});

	expect(dev.getName()).toBe('leds');
	expect(dev.getRoom()).toBe('ozgur');
	expect(dev.getUrl()).toBe('ozgur/leds');

	dev.setName('trial');
	expect(dev.getName()).toBe('trial');
	dev.setRoom('trialRoom');
	expect(dev.getRoom()).toBe('trialRoom');
	expect(dev.getUrl()).toBe('trialRoom/trial');

	expect(dev.getFeatureWithName('northLights').toJSON()).toEqual({
		data: {
			r: 255,
			g: 213,
			b: 0,
		},
		name: 'northLights',
		type: 'LedFeature',
		availableActions: undefined,
		availableLogics: undefined,
	});
});
