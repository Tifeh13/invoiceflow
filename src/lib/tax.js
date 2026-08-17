export const TAX_REGIONS = [
  { code: 'none', name: 'No tax', rate: 0, label: 'Tax' },
  { code: 'NG', name: 'Nigeria', rate: 7.5, label: 'VAT' },
  { code: 'UK', name: 'United Kingdom', rate: 20, label: 'VAT' },
  { code: 'EU', name: 'European Union', rate: 21, label: 'VAT' },
  { code: 'GH', name: 'Ghana', rate: 15, label: 'VAT' },
  { code: 'KE', name: 'Kenya', rate: 16, label: 'VAT' },
  { code: 'ZA', name: 'South Africa', rate: 15, label: 'VAT' },
  { code: 'US', name: 'United States', rate: 0, label: 'Sales tax' },
  { code: 'CA', name: 'Canada', rate: 13, label: 'HST' },
  { code: 'AU', name: 'Australia', rate: 10, label: 'GST' },
  { code: 'IN', name: 'India', rate: 18, label: 'GST' },
];

export const getTaxRegion = (code) => TAX_REGIONS.find((r) => r.code === code) || TAX_REGIONS[0];
