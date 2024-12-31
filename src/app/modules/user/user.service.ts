import mongoose from 'mongoose';
import config from '../../config';
import { AcademicSemester } from '../academicSemester/academicSemester.model';
import { TStudent } from '../student/student.interface';
import { Student } from '../student/student.model';
import { TUser } from './user.interface';
import { User } from './user.model';
import {
  generateAdminId,
  generatedStudentId,
  generateFacultyId,
} from './user.utils';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { TFaculty } from '../Faculty/faculty.interface';
import { AcademicDepartment } from '../academicDepartment/academicDepartment.model';
import { Faculty } from '../Faculty/faculty.model';
import { TAdmin } from '../Admin/admin.interface';
import { Admin } from '../Admin/admin.model';
import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary';

const createStudentIntoDB = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  file: any,
  password: string,
  payLoad: TStudent,
) => {
  // create a user object
  const userData: Partial<TUser> = {};

  // if password is not given, ude default password
  userData.password = password || (config.default_password as string);

  // set student role
  userData.role = 'student';
  userData.email = payLoad?.email;

  // find academic semester info
  const admissionSemester = await AcademicSemester.findById(
    payLoad.admissionSemester,
  );

  if (!admissionSemester) {
    throw new Error('Admission is not found!');
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    // set generated id
    userData.id = await generatedStudentId(admissionSemester);

    const imageName = `${userData?.id}${payLoad?.name?.firstName}`;
    const path = file.path;
    // send image to cloudinary
    const secure_url = await sendImageToCloudinary(imageName, path);
    console.log(secure_url);

    // create a user (transaction-1)
    const newUser = await User.create([userData], { session }); // array

    //   create a student
    if (!newUser.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create user!');
    }

    // set id, _id as user
    payLoad.id = newUser[0].id;
    payLoad.user = newUser[0]._id; //reference _id
    payLoad.profileImage = secure_url;

    // create a student (transaction-2)
    const newStudent = await Student.create([payLoad], { session });

    if (!newStudent.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create student!');
    }

    await session.commitTransaction();
    await session.endSession();

    return newStudent;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(err);
  }
};

const createFacultyIntoDB = async (password: string, payload: TFaculty) => {
  // create a user object
  const userData: Partial<TUser> = {};

  //if password is not given , use default password
  userData.password = password || (config.default_password as string);

  //set admin role
  userData.role = 'faculty';
  userData.email = payload?.email;

  // find academic department info
  const academicDepartment = await AcademicDepartment.findById(
    payload.academicDepartment,
  );

  if (!academicDepartment) {
    throw new AppError(400, 'Academic department not found');
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    //set  generated id
    userData.id = await generateFacultyId();

    // create a user (transaction-1)
    const newUser = await User.create([userData], { session }); // array

    //create a faculty
    if (!newUser.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create a user');
    }
    // set id , _id as user
    payload.id = newUser[0].id;
    payload.user = newUser[0]._id; //reference _id

    // create a faculty (transaction-2)

    const newFaculty = await Faculty.create([payload], { session });

    if (!newFaculty.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create faculty');
    }

    await session.commitTransaction();
    await session.endSession();

    return newFaculty;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(err);
  }
};

const createAdminIntoDB = async (password: string, payLoad: TAdmin) => {
  // create a admin object
  const userData: Partial<TUser> = {};

  // if password is not given, use default password
  userData.password = password || (config.default_password as string);

  // set admin role
  userData.role = 'admin';
  userData.email = payLoad?.email;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // set generated id
    userData.id = await generateAdminId();

    // create a user
    const newUser = await User.create([userData], { session });
    // console.log(newUser);

    if (!newUser.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create a user!');
    }

    // set id , _id as user
    payLoad.id = newUser[0].id;
    payLoad.user = newUser[0]._id; //reference _id

    // create a admin (transaction-2)
    const newAdmin = await Admin.create([payLoad], { session });
    // console.log(newAdmin);

    if (!newAdmin.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create admin');
    }

    await session.commitTransaction();
    await session.endSession();

    return newAdmin;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(err);
  }
};

const getMe = async (userId: string, role: string) => {
  // const decoded = verifyToken(token, config.jwt_access_secret as string);

  // const { userId, role } = decoded;
  // console.log(userId, role);

  let result = null;
  if (role === 'student') {
    result = await Student.findOne({ id: userId }).populate('user');
  }
  if (role === 'admin') {
    result = await Admin.findOne({ id: userId }).populate('user');
  }
  if (role === 'faculty') {
    result = await Faculty.findOne({ id: userId }).populate('user');
  }

  return result;
};

const changeStatus = async (id: string, payload: { status: string }) => {
  const result = await User.findByIdAndUpdate(id, payload, { new: true });

  return result;
};

export const UserServices = {
  createStudentIntoDB,
  createFacultyIntoDB,
  createAdminIntoDB,
  getMe,
  changeStatus,
};

// {
//   "password": "student1",
//   "student": {
//       "name": {
//           "firstName": "Mr. Student4",
//           "secondName": "",
//           "lastName": "good"
//       },
//       "gender": "male",
//       "dateOfBirth": "2000-01-15",
//       "email": "student4@gmail.com",
//       "contactNo": "+123",
//       "emergencyContactNo": "+0987654321",
//       "bloodGroup": "O+",
//       "presentAddress": "123 Main Street, Cityville",
//       "permanentAddress": "456 Elm Street, Townsville",
//       "guardian": {
//           "fatherName": "Richard Doe",
//           "fatherOccupation": "Engineer",
//           "fatherContactNo": "+1122334455",
//           "motherName": "Emily Doe",
//           "motherOccupation": "Teacher",
//           "motherContactNo": "+5566778899"
//       },
//       "localGuardian": {
//           "name": "Michael Smith",
//           "occupation": "Lawyer",
//           "contactNo": "+1029384756",
//           "address": "789 Pine Street, Metropolis"
//       },
//       "admissionSemester": "674d1ca9ea727edd352c0735",
//       "academicDepartment": "67602c8223873fe501f0a241",
//       "profileImage": "https://example.com/profile-images/john-doe.jpg"
//   }
// }
