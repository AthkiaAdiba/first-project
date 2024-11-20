import { Schema, model } from 'mongoose';
import validator from 'validator';
import {
  StudentModel,
  TGuardian,
  TLocalGuardian,
  TStudent,
  TUserName,
} from './student/student.interface';

const userNameSchema = new Schema<TUserName>({
  firstName: {
    type: String,
    required: [true, 'First name is required.'],
    trim: true,
    maxlength: [20, 'First Name can not be more than 20 characters.'],
    validate: {
      validator: function (value: string) {
        const firstNameStr = value.charAt(0).toUpperCase() + value.slice(1);
        return firstNameStr === value;
      },
      message: '{VALUE} is not capitalize format.',
    },
  },
  secondName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
    required: [true, 'Last name is required.'],
    validate: {
      validator: (value: string) => validator.isAlpha(value),
      message: '{VALUE} is not valid.',
    },
  },
});

const guardianSchema = new Schema<TGuardian>({
  fatherName: {
    type: String,
    trim: true,
    required: [true, 'Father name is required.'],
  },
  fatherOccupation: {
    type: String,
    trim: true,
    required: [true, 'Father occupation is required.'],
  },
  fatherContactNo: {
    type: String,
    trim: true,
    required: [true, 'Father Contact number is required.'],
  },
  motherName: {
    type: String,
    trim: true,
    required: [true, 'Mother name is required.'],
  },
  motherOccupation: {
    type: String,
    trim: true,
    required: [true, 'Mather occupation is required.'],
  },
  motherContactNo: {
    type: String,
    trim: true,
    required: [true, 'Mother Contact number is required.'],
  },
});

const localGuardianSchema = new Schema<TLocalGuardian>({
  name: {
    type: String,
    trim: true,
    required: [true, 'Local Guardian name is required.'],
  },
  occupation: {
    type: String,
    trim: true,
    required: [true, 'Local Guardian occupation is required.'],
  },
  contactNo: {
    type: String,
    trim: true,
    required: [true, 'Local Guardian contact is required.'],
  },
  address: {
    type: String,
    trim: true,
    required: [true, 'Local Guardian address is required.'],
  },
});

const studentSchema = new Schema<TStudent, StudentModel>({
  id: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  name: {
    type: userNameSchema,
    required: true,
  },
  gender: {
    type: String,
    trim: true,
    enum: {
      values: ['male', 'female', 'other'],
      message: '{VALUE} is not valid',
    },
    required: true,
  },
  dateOfBirth: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    required: [true, 'Email is required.'],
    unique: true,
    validate: {
      validator: (value: string) => validator.isEmail(value),
      message: '{VALUE} is not a valid email.',
    },
  },
  contactNo: {
    type: String,
    trim: true,
    required: [true, 'Contact number is required.'],
  },
  emergencyContactNo: {
    type: String,
    trim: true,
    required: [true, 'emergency Contact Number is required.'],
  },
  bloodGroup: {
    type: String,
    trim: true,
    enum: {
      values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      message: '{VALUE} is not a blood group.',
    },
  },
  presentAddress: {
    type: String,
    trim: true,
    required: [true, 'Present Address is required.'],
  },
  permanentAddress: {
    type: String,
    trim: true,
    required: [true, 'Permanent Address is required.'],
  },
  guardian: {
    type: guardianSchema,
    required: true,
  },
  localGuardian: {
    type: localGuardianSchema,
    required: true,
  },
  profileImage: { type: String },
  isActive: {
    type: String,
    trim: true,
    enum: ['active', 'blocked'],
    default: 'active',
  },
});

// creating a custom static method
studentSchema.statics.isUserExists = async function (id: string) {
  const existingUser = await Student.findOne({ id });

  return existingUser;
};

// creating a custom instance method
// studentSchema.methods.isUserExits = async function (id: string) {
//   const existingUser = await Student.findOne({ id });

//   return existingUser;
// };

export const Student = model<TStudent, StudentModel>('Student', studentSchema);
