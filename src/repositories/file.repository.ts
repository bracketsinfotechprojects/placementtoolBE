import { getRepository, SelectQueryBuilder } from 'typeorm';
import { File, EntityType, DocumentType } from '../entities/file/file.entity';
import ApiUtility from '../utilities/api.utility';

export default class FileRepository {
  private static getBaseQuery(): SelectQueryBuilder<File> {
    return getRepository(File)
      .createQueryBuilder('file')
      .where('file.is_active = :is_active', { is_active: true });
  }

  /**
   * Find file by ID
   */
  static async findById(id: number): Promise<File | undefined> {
    return await getRepository(File).findOne({
      where: { id, is_active: true }
    });
  }

  /**
   * Find all files for a specific entity
   */
  static async findByEntity(
    entityType: EntityType,
    entityId: number
  ): Promise<File[]> {
    return await getRepository(File).find({
      where: {
        entity_type: entityType,
        entity_id: entityId,
        is_active: true
      },
      order: { uploaded_at: 'DESC' }
    });
  }

  /**
   * Find files by entity and document type
   */
  static async findByEntityAndDocType(
    entityType: EntityType,
    entityId: number,
    docType: DocumentType
  ): Promise<File[]> {
    return await getRepository(File).find({
      where: {
        entity_type: entityType,
        entity_id: entityId,
        doc_type: docType,
        is_active: true
      },
      order: { version: 'DESC', uploaded_at: 'DESC' }
    });
  }

  /**
   * Get latest version of a specific document
   */
  static async getLatestVersion(
    entityType: EntityType,
    entityId: number,
    docType: DocumentType
  ): Promise<File | undefined> {
    return await getRepository(File).findOne({
      where: {
        entity_type: entityType,
        entity_id: entityId,
        doc_type: docType,
        is_active: true
      },
      order: { version: 'DESC', uploaded_at: 'DESC' }
    });
  }

  /**
   * Create a new file record
   */
  static async create(fileData: ICreateFile): Promise<File> {
    const file = new File();
    file.entity_type = fileData.entity_type;
    file.entity_id = fileData.entity_id;
    file.doc_type = fileData.doc_type;
    file.file_path = fileData.file_path;
    file.file_name = fileData.file_name;
    file.mime_type = fileData.mime_type;
    file.file_size = fileData.file_size;
    file.version = fileData.version || 1;
    file.is_active = true;
    file.expiry_date = fileData.expiry_date || null;

    return await getRepository(File).save(file);
  }

  /**
   * Soft delete a file (mark as inactive)
   */
  static async softDelete(id: number): Promise<void> {
    await getRepository(File).update(
      { id, is_active: true },
      { is_active: false }
    );
  }

  /**
   * Soft delete all files for an entity
   */
  static async softDeleteByEntity(
    entityType: EntityType,
    entityId: number
  ): Promise<void> {
    await getRepository(File).update(
      { entity_type: entityType, entity_id: entityId, is_active: true },
      { is_active: false }
    );
  }

  /**
   * Get file statistics by entity type
   */
  static async getStatsByEntityType(entityType: EntityType): Promise<{
    total_files: number;
    total_size: number;
    by_doc_type: Array<{ doc_type: string; count: number }>;
  }> {
    const files = await getRepository(File).find({
      where: { entity_type: entityType, is_active: true }
    });

    const totalSize = files.reduce((sum, file) => sum + (file.file_size || 0), 0);

    const byDocType = files.reduce((acc, file) => {
      const existing = acc.find(item => item.doc_type === file.doc_type);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ doc_type: file.doc_type, count: 1 });
      }
      return acc;
    }, [] as Array<{ doc_type: string; count: number }>);

    return {
      total_files: files.length,
      total_size: totalSize,
      by_doc_type: byDocType
    };
  }

  /**
   * Find files with filters and pagination
   */
  static async findWithFilters(params: IFileQueryParams): Promise<{
    files: File[];
    total: number;
  }> {
    let query = this.getBaseQuery();

    if (params.entity_type) {
      query = query.andWhere('file.entity_type = :entity_type', {
        entity_type: params.entity_type
      });
    }

    if (params.entity_id) {
      query = query.andWhere('file.entity_id = :entity_id', {
        entity_id: params.entity_id
      });
    }

    if (params.doc_type) {
      query = query.andWhere('file.doc_type = :doc_type', {
        doc_type: params.doc_type
      });
    }

    if (params.mime_type) {
      query = query.andWhere('file.mime_type LIKE :mime_type', {
        mime_type: `%${params.mime_type}%`
      });
    }

    if (params.uploaded_from) {
      query = query.andWhere('file.uploaded_at >= :uploaded_from', {
        uploaded_from: params.uploaded_from
      });
    }

    if (params.uploaded_to) {
      query = query.andWhere('file.uploaded_at <= :uploaded_to', {
        uploaded_to: params.uploaded_to
      });
    }

    const total = await query.getCount();

    // Apply sorting
    const sortBy = params.sort_by || 'uploaded_at';
    const sortOrder = params.sort_order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query = query.orderBy(`file.${sortBy}`, sortOrder);

    // Apply pagination
    const limit = params.limit || 20;
    const page = params.page || 1;
    const offset = ApiUtility.getOffset(limit, page);
    query = query.limit(limit).offset(offset);

    const files = await query.getMany();

    return { files, total };
  }

  /**
   * Permanently delete a file record
   */
  static async permanentlyDelete(id: number): Promise<void> {
    await getRepository(File).delete({ id });
  }
}

export interface ICreateFile {
  entity_type: EntityType;
  entity_id: number;
  doc_type: DocumentType;
  file_path: string;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
  version?: number;
  expiry_date?: Date | null;
}

export interface IFileQueryParams {
  entity_type?: EntityType;
  entity_id?: number;
  doc_type?: DocumentType;
  mime_type?: string;
  uploaded_from?: string;
  uploaded_to?: string;
  sort_by?: string;
  sort_order?: string;
  limit?: number;
  page?: number;
}
