import mongoose, { Schema } from 'mongoose';

export type VersionHistory = {
  _id: string
  noteId: string;
  version: number;
  content: string;
  title: string;
  tags: string[]
  isArchived: boolean;
  timestamp: Date;
}

const versionHistorySchema: Schema = new Schema(
  {
    noteId: { type: Schema.Types.ObjectId, required: true, ref: 'note' },
    version: { type: Number, required: true },
    title: { type: String, required: true },
    tags: [{ type: String }],
    isArchived: { type: Boolean },
    content: { type: String, required: true },
  },
  { timestamps: true, collection: 'versionhistories' }
);

export const VersionHistory = mongoose.model<VersionHistory>('VersionHistory', versionHistorySchema);
