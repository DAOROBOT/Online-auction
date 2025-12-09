import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';
import orderRoute from './routes/order.js';
import wardRoute from './routes/ward.js';
import provinceRoute from './routes/province.js';
import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

// CORS, open for all domain
app.use(cors());

// Log
app.use(morgan('dev'));

// Parse JSON body
app.use(bodyParser.json());

// Hello world
app.get('/', (req, res) => {
  res.json({
    message: 'Hello world',
  });
});

// Order
app.use('/orders', orderRoute);
// Ward
app.use('/wards', wardRoute);
// Provice
app.use('/provinces', provinceRoute);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;