import type { CompanyInfo } from './types';

export const sanitizeCompanyPayload = (data: Partial<CompanyInfo>): Partial<CompanyInfo> =>
  Object.fromEntries(
    Object.entries(data).filter(([key, value]) => {
      if (key === 'id') return false;
      if (value === undefined) return false;
      if (typeof value === 'number' && !Number.isFinite(value)) return false;
      return true;
    }),
  ) as Partial<CompanyInfo>;

/** Some columns may be missing in older deployments — strip them on retry. */
export const stripOptionalCompanyColumns = (data: Partial<CompanyInfo>): Partial<CompanyInfo> => {
  const retryPayload: Partial<CompanyInfo> = { ...data };
  delete retryPayload.header_logo_height;
  delete retryPayload.header_logo_mobile_height;
  delete retryPayload.footer_logo_height;
  // why_choose_us_config is a confirmed JSONB column — never strip it.
  return retryPayload;
};

export const isMissingColumnError = (error: { code?: string; message?: string } | null): boolean => {
  if (!error) return false;
  if (error.code === '42703') return true;
  return Boolean(error.message?.toLowerCase().includes('column'));
};
