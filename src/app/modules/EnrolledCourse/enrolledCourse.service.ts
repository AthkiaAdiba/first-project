import { TEnrolledCourse } from './enrolledCourse.interface';

const createEnrolledCourseIntoDB = async (
  userId: string,
  payload: TEnrolledCourse,
) => {
  /**
   * step1: check if the offered courses is exists
   * step2: check if the student is already enrolled
   * step3: create an enrolled course
   */
};

export const EnrolledCourseServices = {
  createEnrolledCourseIntoDB,
};
