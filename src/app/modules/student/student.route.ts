import express from 'express';
import { StudentControllers } from './student.controller';
import validateRequest from '../../middlewares/validateRequest';
import { studentValidationSchemas } from './student.validation';
import auth from '../../middlewares/auth';

const router = express.Router();
// console.log(router);

// will call controller func

router.get('/', StudentControllers.getAllStudents);

router.patch(
  '/:id',
  validateRequest(studentValidationSchemas.updateStudentValidationSchema),
  StudentControllers.updateStudent,
);

router.get(
  '/:id',
  auth('admin', 'faculty'),
  StudentControllers.getSingleStudent,
);

router.delete('/:id', StudentControllers.deleteStudent);

export const StudentRoutes = router;
