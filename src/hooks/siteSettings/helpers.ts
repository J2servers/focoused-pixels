import type { SiteSettingsValues } from './buildSiteSettings';

export const makeQuantityDiscountResolver = (s: SiteSettingsValues) => (quantity: number): number => {
  if (quantity >= 100) return s.quantityDiscount100;
  if (quantity >= 50) return s.quantityDiscount50;
  if (quantity >= 20) return s.quantityDiscount20;
  if (quantity >= 10) return s.quantityDiscount10;
  return 0;
};

export const makeStoreOpenChecker = (s: SiteSettingsValues) => (): boolean => {
  if (s.maintenanceMode) return false;
  return s.storeStatus === 'open';
};
