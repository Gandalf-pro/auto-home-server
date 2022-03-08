import { Router } from 'express';
import dataHandler from '../dataHandler';
import InputError from '../errors/InputError';
import NotFoundError from '../errors/NotFoundError';
const router = Router();

// Whole data getting endpoint
router.get('/data', async (req, res, next) => {
	try {
		// Get the data
		const data = dataHandler.getData();
		console.log('Data:', data);

		res.json({
			data,
		});
	} catch (error) {
		next(error);
	}
});

// Room data getting endpoint
router.get('/data/:room', async (req, res, next) => {
	try {
		// Get the params
		const params = req.params;
		if (!params.room) {
			throw new InputError('Parameter missing');
		}

		// Get the device data
		const data = dataHandler.getRoom(params.room);
		if (data === null) {
			throw new NotFoundError('Room not found');
		}
		res.json({
			data: {
				[params.room]: data,
			},
		});
	} catch (error) {
		next(error);
	}
});

// Device data getting endpoint
router.get('/data/:room/:device', async (req, res, next) => {
	try {
		// Get the params
		const params = req.params;
		if (!params.device || !params.room) {
			throw new InputError('Parameter missing');
		}

		// Get the device data
		const data = dataHandler.getDevice(params.room, params.device);
		if (data === null) {
			throw new NotFoundError('Room/Device not found');
		}
		res.json({
			data: {
				[params.room]: {
					[params.device]: data,
				},
			},
		});
	} catch (error) {
		next(error);
	}
});

// Feature data getting endpoint
router.get('/data/:room/:device/:feature', async (req, res, next) => {
	try {
		// Get the params
		const params = req.params;
		if (!params.device || !params.room || !params.feature) {
			throw new InputError('Parameter missing');
		}

		// Everything is present send the feature data
		const data = dataHandler.getFeature(
			params.room,
			params.device,
			params.feature
		);
		if (data === null) {
			throw new NotFoundError('Room/Device/Feature not found');
		}
		res.json({
			data: {
				[params.room]: {
					[params.device]: {
						[params.feature]: data,
					},
				},
			},
		});
	} catch (error) {
		next(error);
	}
});

export default router;
