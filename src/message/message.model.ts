import * as mongoose from 'mongoose';

export const messageSchema = new mongoose.Schema({
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  sender: {
    type: String,
    enum: ['student', 'tutor'],
  },
  messageContent: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export interface Message {
  tutor: string;
  student: string;
  sender: string;
  messageContent: string;
  timestamp: Date;
}
