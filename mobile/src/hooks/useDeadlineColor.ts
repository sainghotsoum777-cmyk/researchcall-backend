import { useMemo } from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import { DEADLINE_URGENCY_DAYS, COLORS } from '../constants';

export function useDeadlineColor(deadline: string | undefined) {
  return useMemo(() => {
    if (!deadline) return { color: COLORS.text.secondary.light, label: '' };
    const days = differenceInDays(parseISO(deadline), new Date());
    if (days < 0) return { color: COLORS.text.muted.light, label: 'ExpirÃ©', days };
    if (days <= DEADLINE_URGENCY_DAYS.CRITICAL)
      return { color: COLORS.danger, label: `${days}j restants`, days, urgent: true };
    if (days <= DEADLINE_URGENCY_DAYS.WARNING)
      return { color: COLORS.warning, label: `${days}j restants`, days };
    if (days <= DEADLINE_URGENCY_DAYS.SOON)
      return { color: COLORS.primary, label: `${days}j restants`, days };
    return { color: COLORS.success, label: `${days}j restants`, days };
  }, [deadline]);
}