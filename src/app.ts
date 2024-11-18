import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { StringRoutes } from './app/modules/student/student.route';
const app: Application = express();

// parsers
app.use(express.json());
app.use(cors());

// application routes
app.use('/api/v1/students', StringRoutes);

const getAController = (req: Request, res: Response) => {
  res.send('Hello World!');
};

app.get('/', getAController);

export default app;
