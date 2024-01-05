import * as mongoose from 'mongoose';

export const FileSchema = new mongoose.Schema({
  fileName: String,
  type: String,
  path: String,
});

export interface File {
  fileName: string;
  type: string;
  path: string;
}
