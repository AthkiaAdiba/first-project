import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { AcademicSemesterServices } from './academicSemester.service';

const createAcademicSemester = catchAsync(async (req, res) => {
  const result = await AcademicSemesterServices.createAcademicSemesterIntoDB(
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Academic Semester is created successfully!',
    data: result,
  });
});

const getSingleAcademicSemester = catchAsync(async (req, res) => {
  const { semesterId } = req.params;

  const result =
    await AcademicSemesterServices.getSingleAcademicSemestersFromDB(semesterId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Academic Semester is got successfully!',
    data: result,
  });
});

const getAllAcademicSemester = catchAsync(async (req, res) => {
  const result = await AcademicSemesterServices.getAllAcademicSemesterFromDB(
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All Academic Semester are got successfully!',
    meta: result.meta,
    data: result.result,
  });
});

const updateAcademicSemester = catchAsync(async (req, res) => {
  const { semesterId } = req.params;

  const result = await AcademicSemesterServices.updateAcademicSemesterIntoDB(
    semesterId,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Academic Semester is updated successfully!',
    data: result,
  });
});

export const AcademicSemesterControllers = {
  createAcademicSemester,
  getSingleAcademicSemester,
  getAllAcademicSemester,
  updateAcademicSemester,
};
