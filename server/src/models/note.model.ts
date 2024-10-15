import mongoose, { Schema } from 'mongoose';

export type Note = {
  id: string;
  _id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  version: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, ref: 'User' },
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: [{ type: String }],
    isArchived: { type: Boolean, default: false },
    version: {type: Number, default: 1}
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }  }
);

noteSchema.virtual('versions', {
  ref: 'VersionHistory',
  localField: '_id',
  foreignField: 'noteId',
});

export const Note = mongoose.model<Note>('note', noteSchema);
