import moment from 'moment';

import {DEFAULT_STATS_PERIOD} from 'app/constants';
import {parsePeriodToHours} from 'app/utils/dates';

const DEFAULT_TRUNCATE_LENGTH = 80;

// In minutes
const TWENTY_FOUR_HOURS = 1440;
const ONE_HOUR = 60;

export type DateTimeObject = {
  start: Date | null;
  end: Date | null;
  period?: string;
};

export function truncationFormatter(value: string, truncate: number): string {
  if (!truncate) {
    return value;
  }
  const truncationLength =
    truncate && typeof truncate === 'number' ? truncate : DEFAULT_TRUNCATE_LENGTH;
  return value.length > truncationLength
    ? value.substring(0, truncationLength) + '…'
    : value;
}

/**
 * Use a shorter interval if the time difference is <= 24 hours.
 */
export function useShortInterval(datetimeObj: DateTimeObject): boolean {
  const diffInMinutes = getDiffInMinutes(datetimeObj);

  return diffInMinutes <= TWENTY_FOUR_HOURS;
}

export function getInterval(datetimeObj: DateTimeObject, highFidelity = false) {
  const diffInMinutes = getDiffInMinutes(datetimeObj);

  if (diffInMinutes > TWENTY_FOUR_HOURS) {
    // Greater than 24 hours
    if (highFidelity) {
      return '30m';
    } else {
      return '24h';
    }
  }

  if (diffInMinutes <= ONE_HOUR) {
    // Less than or equal to 1 hour
    if (highFidelity) {
      return '1m';
    } else {
      return '5m';
    }
  }

  // Between 1 hour and 24 hours
  if (highFidelity) {
    return '5m';
  } else {
    return '15m';
  }
}

export function getDiffInMinutes(datetimeObj: DateTimeObject): number {
  const {period, start, end} = datetimeObj;

  if (start && end) {
    return moment(end).diff(start, 'minutes');
  }

  return (
    parsePeriodToHours(typeof period === 'string' ? period : DEFAULT_STATS_PERIOD) * 60
  );
}
