import * as mongoose from 'mongoose';

export const StudentSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    minLength: 6,
    required: true,
  },
  role: {
    type: String,
    default: 'Student',
  },
  profilePic: String,
  firstName: String,
  lastName: String,
  bio: String,
  nationality: String,
  languages: String,
  educationalLevel: {
    type: String,
    enum: ['elemantary school', 'middle school', 'high school', 'university'],
  },
  dateOfBirth: Date,
  appointments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
  ],
});

// defining it as class to check instances of it
export class Student {
  _id: string;
  email: string;
  password: string;
  role: string;
  profilePic: string;
  firstName: string;
  lastName: string;
  bio: string;
  nationality: string;
  languages: string;
  educationalLevel: string;
  dateOfBirth: Date;
  appointments: string[];
}
