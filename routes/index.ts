import express from 'express';
import dataHandler from '../dataHandler';
import InputError from '../errors/InputError';
import dataGettingRouter from './dataGetting';

const router = express.Router();

// Endpoints
router.use(dataGettingRouter);

// Data setting endpoint
router.post('/execute/:room/:device/:feature', async (req, res, next) => {
	try {
		const params = req.params;
		if (!params.device || !params.feature || !params.room) {
			throw new InputError('Parameter missing');
		}

		// Get the feature
		const feature = dataHandler.getFeature(
			params.room,
			params.device,
			params.feature
		);

		// Set the features value
		const tmp = await feature.execute(req.body);

		res.json({ type: 'success', data: tmp });
	} catch (error) {
		next(error);
	}
});



export default router;
