import * as mongoose from 'mongoose';

export const courseSchema = new mongoose.Schema({
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor',
    required: true,
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    },
  ],
  courseName: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    required: true,
  },
  coverPhoto: {
    type: String,
  },
  documents: [
    [
      {
        type: String,
      },
    ],
  ],
});

export class Course {
  tutor: string;
  students: string[];
  courseName: string;
  level: string;
  coverPhoto: string;
  documents: string[][];
}
