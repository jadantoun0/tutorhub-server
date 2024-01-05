import * as mongoose from 'mongoose';

export const tutorSchema = new mongoose.Schema({
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
  profilePic: String,
  firstName: String,
  lastName: String,
  bio: String,
  role: {
    type: String,
    default: 'Tutor',
  },
  nationality: String,
  languages: String,
  position: String,
  subject: String,
  skills: {
    type: [String],
    default: [''],
  },
  sessionType: {
    type: String,
    enum: ['remote', 'in-person', 'remote or in-person'],
    default: 'remote',
  },
  hourlyRate: Number,
  education: {
    type: [String],
    default: [''],
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
  appointments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
  ],
});
// defining it as class to check instances of it
export class Tutor {
  _id: string;
  email: string;
  password: string;
  role: string;
  profilePic: string;
  firstName: string;
  lastName: string;
  bio: string;
  hourlyRate: number;
  nationality: string;
  languages: string;
  sessionType: string;
  education: string;
  subject: string;
  skills: string[];
  position: string;
  reviews: string[];
  appointments: string[];
}
