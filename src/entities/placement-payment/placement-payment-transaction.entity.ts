import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Index,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { PlacementSlot } from '../placement-slot/placement-slot.entity';
import { Facility } from '../facility/facility.entity';
import { User } from '../user/user.entity';

export enum PlacementPaymentTransactionStatus {
  RECORDED = 'Recorded',
  REVERSED = 'Reversed'
}

@Entity('placement_payment_transactions')
@Index(['placementslot_id'])
@Index(['facility_id'])
@Index(['payment_date'])
@Index(['status'])
export class PlacementPaymentTransaction {

  @PrimaryGeneratedColumn({ type: 'int', name: 'transaction_id' })
  transaction_id: number;

  @Column({
    type: 'int',
    nullable: false,
    name: 'placementslot_id',
    comment: 'Reference to placement_slots table'
  })
  placementslot_id: number;

  @Column({
    type: 'int',
    nullable: false,
    name: 'facility_id',
    comment: 'Denormalized reference to facility table for fast facility-scoped queries'
  })
  facility_id: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: false,
    name: 'amount',
    comment: 'Amount paid in this transaction'
  })
  amount: number;

  @Column({
    type: 'date',
    nullable: false,
    default: () => 'CURRENT_DATE',
    name: 'payment_date',
    comment: 'Date the payment was made'
  })
  payment_date: Date;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'payment_reference',
    comment: 'Bank transfer / cheque / transaction reference'
  })
  payment_reference: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'invoice_number',
    comment: 'Invoice number associated with this payment'
  })
  invoice_number: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'notes',
    comment: 'Free-text notes about this payment'
  })
  notes: string;

  @Column({
    type: 'json',
    nullable: true,
    name: 'proof_attachments',
    comment: 'Array of uploaded proof-of-payment file paths'
  })
  proof_attachments: string[];

  @Column({
    type: 'enum',
    enum: PlacementPaymentTransactionStatus,
    nullable: false,
    default: PlacementPaymentTransactionStatus.RECORDED,
    name: 'status',
    comment: 'Recorded or Reversed (soft-cancelled, never hard-deleted)'
  })
  status: PlacementPaymentTransactionStatus;

  @Column({
    type: 'text',
    nullable: true,
    name: 'reversal_reason',
    comment: 'Reason given when this transaction was reversed'
  })
  reversal_reason: string;

  @Column({
    type: 'int',
    nullable: false,
    name: 'paid_by',
    comment: 'User (admin) who recorded this payment'
  })
  paid_by: number;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    comment: 'Record creation timestamp'
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    comment: 'Record update timestamp'
  })
  updated_at: Date;

  // Relationships
  @ManyToOne(() => PlacementSlot, { eager: false })
  @JoinColumn({ name: 'placementslot_id' })
  placementSlot: PlacementSlot;

  @ManyToOne(() => Facility, { eager: false })
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'paid_by' })
  paidByUser: User;

  toJSON() {
    const { ...result } = this;
    return result;
  }
}
