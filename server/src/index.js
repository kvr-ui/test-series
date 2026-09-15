import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { connectDb } from './config/db.js';
import { Page } from './models/Page.js';
import { videoInsightsPage } from './data/videoInsightsPage.js';
import pageRoutes from './routes/pages.js';
import checkoutRoutes, { handleRazorpayWebhook } from './routes/checkout.js';
import adminRoutes from './routes/admin.js';

const app = express();
// Read the client IP from X-Forwarded-For only when the request comes through a local/private proxy (nginx, Docker)
app.set('trust proxy', 'loopback, linklocal, uniquelocal');

if (env.corsOrigins.length) app.use(cors({ origin: env.corsOrigins }));
// Before express.json: the webhook signature is checked against the raw body
app.post('/api/checkout/webhook', express.raw({ type: 'application/json', limit: '1mb' }), handleRazorpayWebhook);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/pages', pageRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', (req, res) => res.status(404).json({ message: 'Not found' }));

// In production the server also hosts the built React app
const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: env.isProduction ? 'Something went wrong' : err.message });
});

await connectDb();

// First boot: put the page in the database so the site works without a manual seed
if (!(await Page.exists({ slug: videoInsightsPage.slug }))) {
  await Page.create(videoInsightsPage);
  console.log(`Created page "${videoInsightsPage.slug}" from seed content`);
}

app.listen(env.port, () => console.log(`API listening on http://localhost:${env.port}`));
