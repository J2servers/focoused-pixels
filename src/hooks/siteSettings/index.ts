import { useCompanyInfo } from '../useCompanyInfo';
import { buildSiteSettings } from './buildSiteSettings';
import { makeQuantityDiscountResolver, makeStoreOpenChecker } from './helpers';

export function useSiteSettings() {
  const { data: settings, isLoading } = useCompanyInfo();
  const values = buildSiteSettings(settings);

  return {
    ...values,
    isLoading,
    getQuantityDiscount: makeQuantityDiscountResolver(values),
    isStoreOpen: makeStoreOpenChecker(values),
    raw: settings,
  };
}

export type SiteSettings = ReturnType<typeof useSiteSettings>;
