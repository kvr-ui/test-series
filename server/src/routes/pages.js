import { Router } from 'express';
import { Page } from '../models/Page.js';
import { env } from '../config/env.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.get('/:slug', async (req, res, next) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug.toLowerCase() }).lean();
    if (!page) return res.status(404).json({ message: 'Page not found' });

    const { _id, __v, ...content } = page;
    res.json({ ...content, config: { siteUrl: env.siteUrl } });
  } catch (err) {
    next(err);
  }
});

// Replaces the page's copy. Send the full `sections` object — partial updates are not merged.
router.put('/:slug', requireAdmin, async (req, res, next) => {
  try {
    const { title, description, sections } = req.body ?? {};
    if (!sections || typeof sections !== 'object' || Array.isArray(sections)) {
      return res.status(400).json({ message: '`sections` must be an object' });
    }

    const page = await Page.findOneAndUpdate(
      { slug: req.params.slug.toLowerCase() },
      { $set: { sections, ...(title !== undefined && { title }), ...(description !== undefined && { description }) } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    ).lean();

    const { _id, __v, ...content } = page;
    res.json(content);
  } catch (err) {
    next(err);
  }
});

export default router;
