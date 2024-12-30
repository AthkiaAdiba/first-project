import config from '../../config';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { TLoginUser } from './auth.interface';
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { createToken, verifyToken } from './auth.utils';
import { sendEmail } from '../../utils/sendEmail';

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

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );

  return {
    accessToken,
    refreshToken,
    needsPasswordChange: user?.needsPasswordChange,
  };
};

const changePassword = async (
  userData: JwtPayload,
  payLoad: { oldPassword: string; newPassword: string },
) => {
  //   checking if the user is exists
  const user = await User.isUserExistsByCustomId(userData?.userId);

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
  if (!(await User.isPasswordMatched(payLoad?.oldPassword, user?.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password does not match!');
  }

  // hash new password
  const newHashedPassword = await bcrypt.hash(
    payLoad?.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await User.findOneAndUpdate(
    {
      id: userData?.userId,
      role: userData?.role,
    },
    {
      password: newHashedPassword,
      needsPasswordChange: false,
      passwordChangeAt: new Date(),
    },
  );

  return null;
};

const refreshToken = async (token: string) => {
  // check if the token is valid
  const decoded = verifyToken(token, config.jwt_refresh_secret as string);

  const { userId, iat } = decoded;

  //   checking if the user is exists
  const user = await User.isUserExistsByCustomId(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }

  // checking if user is already delete
  const iDeleted = user?.isDeleted;

  if (iDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted!');
  }

  // //   checking if user is already blocked
  const userStatus = user?.status;

  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }

  if (
    user.passwordChangeAt &&
    User.isJWTIssuedBeforePasswordChanged(user.passwordChangeAt, iat as number)
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
  }

  // create token and sent to the client
  const jwtPayload = {
    userId: user?.id,
    role: user?.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  return {
    accessToken,
  };
};

const forgetPassword = async (userId: string) => {
  //   checking if the user is exists
  const user = await User.isUserExistsByCustomId(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }

  // checking if user is already delete
  const iDeleted = user?.isDeleted;

  if (iDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted!');
  }

  // checking if user is already blocked
  const userStatus = user?.status;

  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }

  // create token and sent to the client
  const jwtPayload = {
    userId: user?.id,
    role: user?.role,
  };

  const resetToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    '10m',
  );

  const resetUILink = `${config.reset_pass_ui_link}?id=${user?.id}&token=${resetToken}`;

  sendEmail(user?.email, resetUILink);

  console.log(resetUILink);
};

const resetPassword = async (
  payload: { id: string; newPassword: string },
  token: string,
) => {
  //   checking if the user is exists
  const user = await User.isUserExistsByCustomId(payload?.id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }

  // checking if user is already delete
  const iDeleted = user?.isDeleted;

  if (iDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted!');
  }

  // checking if user is already blocked
  const userStatus = user?.status;

  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }

  // check if the token is valid
  const decoded = verifyToken(token, config.jwt_access_secret as string);

  console.log(decoded);

  if (payload?.id !== decoded.userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are forbidden!');
  }

  // hash new password
  const newHashedPassword = await bcrypt.hash(
    payload?.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await User.findOneAndUpdate(
    {
      id: decoded?.userId,
      role: decoded?.role,
    },
    {
      password: newHashedPassword,
      needsPasswordChange: false,
      passwordChangeAt: new Date(),
    },
  );
};

export const AuthServices = {
  loginUser,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
};
