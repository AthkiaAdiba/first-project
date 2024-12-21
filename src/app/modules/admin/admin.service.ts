import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { searchableFields } from './admin.constant';
import { TAdmin } from './admin.interface';
import { Admin } from './admin.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { User } from '../user/user.model';

const getAllAdminsFromBD = async (query: Record<string, unknown>) => {
  const adminQuery = new QueryBuilder(Admin.find(), query)
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await adminQuery.modelQuery;

  return result;
};

const getSingleAdmin = async (id: string) => {
  const result = await Admin.findById(id);

  return result;
};

const updateAdminIntoDB = async (id: string, payLoad: Partial<TAdmin>) => {
  const { name, ...remainingAdminData } = payLoad;

  const modifiedAdminData: Record<string, unknown> = {
    ...remainingAdminData,
  };

  if (name && Object.keys(name).length) {
    for (const [key, value] of Object.entries(name)) {
      modifiedAdminData[`name.${key}`] = value;
    }
  }

  const result = await Admin.findByIdAndUpdate(id, modifiedAdminData, {
    new: true,
    runValidators: true,
  });

  return result;
};

const deleteAdminFromBD = async (id: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const deleteAdmin = await Admin.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true, session },
    );

    if (!deleteAdmin) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete admin!');
    }

    // get user _id from deletedAdmin
    const userId = deleteAdmin.user;

    const deletedUser = await User.findByIdAndUpdate(
      userId,
      { isDeleted: true },
      { new: true, session },
    );

    if (!deletedUser) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete user!');
    }

    await session.commitTransaction();
    await session.endSession();

    return deleteAdmin;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(err);
  }
};

export const AdminServices = {
  getAllAdminsFromBD,
  getSingleAdmin,
  updateAdminIntoDB,
  deleteAdminFromBD,
};
