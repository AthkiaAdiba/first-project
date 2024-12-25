import config from '../../config';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { TLoginUser } from './auth.interface';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';

const loginUser = async (payLoad: TLoginUser) => {
  //   checking if the user is exists
  const user = await User.isUserExistsByCustomId(payLoad?.id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }

  //   checking if user is already delete
  const iDeleted = user?.isDeleted;

  if (iDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted!');
  }

  // //   checking if user is already blocked
  const userStatus = user?.status;

  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }

  // // checking if the password is correct
  if (!(await User.isPasswordMatched(payLoad?.password, user?.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password does not match!');
  }

  // create token and sent to the client
  const jwtPayload = {
    userId: user?.id,
    role: user?.role,
  };

  const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret as string, {
    expiresIn: '10d',
  });

  return {
    accessToken,
    needsPasswordChange: user?.needsPasswordChange,
  };
};

export const AuthServices = {
  loginUser,
};
