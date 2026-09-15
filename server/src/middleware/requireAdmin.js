import { env } from '../config/env.js';

export function requireAdmin(req, res, next) {
  if (!env.adminToken) return res.status(403).json({ message: 'Admin access is disabled' });
  if (req.get('x-admin-token') !== env.adminToken) return res.status(401).json({ message: 'Unauthorized' });
  next();
}
