import express from 'express';
import { StudentControllers } from './student.controller';
import validateRequest from '../../middlewares/validateRequest';
import { studentValidationSchemas } from './student.validation';

const router = express.Router();
// console.log(router);

// will call controller func

router.get('/', StudentControllers.getAllStudents);

router.patch(
  '/:studentId',
  validateRequest(studentValidationSchemas.updateStudentValidationSchema),
  StudentControllers.updateStudent,
);

router.get('/:studentId', StudentControllers.getSingleStudent);

router.delete('/:studentId', StudentControllers.deleteStudent);

export const StudentRoutes = router;
