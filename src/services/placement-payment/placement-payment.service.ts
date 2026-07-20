import { getRepository } from 'typeorm';
import { User } from '../../entities/user/user.entity';
import { Facility } from '../../entities/facility/facility.entity';
import { PlacementSlot } from '../../entities/placement-slot/placement-slot.entity';
import { FacilitySupervisor } from '../../entities/facility-supervisor/facility-supervisor.entity';
import PlacementPaymentRepository, {
  IPlacementPaymentListParams,
  IPlacementPaymentSummaryRow,
} from '../../repositories/placement-payment.repository';
import { StringError } from '../../errors/string.error';
import NotificationService from '../notification/notification.service';

export interface ICreatePaymentTransactionParams {
  amount: number;
  payment_date?: string;
  payment_reference?: string;
  invoice_number?: string;
  notes?: string;
  proof_attachments?: string[];
  paid_by: number;
}

const list = async (params: IPlacementPaymentListParams) => {
  return PlacementPaymentRepository.list(params);
};

const resolveFacilityIdForUser = async (userId: number, roleId: number): Promise<number> => {
  if (roleId === 2) {
    const user = await getRepository(User).findOne({
      where: { id: userId, isDeleted: false },
      select: ['facilityID'],
    });
    if (!user || user.facilityID === null || user.facilityID === undefined) {
      throw new StringError('Facility user is not linked to any facility');
    }
    return user.facilityID;
  }

  if (roleId === 3) {
    const user = await getRepository(User).findOne({
      where: { id: userId, isDeleted: false },
      select: ['supervisorID'],
    });
    if (!user?.supervisorID) {
      throw new StringError('Supervisor user is not linked to any facility');
    }

    const supervisor = await getRepository(FacilitySupervisor).findOne({
      where: { supervisor_id: user.supervisorID, isDeleted: false },
      select: ['facility_id'],
    });
    if (!supervisor || supervisor.facility_id === null || supervisor.facility_id === undefined) {
      throw new StringError('Supervisor user is not linked to any facility');
    }
    return supervisor.facility_id;
  }

  throw new StringError('Only Facility or Supervisor users can access this endpoint');
};

const listForFacilityUser = async (userId: number, roleId: number) => {
  const facilityId = await resolveFacilityIdForUser(userId, roleId);
  return PlacementPaymentRepository.list({ facility_id: facilityId });
};

const getSlotDetail = async (
  placementslotId: number,
  requestingUser: { roleID: number; id: number }
): Promise<{
  summary: IPlacementPaymentSummaryRow;
  acceptedStudents: any[];
  transactions: any[];
}> => {
  const summary = await PlacementPaymentRepository.getSlotSummary(placementslotId);
  if (!summary) {
    throw new StringError('Placement slot does not exist');
  }

  // Facility / Supervisor users may only view their own facility's payment detail
  if (requestingUser.roleID === 2 || requestingUser.roleID === 3) {
    const scopedFacilityId = await resolveFacilityIdForUser(requestingUser.id, requestingUser.roleID);
    if (scopedFacilityId !== summary.facility_id) {
      throw new StringError('You do not have access to this placement slot');
    }
  }

  const [acceptedStudents, transactions] = await Promise.all([
    PlacementPaymentRepository.getAcceptedStudentsForSlot(placementslotId),
    PlacementPaymentRepository.getTransactionHistory(placementslotId),
  ]);

  return { summary, acceptedStudents, transactions };
};

const notifyPayment = async (summary: IPlacementPaymentSummaryRow, becamePaid: boolean) => {
  const facilityUser = await getRepository(User).findOne({
    where: { facilityID: summary.facility_id, roleID: 2, isDeleted: false },
  });
  const notifyTargets: number[] = [];
  if (facilityUser) notifyTargets.push(facilityUser.id);

  const supervisors = await getRepository(FacilitySupervisor).find({ where: { facility_id: summary.facility_id, isDeleted: false } });
  if (supervisors.length > 0) {
    const supervisorUsers = await getRepository(User).find({
      where: supervisors.map((s) => ({ supervisorID: s.supervisor_id, roleID: 3, isDeleted: false })),
    });
    notifyTargets.push(...supervisorUsers.map((u) => u.id));
  }

  for (const userId of notifyTargets) {
    NotificationService.createNotification({
      userId,
      title: 'Placement Payment Received',
      message: `A payment of $${summary.total_paid.toFixed(2)} has been recorded for ${summary.facility_name}'s placement (slot #${summary.placementslot_id}).`,
      type: 'success',
      actionUrl: '/placement-payments/my-payments',
    }).catch(() => {});
  }

  if (becamePaid) {
    const adminUsers = await getRepository(User).find({ where: { roleID: 1, isDeleted: false } });
    const fullyPaidTargets = [...notifyTargets, ...adminUsers.map((u) => u.id)];
    for (const userId of fullyPaidTargets) {
      NotificationService.createNotification({
        userId,
        title: 'Placement Fully Paid',
        message: `Placement slot #${summary.placementslot_id} for ${summary.facility_name} is now fully paid.`,
        type: 'success',
        actionUrl: '/placement-payments',
      }).catch(() => {});
    }
  }
};

const createTransaction = async (
  placementslotId: number,
  params: ICreatePaymentTransactionParams
) => {
  const slot = await getRepository(PlacementSlot).findOne({ where: { placementslot_id: placementslotId, is_deleted: false } });
  if (!slot) {
    throw new StringError('Placement slot does not exist');
  }

  const facilityId = parseInt(slot.facility_id as any, 10);
  if (!facilityId || Number.isNaN(facilityId)) {
    throw new StringError('Placement slot is not linked to a valid facility');
  }

  if (!params.amount || params.amount <= 0) {
    throw new StringError('Payment amount must be greater than zero');
  }

  const summaryBefore = await PlacementPaymentRepository.getSlotSummary(placementslotId);
  if (!summaryBefore) {
    throw new StringError('Placement slot does not exist');
  }

  if (params.amount > summaryBefore.remaining_amount) {
    throw new StringError(
      `Payment amount ($${params.amount.toFixed(2)}) exceeds the remaining balance ($${summaryBefore.remaining_amount.toFixed(2)})`
    );
  }

  await PlacementPaymentRepository.createTransaction({
    placementslot_id: placementslotId,
    facility_id: facilityId,
    amount: params.amount,
    payment_date: params.payment_date,
    payment_reference: params.payment_reference,
    invoice_number: params.invoice_number,
    notes: params.notes,
    proof_attachments: params.proof_attachments,
    paid_by: params.paid_by,
  });

  const summaryAfter = await PlacementPaymentRepository.getSlotSummary(placementslotId);
  const becamePaid = summaryAfter?.payment_status === 'Paid' && summaryBefore.payment_status !== 'Paid';

  if (summaryAfter) {
    notifyPayment(summaryAfter, becamePaid).catch(() => {});
  }

  const [acceptedStudents, transactions] = await Promise.all([
    PlacementPaymentRepository.getAcceptedStudentsForSlot(placementslotId),
    PlacementPaymentRepository.getTransactionHistory(placementslotId),
  ]);

  return { summary: summaryAfter, acceptedStudents, transactions };
};

const reverseTransaction = async (transactionId: number, reason: string) => {
  if (!reason || !reason.trim()) {
    throw new StringError('A reason is required to reverse a payment transaction');
  }

  const transaction = await PlacementPaymentRepository.getTransactionById(transactionId);
  if (!transaction) {
    throw new StringError('Payment transaction does not exist');
  }
  if (transaction.status === 'Reversed') {
    throw new StringError('This payment transaction has already been reversed');
  }

  await PlacementPaymentRepository.reverseTransaction(transactionId, reason);

  const summary = await PlacementPaymentRepository.getSlotSummary(transaction.placementslot_id);
  const [acceptedStudents, transactions] = await Promise.all([
    PlacementPaymentRepository.getAcceptedStudentsForSlot(transaction.placementslot_id),
    PlacementPaymentRepository.getTransactionHistory(transaction.placementslot_id),
  ]);

  return { summary, acceptedStudents, transactions };
};

const getTransactionAttachmentPath = async (
  transactionId: number,
  attachmentIndex: number,
  requestingUser: { roleID: number; id: number }
): Promise<string> => {
  const transaction = await PlacementPaymentRepository.getTransactionById(transactionId);
  if (!transaction) {
    throw new StringError('Payment transaction does not exist');
  }

  // Facility / Supervisor users may only view attachments for their own facility's transactions
  if (requestingUser.roleID === 2 || requestingUser.roleID === 3) {
    const scopedFacilityId = await resolveFacilityIdForUser(requestingUser.id, requestingUser.roleID);
    if (scopedFacilityId !== transaction.facility_id) {
      throw new StringError('You do not have access to this payment transaction');
    }
  }

  const attachments = transaction.proof_attachments || [];
  const relativePath = attachments[attachmentIndex];
  if (!relativePath) {
    throw new StringError('Attachment not found for this payment transaction');
  }

  return relativePath;
};

export default {
  list,
  listForFacilityUser,
  getSlotDetail,
  getTransactionAttachmentPath,
  createTransaction,
  reverseTransaction,
  resolveFacilityIdForUser,
};
