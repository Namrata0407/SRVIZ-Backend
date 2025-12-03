import { LeadStatus } from '@prisma/client';

const VALID_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  [LeadStatus.New]: [LeadStatus.Contacted],
  [LeadStatus.Contacted]: [LeadStatus.QuoteSent, LeadStatus.ClosedLost],
  [LeadStatus.QuoteSent]: [LeadStatus.Interested, LeadStatus.ClosedLost],
  [LeadStatus.Interested]: [LeadStatus.ClosedWon, LeadStatus.ClosedLost],
  [LeadStatus.ClosedWon]: [],
  [LeadStatus.ClosedLost]: [],
};

export function isValidTransition(from: LeadStatus, to: LeadStatus): boolean {
  if (from === to) {
    return true;
  }

  if (from === LeadStatus.ClosedWon || from === LeadStatus.ClosedLost) {
    return false;
  }

  const allowedTransitions = VALID_TRANSITIONS[from];
  return allowedTransitions.includes(to);
}

export function getValidNextStatuses(currentStatus: LeadStatus): LeadStatus[] {
  return VALID_TRANSITIONS[currentStatus] || [];
}

