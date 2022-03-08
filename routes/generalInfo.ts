import { Router } from 'express';
import dataHandler from '../dataHandler';
import InputError from '../errors/InputError';
const router = Router();

router.get('/list-rooms', async (req, res, next) => {
	try {
		const rooms = dataHandler.getRoomNames();
		res.json({ rooms });
	} catch (error) {
		next(error);
	}
});

router.get('/list-devices/:room', async (req, res, next) => {
	try {
		const room = req.params.room;
		if (!room) {
			throw new InputError('Room is needed');
		}
		const devices = Object.keys(dataHandler.getData()[room] ?? {});
		res.json({ devices });
	} catch (error) {
		next(error);
	}
});

router.get('/list-features/:room/:device', async (req, res, next) => {
	try {
		const { room, device } = req.params;
		if (!room || !device) {
			throw new InputError('Room/Device is needed');
		}
		const dev = dataHandler.getDevice(room, device);

		res.json({
			features: dev.getFeaturesArray().map((fea) => fea.getName()),
		});
	} catch (error) {
		next(error);
	}
});

export default router;
