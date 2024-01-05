import * as mongoose from 'mongoose';

export const TemporaryUserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'tutor'],
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: Date,
  expiresAt: Date,
});

export interface TempUser {
  email: string;
  password: string;
  role: string;
  otp: string;
  createdAt: Date;
  expiresAt: Date;
}
