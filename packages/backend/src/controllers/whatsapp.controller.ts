import { Request, Response, NextFunction } from 'express';
import {
  type CreateTemplateData,
  type GenerateMessageData,
  type UpdateTemplateData,
  whatsappService,
} from '../services/whatsapp.service.js';
import { MessageEventType, MessageTriggerType } from '@prisma/client';

/**
 * WhatsApp message controller
 */
export const whatsappController = {
  /**
   * Create a new message template
   * POST /api/whatsapp/templates
   */
  createTemplate: async (
    req: Request<unknown, unknown, CreateTemplateData>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { name, eventType, content, description } = req.body;

      if (!name || !eventType || !content) {
        return res.status(400).json({
          error: 'Name, eventType, and content are required',
        });
      }

      const template = await whatsappService.createTemplate({
        name,
        eventType,
        content,
        description,
      });

      res.status(201).json(template);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all templates
   * GET /api/whatsapp/templates
   */
  getAllTemplates: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const eventType = req.query.eventType as MessageEventType | undefined;
      const activeOnly = req.query.activeOnly !== 'false';

      const templates = await whatsappService.getAllTemplates(
        eventType,
        activeOnly,
      );

      res.json(templates);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get template by ID
   * GET /api/whatsapp/templates/:id
   */
  getTemplateById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const template = await whatsappService.getTemplateById(id);

      res.json(template);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update template
   * PUT /api/whatsapp/templates/:id
   */
  updateTemplate: async (
    req: Request<{ id: string }, unknown, UpdateTemplateData>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;
      const { name, eventType, content, description, isActive } = req.body;

      const template = await whatsappService.updateTemplate(id, {
        name,
        eventType,
        content,
        description,
        isActive,
      });

      res.json(template);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete template
   * DELETE /api/whatsapp/templates/:id
   */
  deleteTemplate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const result = await whatsappService.deleteTemplate(id);

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Generate message from template
   * POST /api/whatsapp/generate
   */
  generateMessage: async (
    req: Request<unknown, unknown, GenerateMessageData>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { templateId, tripId, variables, triggerType } = req.body;
      const userId = req.user!.id;

      if (!templateId) {
        return res.status(400).json({
          error: 'Template ID is required',
        });
      }

      const result = await whatsappService.generateMessage(
        {
          templateId,
          tripId,
          variables,
          triggerType: triggerType || MessageTriggerType.MANUAL,
        },
        userId,
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Generate trip created message
   * POST /api/whatsapp/trip/:tripId/created
   */
  generateTripCreatedMessage: async (
    req: Request<
      { tripId: string },
      unknown,
      { triggerType?: MessageTriggerType }
    >,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { tripId } = req.params;
      const userId = req.user!.id;
      const triggerType = req.body.triggerType || MessageTriggerType.MANUAL;

      const result = await whatsappService.generateTripCreatedMessage(
        tripId,
        userId,
        triggerType,
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Generate trip published message
   * POST /api/whatsapp/trip/:tripId/published
   */
  generateTripPublishedMessage: async (
    req: Request<
      { tripId: string },
      unknown,
      { triggerType?: MessageTriggerType }
    >,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { tripId } = req.params;
      const userId = req.user!.id;
      const triggerType = req.body.triggerType || MessageTriggerType.MANUAL;

      const result = await whatsappService.generateTripPublishedMessage(
        tripId,
        userId,
        triggerType,
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Generate attendance update message
   * POST /api/whatsapp/trip/:tripId/attendance
   */
  generateAttendanceUpdateMessage: async (
    req: Request<
      { tripId: string },
      unknown,
      { triggerType?: MessageTriggerType }
    >,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { tripId } = req.params;
      const userId = req.user!.id;
      const triggerType = req.body.triggerType || MessageTriggerType.MANUAL;

      const result = await whatsappService.generateAttendanceUpdateMessage(
        tripId,
        userId,
        triggerType,
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Generate gear assignment message
   * POST /api/whatsapp/trip/:tripId/gear
   */
  generateGearAssignmentMessage: async (
    req: Request<
      { tripId: string },
      unknown,
      { triggerType?: MessageTriggerType }
    >,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { tripId } = req.params;
      const userId = req.user!.id;
      const triggerType = req.body.triggerType || MessageTriggerType.MANUAL;

      const result = await whatsappService.generateGearAssignmentMessage(
        tripId,
        userId,
        triggerType,
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Generate trip reminder message
   * POST /api/whatsapp/trip/:tripId/reminder
   */
  generateTripReminderMessage: async (
    req: Request<
      { tripId: string },
      unknown,
      { triggerType?: MessageTriggerType; daysUntilTrip?: string }
    >,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { tripId } = req.params;
      const userId = req.user!.id;
      const daysUntilTrip =
        (req.body.daysUntilTrip && parseInt(req.body.daysUntilTrip)) || 7;
      const triggerType = req.body.triggerType || MessageTriggerType.MANUAL;

      const result = await whatsappService.generateTripReminderMessage(
        tripId,
        userId,
        daysUntilTrip,
        triggerType,
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Generate trip start message
   * POST /api/whatsapp/trip/:tripId/start
   */
  generateTripStartMessage: async (
    req: Request<
      { tripId: string },
      unknown,
      { triggerType?: MessageTriggerType }
    >,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { tripId } = req.params;
      const userId = req.user!.id;
      const triggerType = req.body.triggerType || MessageTriggerType.MANUAL;

      const result = await whatsappService.generateTripStartMessage(
        tripId,
        userId,
        triggerType,
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Generate attendance cutoff reminder message
   * POST /api/whatsapp/trip/:tripId/cutoff-reminder
   */
  generateAttendanceCutoffReminderMessage: async (
    req: Request<
      { tripId: string },
      unknown,
      { triggerType?: MessageTriggerType }
    >,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { tripId } = req.params;
      const userId = req.user!.id;
      const triggerType = req.body.triggerType || MessageTriggerType.MANUAL;

      const result =
        await whatsappService.generateAttendanceCutoffReminderMessage(
          tripId,
          userId,
          triggerType,
        );

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get message history for a trip
   * GET /api/whatsapp/trip/:tripId/messages
   */
  getTripMessageHistory: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { tripId } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      const messages = await whatsappService.getTripMessageHistory(
        tripId,
        userId,
        userRole,
      );

      res.json(messages);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all messages (for super-admin)
   * GET /api/whatsapp/messages
   */
  getAllMessages: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const eventType = req.query.eventType as MessageEventType | undefined;

      const messages = await whatsappService.getAllMessages(eventType);

      res.json(messages);
    } catch (error) {
      next(error);
    }
  },
};
