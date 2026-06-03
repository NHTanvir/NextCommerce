export type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'completed';
export type ReturnReason = 'defective' | 'wrong_item' | 'not_as_described' | 'changed_mind' | 'other';

export interface ReturnRequestDto {
  id: string;
  orderId: string;
  userId: string;
  reason: ReturnReason;
  notes: string | null;
  adminNotes: string | null;
  status: ReturnStatus;
  createdAt: string;
  updatedAt: string;
}

export const RETURN_REASON_LABELS: Record<ReturnReason, string> = {
  defective: 'Defective / Damaged',
  wrong_item: 'Wrong Item Received',
  not_as_described: 'Not as Described',
  changed_mind: 'Changed My Mind',
  other: 'Other',
};

export const RETURN_STATUS_SEVERITY: Record<ReturnStatus, 'warning' | 'success' | 'error' | 'info'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  completed: 'info',
};
