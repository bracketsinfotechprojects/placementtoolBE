import { Request, Response } from 'express';
import * as path from 'path';
import BaseController from '../base.controller';
import PlacementPaymentService from '../../services/placement-payment/placement-payment.service';
import ApiResponseUtility from '../../utilities/api-response.utility';
import IRequest from '../../interfaces/IRequest';
import { StringError } from '../../errors/string.error';
import { PlacementPaymentStatus } from '../../repositories/placement-payment.repository';

const ADMIN_ROLE_ID = 1;
const FACILITY_ROLE_ID = 2;
const SUPERVISOR_ROLE_ID = 3;
const PLACEMENT_EXECUTIVE_ROLE_ID = 4;

export default class PlacementPaymentController extends BaseController {

  static async list(req: IRequest, res: Response) {
    await BaseController.executeAction(res, async () => {
      const { roleID } = req.user as any;
      if (roleID !== ADMIN_ROLE_ID && roleID !== PLACEMENT_EXECUTIVE_ROLE_ID) {
        throw new StringError('Access restricted to admin and placement executive roles');
      }

      const params = {
        facility_id: req.query.facility_id ? parseInt(req.query.facility_id as string, 10) : undefined,
        payment_status: req.query.payment_status as PlacementPaymentStatus | undefined,
        start_date_from: req.query.start_date_from as string,
        start_date_to: req.query.start_date_to as string,
        search: req.query.search as string,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      };

      const result = await PlacementPaymentService.list(params);
      const totalPages = Math.ceil(result.total / (params.limit || 20));
      const pagination = {
        totalPages,
        currentPage: params.page,
        previousPage: (params.page as number) > 1 ? (params.page as number) - 1 : null,
        nextPage: (params.page as number) < totalPages ? (params.page as number) + 1 : null,
        totalItems: result.total,
      };

      ApiResponseUtility.success(res, result.rows, 'Placement payments retrieved successfully', pagination);
    }, 'List placement payments');
  }

  static async listForFacilityUser(req: IRequest, res: Response) {
    await BaseController.executeAction(res, async () => {
      const user = req.user as any;
      if (!user) {
        throw new StringError('Unauthorized');
      }
      if (user.roleID !== FACILITY_ROLE_ID && user.roleID !== SUPERVISOR_ROLE_ID) {
        throw new StringError('Only Facility or Supervisor users can access this endpoint');
      }

      const result = await PlacementPaymentService.listForFacilityUser(user.id, user.roleID);
      ApiResponseUtility.success(res, result.rows, 'Placement payments retrieved successfully');
    }, 'List placement payments for facility user');
  }

  static async getSlotDetail(req: IRequest, res: Response) {
    await BaseController.executeAction(res, async () => {
      const user = req.user as any;
      const slotId = BaseController.parseId(req, 'slotId');

      if (![ADMIN_ROLE_ID, PLACEMENT_EXECUTIVE_ROLE_ID, FACILITY_ROLE_ID, SUPERVISOR_ROLE_ID].includes(user.roleID)) {
        throw new StringError('Access restricted');
      }

      const result = await PlacementPaymentService.getSlotDetail(slotId, user);
      ApiResponseUtility.success(res, result, 'Placement payment detail retrieved successfully');
    }, 'Get placement payment detail');
  }

  static async createTransaction(req: IRequest, res: Response) {
    await BaseController.executeAction(res, async () => {
      const user = req.user as any;
      if (user.roleID !== ADMIN_ROLE_ID && user.roleID !== PLACEMENT_EXECUTIVE_ROLE_ID) {
        throw new StringError('Access restricted to admin and placement executive roles');
      }

      const slotId = BaseController.parseId(req, 'slotId');

      const proofAttachments: string[] = [];
      if (req.files && Array.isArray(req.files)) {
        (req.files as Express.Multer.File[]).forEach((file) => {
          const relativePath = path.relative(process.cwd(), file.path).replace(/\\/g, '/');
          proofAttachments.push(relativePath);
        });
      }

      const result = await PlacementPaymentService.createTransaction(slotId, {
        amount: parseFloat(req.body.amount),
        payment_date: req.body.payment_date,
        payment_reference: req.body.payment_reference,
        invoice_number: req.body.invoice_number,
        notes: req.body.notes,
        proof_attachments: proofAttachments.length > 0 ? proofAttachments : undefined,
        paid_by: user.id,
      });

      ApiResponseUtility.createdSuccess(res, result, 'Payment recorded successfully');
    }, 'Record placement payment transaction');
  }

  static async reverseTransaction(req: IRequest, res: Response) {
    await BaseController.executeAction(res, async () => {
      const user = req.user as any;
      if (user.roleID !== ADMIN_ROLE_ID) {
        throw new StringError('Access restricted to admin role');
      }

      const transactionId = BaseController.parseId(req, 'transactionId');
      const { reason } = req.body;

      const result = await PlacementPaymentService.reverseTransaction(transactionId, reason);
      ApiResponseUtility.success(res, result, 'Payment transaction reversed successfully');
    }, 'Reverse placement payment transaction');
  }
}
