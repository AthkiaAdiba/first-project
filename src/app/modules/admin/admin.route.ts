import express from 'express';
import { AdminControllers } from './admin.controller';
import validateRequest from '../../middlewares/validateRequest';
import { AdminValidations } from './admin.validation';
import { USER_ROLE } from '../user/user.constant';
import auth from '../../middlewares/auth';

const router = express.Router();

router.get(
  '/',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  AdminControllers.getAllAdmins,
);

router.get(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  AdminControllers.getSingleAdmin,
);

router.patch(
  '/:id',
  auth(USER_ROLE.superAdmin),
  validateRequest(AdminValidations.updateAdminValidationSchema),
  AdminControllers.updateAdmin,
);

router.delete(
  '/:adminId',
  auth(USER_ROLE.superAdmin),
  AdminControllers.deleteAdmin,
);

export const AdminRoutes = router;
