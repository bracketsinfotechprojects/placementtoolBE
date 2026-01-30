import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn
} from 'typeorm';

export enum EntityType {
  STUDENT = 'student',
  FACILITY = 'facility',
  PLACEMENT = 'placement',
  VISA = 'visa',
  JOB = 'job',
  AGREEMENT = 'agreement'
}

export enum DocumentType {
  AADHAAR = 'AADHAAR',
  PASSPORT = 'PASSPORT',
  VISA_DOCUMENT = 'VISA_DOCUMENT',
  OFFER_LETTER = 'OFFER_LETTER',
  REGISTRATION_PROOF = 'REGISTRATION_PROOF',
  SUPPORTING_DOCUMENT = 'SUPPORTING_DOCUMENT',
  MOU_DOCUMENT = 'MOU_DOCUMENT',
  INSURANCE_DOCUMENT = 'INSURANCE_DOCUMENT',
  PLACEMENT_DOCUMENT = 'PLACEMENT_DOCUMENT',
  JOB_OFFER = 'JOB_OFFER',
  OTHER = 'OTHER'
}

@Entity('files', { orderBy: { id: 'DESC' } })
@Index(['id'])
@Index(['entity_type', 'entity_id'])
@Index(['doc_type'])
@Index(['is_active'])
@Index(['uploaded_at'])
export class File {

  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({
    type: 'enum',
    enum: EntityType,
    nullable: false,
    name: 'entity_type',
    comment: 'Type of entity (student, facility, placement, etc.)'
  })
  entity_type: EntityType;

  @Column({
    type: 'int',
    nullable: false,
    name: 'entity_id',
    comment: 'ID of the record in the entity table'
  })
  entity_id: number;

  @Column({
    type: 'enum',
    enum: DocumentType,
    nullable: false,
    name: 'doc_type',
    comment: 'Type of document (AADHAAR, OFFER_LETTER, etc.)'
  })
  doc_type: DocumentType;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: false,
    name: 'file_path',
    comment: 'Relative path or cloud URL to the file'
  })
  file_path: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'file_name',
    comment: 'Original filename'
  })
  file_name: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'mime_type',
    comment: 'MIME type of the file (e.g., application/pdf, image/jpeg)'
  })
  mime_type: string;

  @Column({
    type: 'bigint',
    nullable: true,
    name: 'file_size',
    comment: 'File size in bytes'
  })
  file_size: number;

  @Column({
    type: 'int',
    nullable: false,
    default: 1,
    name: 'version',
    comment: 'Version number for file versioning'
  })
  version: number;

  @Column({
    type: 'boolean',
    nullable: false,
    default: true,
    name: 'is_active',
    comment: 'Whether this file version is active'
  })
  is_active: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'uploaded_at',
    comment: 'Timestamp when file was uploaded'
  })
  uploaded_at: Date;

  // Helper methods
  getFileExtension(): string {
    if (!this.file_name) return '';
    const parts = this.file_name.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }

  isImage(): boolean {
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return imageTypes.includes(this.mime_type?.toLowerCase() || '');
  }

  isPDF(): boolean {
    return this.mime_type?.toLowerCase() === 'application/pdf';
  }

  getFileSizeInMB(): number {
    return this.file_size ? this.file_size / (1024 * 1024) : 0;
  }

  toJSON() {
    const { ...result } = this;
    return result;
  }
}
