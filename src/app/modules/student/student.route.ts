import express from 'express';
import { StudentControllers } from './student.controller';

const router = express.Router();
// console.log(router);

// will call controller func

router.get('/', StudentControllers.getAllStudents);

router.get('/:studentId', StudentControllers.getSingleStudent);

router.delete('/:studentId2', StudentControllers.deleteStudent);

export const StudentRoutes = router;
