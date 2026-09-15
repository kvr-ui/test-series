import { Page } from '../models/Page.js';
import { videoInsightsPage } from './videoInsightsPage.js';

export const PLAN_NAMES = { solo: 'Solo Plan', cumulative: 'Cumulative Plan', lak: 'LAK' };

const BOTH_GROUPS = 'Both Groups';

/*
 * Checks a pricing selection against the page content in MongoDB and prices it there, so the
 * amount charged always matches what the pricing section shows and never comes from the browser.
 * Returns `{ quote }` or `{ error }`.
 */
export async function quoteSelection({ level, type, item, plan } = {}) {
  if (![level, type, plan].every((value) => typeof value === 'string') || !Object.hasOwn(PLAN_NAMES, plan)) {
    return { error: 'Invalid plan selection' };
  }

  const page = await Page.findOne({ slug: videoInsightsPage.slug }, { 'sections.pricing': 1 }).lean();
  const pricing = page?.sections?.pricing;
  if (!pricing) return { error: 'Pricing is not available right now' };

  const enabledLevels = pricing.enabled_levels || pricing.levels || [];
  const types = pricing.selection_types || [];
  if (!enabledLevels.includes(level)) return { error: `${level} plans are not available yet` };
  if (!types.includes(type) || (pricing.coming_soon_types || []).includes(type)) {
    return { error: `${type} plans are not available yet` };
  }

  const options =
    type === 'Subject Wise' ? pricing.subjects?.[level] : type === 'Group Wise' ? pricing.groups?.[level] : [BOTH_GROUPS];
  const resolvedItem = type === BOTH_GROUPS ? BOTH_GROUPS : item;
  if (!options?.includes(resolvedItem)) return { error: 'Please choose a valid subject or group' };

  const price = Number(pricing.pricing_by_type?.[type]?.[plan]);
  if (!Number.isFinite(price) || price <= 0) return { error: 'This plan is not available right now' };

  return {
    quote: { level, type, item: resolvedItem, plan, planName: PLAN_NAMES[plan], price, currency: 'INR' },
  };
}
