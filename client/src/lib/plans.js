export const formatInr = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`;

export function firstItemFor(content, level, type) {
  if (type === 'Subject Wise') return content.subjects?.[level]?.[0] ?? '';
  if (type === 'Group Wise') return content.groups?.[level]?.[0] ?? '';
  return 'Both Groups';
}

// `pricing` is optional so the checkout summary can reuse the plan copy without the price table
export function buildPlans(type, item, pricing) {
  const label = type === 'Both Groups' ? 'Both Groups' : item;
  const forAllSubjects = type === 'Subject Wise' ? '' : ' for all subjects';

  return [
    {
      key: 'solo',
      name: 'Solo Plan',
      subtitle: label,
      price: pricing?.solo,
      features: [type === 'Subject Wise' ? 'Only 1 full test' : 'Only full tests'],
      cta: 'Get Solo Plan',
      popular: false,
    },
    {
      key: 'cumulative',
      name: 'Cumulative Plan',
      subtitle: label,
      price: pricing?.cumulative,
      features: [`Any 4 chapter-wise tests, 2 segment-wise tests, 2 full-tests${forAllSubjects}`],
      cta: 'Get Cumulative Plan',
      popular: true,
    },
    {
      key: 'lak',
      name: 'LAK',
      subtitle: label,
      price: pricing?.lak,
      features: [`All chapter-wise tests, 2 segment-wise tests, 2 full tests${forAllSubjects} + Question Bank`],
      cta: 'Get LAK',
      popular: false,
    },
  ];
}

export const checkoutHref = ({ level, type, item, plan }) => `/checkout?${new URLSearchParams({ level, type, item, plan })}`;
