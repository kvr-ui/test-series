import mongoose from 'mongoose';

/*
 * One document per landing page. `sections` holds the editable content — headings, videos,
 * comparison rows, plan prices — so copy can change without a redeploy.
 */
const pageSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    sections: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true, minimize: false },
);

export const Page = mongoose.model('Page', pageSchema);
