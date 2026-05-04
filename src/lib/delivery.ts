/**
 * Pure delivery-estimation helpers.
 * Combines production days + transit days into a min/max business-day window.
 * No IO — fully testable and reusable on edge functions if needed.
 */
import { addBusinessDays } from 'date-fns';

export interface DayRange {
  min: number;
  max: number;
}

/**
 * Parse strings like "4 a 10 dias úteis", "5 dias úteis", "3-7" into a numeric range.
 * Returns { min: 0, max: 0 } if no number is found.
 */
export function parseDayRange(input: string | null | undefined): DayRange {
  if (!input) return { min: 0, max: 0 };
  const nums = input.match(/\d+/g)?.map(Number) ?? [];
  if (nums.length === 0) return { min: 0, max: 0 };
  if (nums.length === 1) return { min: nums[0], max: nums[0] };
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  return { min, max };
}

export interface DeliveryWindow {
  minDays: number;
  maxDays: number;
  minDate: Date;
  maxDate: Date;
}

/**
 * Combine production + transit ranges into a delivery window from a given start date.
 */
export function estimateDeliveryWindow(
  productionDays: string | null | undefined,
  transitDays: string | null | undefined,
  from: Date = new Date(),
): DeliveryWindow {
  const prod = parseDayRange(productionDays);
  const transit = parseDayRange(transitDays);
  const minDays = prod.min + transit.min;
  const maxDays = prod.max + transit.max;
  return {
    minDays,
    maxDays,
    minDate: addBusinessDays(from, minDays),
    maxDate: addBusinessDays(from, maxDays),
  };
}
