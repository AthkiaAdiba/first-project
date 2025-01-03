import QueryBuilder from '../../builder/QueryBuilder';
import {
  academicSemesterNameCodeMapper,
  AcademicSemesterSearchableFields,
} from './academicSemester.constant';
import { TAcademicSemester } from './academicSemester.interface';
import { AcademicSemester } from './academicSemester.model';

const createAcademicSemesterIntoDB = async (payLoad: TAcademicSemester) => {
  // semester name --> semester code

  if (academicSemesterNameCodeMapper[payLoad.name] !== payLoad.code) {
    throw new Error('Invalid Semester Code!');
  }

  const result = await AcademicSemester.create(payLoad);

  return result;
};

const getSingleAcademicSemestersFromDB = async (id: string) => {
  const result = await AcademicSemester.findById(id);

  return result;
};

const getAllAcademicSemesterFromDB = async (query: Record<string, unknown>) => {
  const academicSemesterQuery = new QueryBuilder(AcademicSemester.find(), query)
    .search(AcademicSemesterSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await academicSemesterQuery.modelQuery;
  const meta = await academicSemesterQuery.countTotal();

  return {
    meta,
    result,
  };
};

const updateAcademicSemesterIntoDB = async (
  id: string,
  payLoad: Partial<TAcademicSemester>,
) => {
  if (
    payLoad.name &&
    payLoad.code &&
    academicSemesterNameCodeMapper[payLoad.name] !== payLoad.code
  ) {
    throw new Error('Invalid Semester Code!');
  }

  const result = await AcademicSemester.findByIdAndUpdate(
    { _id: id },
    payLoad,
    { new: true },
  );

  return result;
};

export const AcademicSemesterServices = {
  createAcademicSemesterIntoDB,
  getSingleAcademicSemestersFromDB,
  getAllAcademicSemesterFromDB,
  updateAcademicSemesterIntoDB,
};
