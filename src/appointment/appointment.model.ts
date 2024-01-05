import * as mongoose from 'mongoose';
import { SessionType } from 'src/utils/types';

export const AppointmentsSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  courseName: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['remote', 'in-person'],
  },
  duration: {
    type: Number,
    default: 60,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed'],
    default: 'pending',
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor',
    required: true,
  },
});

export class Appointment {
  student: string;
  date: Date;
  courseName: string;
  type: SessionType;
  duration: number;
  status: string;
  tutor: string;
}
