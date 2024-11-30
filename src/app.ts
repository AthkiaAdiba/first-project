import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorhandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';
const app: Application = express();

// parsers
app.use(express.json());
app.use(cors());

// application routes
app.use('/api/v1', router);

const test = (req: Request, res: Response) => {
  res.send('Hello World!');
};

app.get('/', test);

app.use(globalErrorHandler);

// NOT Found
app.use(notFound);

export default app;

// it is a http-status
// npm i @types/http-status
