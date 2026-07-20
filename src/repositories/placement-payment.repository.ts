import { getRepository, getManager } from 'typeorm';
import { PlacementPaymentTransaction, PlacementPaymentTransactionStatus } from '../entities/placement-payment/placement-payment-transaction.entity';
import { PlacementAssignment } from '../entities/placement-assignment/placement-assignment.entity';
import ApiUtility from '../utilities/api.utility';

export type PlacementPaymentStatus = 'Pending' | 'Partially Paid' | 'Paid';

export interface IPlacementPaymentListParams {
  facility_id?: number;
  payment_status?: PlacementPaymentStatus;
  start_date_from?: string;
  start_date_to?: string;
  search?: string;
  limit?: number;
  page?: number;
}

export interface IPlacementPaymentSummaryRow {
  placementslot_id: number;
  facility_id: number;
  facility_name: string;
  placementslot_type: string[] | null;
  placement_start_date: string | null;
  placement_end_date: string | null;
  total_slots_offered: number;
  accepted_students: number;
  fee_per_student: number;
  total_payable: number;
  total_paid: number;
  remaining_amount: number;
  payment_status: PlacementPaymentStatus;
}

export interface ICreatePlacementPaymentTransaction {
  placementslot_id: number;
  facility_id: number;
  amount: number;
  payment_date?: string;
  payment_reference?: string;
  invoice_number?: string;
  notes?: string;
  proof_attachments?: string[];
  paid_by: number;
}

export default class PlacementPaymentRepository {

  static computeStatus(totalPayable: number, totalPaid: number): PlacementPaymentStatus {
    if (totalPaid <= 0) return 'Pending';
    if (totalPaid < totalPayable) return 'Partially Paid';
    return 'Paid';
  }

  private static toSummaryRow(row: any): IPlacementPaymentSummaryRow {
    const totalPayable = Number(row.total_payable) || 0;
    const totalPaid = Number(row.total_paid) || 0;
    return {
      placementslot_id: Number(row.placementslot_id),
      facility_id: Number(row.facility_id),
      facility_name: row.facility_name,
      placementslot_type: row.placementslot_type ? (typeof row.placementslot_type === 'string' ? JSON.parse(row.placementslot_type) : row.placementslot_type) : null,
      placement_start_date: row.placement_start_date,
      placement_end_date: row.placement_end_date,
      total_slots_offered: Number(row.total_slots_offered) || 0,
      accepted_students: Number(row.accepted_students) || 0,
      fee_per_student: Number(row.fee_per_student) || 0,
      total_payable: totalPayable,
      total_paid: totalPaid,
      remaining_amount: Math.max(0, totalPayable - totalPaid),
      payment_status: this.computeStatus(totalPayable, totalPaid),
    };
  }

  // Base aggregation query shared by list() and getSlotSummary()
  private static async fetchSlotSummaries(params: {
    facility_id?: number;
    start_date_from?: string;
    start_date_to?: string;
    search?: string;
    placementslot_id?: number;
  }): Promise<any[]> {
    const manager = getManager();
    const conditions: string[] = ['ps.is_deleted = 0'];
    const values: any[] = [];

    if (params.placementslot_id) {
      conditions.push('ps.placementslot_id = ?');
      values.push(params.placementslot_id);
    }
    if (params.facility_id) {
      conditions.push('CAST(ps.facility_id AS UNSIGNED) = ?');
      values.push(params.facility_id);
    }
    if (params.start_date_from) {
      conditions.push('ps.placement_start_date >= ?');
      values.push(params.start_date_from);
    }
    if (params.start_date_to) {
      conditions.push('ps.placement_start_date <= ?');
      values.push(params.start_date_to);
    }
    if (params.search) {
      conditions.push('f.organization_name LIKE ?');
      values.push(`%${params.search}%`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    return manager.query(
      `
      SELECT
        ps.placementslot_id,
        CAST(ps.facility_id AS UNSIGNED) AS facility_id,
        f.organization_name AS facility_name,
        ps.placementslot_type,
        ps.placement_start_date,
        ps.placement_end_date,
        ps.total_slots_offered,
        COALESCE(accepted.accepted_students, 0) AS accepted_students,
        CASE WHEN ps.placement_fee IS NOT NULL AND ps.placement_fee != '' THEN CAST(ps.placement_fee AS DECIMAL(15,2)) ELSE 0 END AS fee_per_student,
        COALESCE(accepted.accepted_students, 0) * (CASE WHEN ps.placement_fee IS NOT NULL AND ps.placement_fee != '' THEN CAST(ps.placement_fee AS DECIMAL(15,2)) ELSE 0 END) AS total_payable,
        COALESCE(paid.total_paid, 0) AS total_paid
      FROM placement_slots ps
      INNER JOIN facility f ON CAST(ps.facility_id AS UNSIGNED) = f.facility_id AND f.isDeleted = 0
      LEFT JOIN (
        SELECT placementslot_id, COUNT(*) AS accepted_students
        FROM placement_assignments
        WHERE facility_confirmation_status = 'Approved'
        GROUP BY placementslot_id
      ) accepted ON accepted.placementslot_id = ps.placementslot_id
      LEFT JOIN (
        SELECT placementslot_id, SUM(amount) AS total_paid
        FROM placement_payment_transactions
        WHERE status = 'Recorded'
        GROUP BY placementslot_id
      ) paid ON paid.placementslot_id = ps.placementslot_id
      ${whereClause}
      ORDER BY ps.placementslot_id DESC
      `,
      values
    );
  }

  static async list(params: IPlacementPaymentListParams): Promise<{ rows: IPlacementPaymentSummaryRow[]; total: number }> {
    const rawRows = await this.fetchSlotSummaries({
      facility_id: params.facility_id,
      start_date_from: params.start_date_from,
      start_date_to: params.start_date_to,
      search: params.search,
    });

    let rows = rawRows.map((r) => this.toSummaryRow(r));

    if (params.payment_status) {
      rows = rows.filter((r) => r.payment_status === params.payment_status);
    }

    const total = rows.length;
    const limit = params.limit || 20;
    const page = params.page || 1;
    const offset = ApiUtility.getOffset(limit, page);
    rows = rows.slice(offset, offset + limit);

    return { rows, total };
  }

  static async getSlotSummary(placementslotId: number): Promise<IPlacementPaymentSummaryRow | null> {
    const rawRows = await this.fetchSlotSummaries({ placementslot_id: placementslotId });
    if (!rawRows.length) return null;
    return this.toSummaryRow(rawRows[0]);
  }

  static async getAcceptedStudentsForSlot(placementslotId: number): Promise<any[]> {
    return getRepository(PlacementAssignment)
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.student', 'student')
      .where('assignment.placementslot_id = :placementslotId', { placementslotId })
      .andWhere('assignment.facility_confirmation_status = :confirmed', { confirmed: 'Approved' })
      .getMany();
  }

  static async getTransactionHistory(placementslotId: number): Promise<PlacementPaymentTransaction[]> {
    return getRepository(PlacementPaymentTransaction).find({
      where: { placementslot_id: placementslotId },
      relations: ['paidByUser'],
      order: { created_at: 'DESC' },
    });
  }

  static async getTransactionById(transactionId: number): Promise<PlacementPaymentTransaction | undefined> {
    return getRepository(PlacementPaymentTransaction).findOne({ where: { transaction_id: transactionId } });
  }

  static async createTransaction(data: ICreatePlacementPaymentTransaction): Promise<PlacementPaymentTransaction> {
    const repo = getRepository(PlacementPaymentTransaction);
    const transaction = repo.create({
      placementslot_id: data.placementslot_id,
      facility_id: data.facility_id,
      amount: data.amount,
      payment_date: data.payment_date ? new Date(data.payment_date) : new Date(),
      payment_reference: data.payment_reference,
      invoice_number: data.invoice_number,
      notes: data.notes,
      proof_attachments: data.proof_attachments || [],
      paid_by: data.paid_by,
      status: PlacementPaymentTransactionStatus.RECORDED,
    });
    return repo.save(transaction);
  }

  static async reverseTransaction(transactionId: number, reason: string): Promise<PlacementPaymentTransaction> {
    const repo = getRepository(PlacementPaymentTransaction);
    await repo.update(
      { transaction_id: transactionId },
      { status: PlacementPaymentTransactionStatus.REVERSED, reversal_reason: reason }
    );
    return (await repo.findOne({ where: { transaction_id: transactionId } })) as PlacementPaymentTransaction;
  }
}
