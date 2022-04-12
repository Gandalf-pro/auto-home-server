import dotenv from 'dotenv';
dotenv.config();



import createError from 'http-errors';
import express, { ErrorRequestHandler } from 'express';
import logger from 'morgan';
import path from 'path';
import './mqttServer';
import './serverDiscovery';
import './timedTasks'
import cookieParser from 'cookie-parser';
import cors from 'cors';

import apiEndpointRouter from './routes';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Endpoints
app.use(apiEndpointRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
	res.status(err.status || 500);
	res.json({
		type: 'error',
		message: err.message,
		error: req.app.get('env') === 'development' ? err : {},
	});
};
// error handler
app.use(errorHandler);

async function setup() {
	try {
		const port = process.env.PORT;
		app.listen(port, () => {
			console.log('Server runing on port:', port);
		});
	} catch (error) {
		console.error('Error on setup', error);
	}
}

setup();

module.exports = app;
