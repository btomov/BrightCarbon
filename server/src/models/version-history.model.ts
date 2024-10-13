import mongoose, { Schema, Document } from 'mongoose';

export interface IVersionHistory extends Document {
  noteId: string;
  version: number;
  content: string;
  timestamp: Date;
}

const versionHistorySchema: Schema = new Schema(
  {
    noteId: { type: Schema.Types.ObjectId, required: true, ref: 'note' },
    version: { type: Number, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export const VersionHistory = mongoose.model<IVersionHistory>('versionHistory', versionHistorySchema);
