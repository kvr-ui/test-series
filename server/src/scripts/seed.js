/*
 * Overwrites the Video Insights page in MongoDB with the seed content.
 * Use after editing src/data/videoInsightsPage.js. Any edits made through the API are lost.
 */
import mongoose from 'mongoose';
import { connectDb } from '../config/db.js';
import { Page } from '../models/Page.js';
import { videoInsightsPage } from '../data/videoInsightsPage.js';

try {
  await connectDb();
  await Page.findOneAndReplace({ slug: videoInsightsPage.slug }, videoInsightsPage, { upsert: true });
  console.log(`Seeded page "${videoInsightsPage.slug}"`);
} catch (err) {
  console.error('Seeding failed:', err);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
