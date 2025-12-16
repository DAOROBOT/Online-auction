import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';
import auctionRouter from './routes/auction.route.js';
import { notFound, errorHandler } from './middlewares/error.js';

const app = express();



// CORS, open for all domain
app.use(cors());


// Log
app.use(morgan('dev'));
app.use(express.json());
// Parse JSON body
app.use(bodyParser.json());

// Hello world
app.get('/', (req, res) => {
  res.json({
    message: 'Hello world',
  });
});

// Route handlers
app.use('/auctions', auctionRouter);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;