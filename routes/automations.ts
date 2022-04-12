import express from 'express';
import Automation, { AutomationJson } from '../arduino/automation/Automation';
import dataHandler from '../dataHandler';
import InputError from '../errors/InputError';
import NotFoundError from '../errors/NotFoundError';
const router = express.Router();

router.post('/create', async (req, res, next) => {
	try {
		// Create it
		const body: AutomationJson = req.body;
		if (!body.name || !body.action || !body.condition)
			throw new InputError('Data needed');
		const automation = new Automation(body);

		await dataHandler.addAutomation(automation);
		res.json({ type: 'ok', message: 'Succesfull' });
	} catch (error) {
		next(error);
	}
});
router.get('/', async (req, res, next) => {
	try {
		// Get the automations
		const data = dataHandler.getAutomations();
		res.json({ data });
	} catch (error) {
		next(error);
	}
});
router.post('/delete', async (req, res, next) => {
	try {
		// Delete it
		const body: AutomationJson = req.body;
		if (!body.id)
			throw new InputError('Id needed');
		const automation = dataHandler.getAutomationWithId(body.id);
		if (!automation) throw new NotFoundError("automation not found");
		await dataHandler.deleteAutomation(automation);
		res.json({ type: 'ok', message: 'Succesfull' });
	} catch (error) {
		next(error);
	}
});
router.post('/update', async (req, res, next) => {
	try {
		// Delete it
		const body: AutomationJson = req.body;
		if (!body.id || !body.name || !body.action || !body.condition)
			throw new InputError('Data/Id needed');
		
		const automationNew = new Automation(body);
		const automation = dataHandler.getAutomationWithId(body.id);
		if (!automation) throw new NotFoundError("automation not found");
		await dataHandler.updateAutomation(automationNew);
		res.json({ type: 'ok', message: 'Succesfull' });
	} catch (error) {
		next(error);
	}
});

const automationsRouter = router;
export default automationsRouter;
