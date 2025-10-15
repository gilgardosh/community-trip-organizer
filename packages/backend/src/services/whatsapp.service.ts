import { prisma } from '../utils/db.js';
import { MessageEventType, MessageTriggerType, Role } from '@prisma/client';
import { ApiError } from '../utils/ApiError.js';
import { logService } from './log.service.js';
import { ActionType } from '@prisma/client';
import { InputJsonObject } from '@prisma/client/runtime/client';

export interface CreateTemplateData {
  name: string;
  eventType: MessageEventType;
  content: string;
  description?: string;
}

export interface UpdateTemplateData {
  name?: string;
  eventType?: MessageEventType;
  content?: string;
  description?: string;
  isActive?: boolean;
}

export interface GenerateMessageData {
  templateId: string;
  tripId?: string;
  variables?: InputJsonObject;
  triggerType: MessageTriggerType;
}

/**
 * WhatsApp message service for template management and message generation
 */
export const whatsappService = {
  /**
   * Create a new message template
   */
  createTemplate: async (data: CreateTemplateData) => {
    const { name, eventType, content, description } = data;

    // Check if template with this name already exists
    const existing = await prisma.whatsAppMessageTemplate.findUnique({
      where: { name },
    });

    if (existing) {
      throw new ApiError(400, 'Template with this name already exists');
    }

    const template = await prisma.whatsAppMessageTemplate.create({
      data: {
        name,
        eventType,
        content,
        description,
      },
    });

    return template;
  },

  /**
   * Get all templates with optional filtering
   */
  getAllTemplates: async (eventType?: MessageEventType, activeOnly = true) => {
    const where: Record<string, unknown> = {};

    if (eventType) {
      where.eventType = eventType;
    }

    if (activeOnly) {
      where.isActive = true;
    }

    const templates = await prisma.whatsAppMessageTemplate.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return templates;
  },

  /**
   * Get template by ID
   */
  getTemplateById: async (id: string) => {
    const template = await prisma.whatsAppMessageTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new ApiError(404, 'Template not found');
    }

    return template;
  },

  /**
   * Update template
   */
  updateTemplate: async (id: string, data: UpdateTemplateData) => {
    const existing = await prisma.whatsAppMessageTemplate.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new ApiError(404, 'Template not found');
    }

    // Check if name is being changed and if it conflicts
    if (data.name && data.name !== existing.name) {
      const nameConflict = await prisma.whatsAppMessageTemplate.findUnique({
        where: { name: data.name },
      });

      if (nameConflict) {
        throw new ApiError(400, 'Template with this name already exists');
      }
    }

    const updatedTemplate = await prisma.whatsAppMessageTemplate.update({
      where: { id },
      data: {
        name: data.name,
        eventType: data.eventType,
        content: data.content,
        description: data.description,
        isActive: data.isActive,
        updatedAt: new Date(),
      },
    });

    return updatedTemplate;
  },

  /**
   * Delete template
   */
  deleteTemplate: async (id: string) => {
    const existing = await prisma.whatsAppMessageTemplate.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new ApiError(404, 'Template not found');
    }

    await prisma.whatsAppMessageTemplate.delete({
      where: { id },
    });

    return { message: 'Template deleted successfully' };
  },

  /**
   * Generate a message from a template
   */
  generateMessage: async (
    data: GenerateMessageData,
    userId: string,
  ): Promise<{ content: string; messageId: string }> => {
    const template = await prisma.whatsAppMessageTemplate.findUnique({
      where: { id: data.templateId },
    });

    if (!template) {
      throw new ApiError(404, 'Template not found');
    }

    if (!template.isActive) {
      throw new ApiError(400, 'Template is not active');
    }

    // Replace variables in content
    let content = template.content;
    const variables = data.variables || {};

    // Replace all {variable} placeholders
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      const stringValue =
        typeof value === 'object' && value !== null
          ? JSON.stringify(value)
          : String(value ?? '');
      content = content.replace(regex, stringValue);
    });

    // Save generated message
    const message = await prisma.whatsAppMessage.create({
      data: {
        templateId: template.id,
        tripId: data.tripId,
        generatedBy: userId,
        eventType: template.eventType,
        content,
        variables,
        triggerType: data.triggerType,
      },
    });

    // Log message generation
    await logService.log(
      userId,
      ActionType.MESSAGE_GENERATED,
      'WhatsAppMessage',
      message.id,
      {
        templateId: template.id,
        templateName: template.name,
        eventType: template.eventType,
        triggerType: data.triggerType,
        tripId: data.tripId,
      },
    );

    return {
      content: message.content,
      messageId: message.id,
    };
  },

  /**
   * Generate trip creation message
   */
  generateTripCreatedMessage: async (
    tripId: string,
    userId: string,
    triggerType: MessageTriggerType = MessageTriggerType.AUTOMATIC,
  ) => {
    // Get trip details
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        admins: true,
      },
    });

    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }

    // Get active template for trip creation
    const template = await prisma.whatsAppMessageTemplate.findFirst({
      where: {
        eventType: MessageEventType.TRIP_CREATED,
        isActive: true,
      },
    });

    if (!template) {
      throw new ApiError(404, 'No active template found for trip creation');
    }

    // Format dates in Hebrew-friendly format
    const startDate = new Date(trip.startDate).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const endDate = new Date(trip.endDate).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const adminNames = trip.admins.map((admin) => admin.name).join(', ');

    const variables = {
      tripName: trip.name,
      location: trip.location,
      startDate,
      endDate,
      description: trip.description || '',
      admins: adminNames,
    };

    return await whatsappService.generateMessage(
      {
        templateId: template.id,
        tripId,
        variables,
        triggerType,
      },
      userId,
    );
  },

  /**
   * Generate trip published message
   */
  generateTripPublishedMessage: async (
    tripId: string,
    userId: string,
    triggerType: MessageTriggerType = MessageTriggerType.AUTOMATIC,
  ) => {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        admins: true,
      },
    });

    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }

    const template = await prisma.whatsAppMessageTemplate.findFirst({
      where: {
        eventType: MessageEventType.TRIP_PUBLISHED,
        isActive: true,
      },
    });

    if (!template) {
      throw new ApiError(404, 'No active template found for trip published');
    }

    const startDate = new Date(trip.startDate).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const endDate = new Date(trip.endDate).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const cutoffDate = trip.attendanceCutoffDate
      ? new Date(trip.attendanceCutoffDate).toLocaleDateString('he-IL', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'לא הוגדר';

    const adminNames = trip.admins.map((admin) => admin.name).join(', ');

    const variables = {
      tripName: trip.name,
      location: trip.location,
      startDate,
      endDate,
      cutoffDate,
      admins: adminNames,
    };

    return await whatsappService.generateMessage(
      {
        templateId: template.id,
        tripId,
        variables,
        triggerType,
      },
      userId,
    );
  },

  /**
   * Generate attendance update message
   */
  generateAttendanceUpdateMessage: async (
    tripId: string,
    userId: string,
    triggerType: MessageTriggerType = MessageTriggerType.AUTOMATIC,
  ) => {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        attendees: {
          include: {
            family: {
              include: {
                members: {
                  where: { type: 'ADULT' },
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });

    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }

    const template = await prisma.whatsAppMessageTemplate.findFirst({
      where: {
        eventType: MessageEventType.ATTENDANCE_UPDATE,
        isActive: true,
      },
    });

    if (!template) {
      throw new ApiError(404, 'No active template found for attendance update');
    }

    const attendeeCount = trip.attendees.length;
    const attendeeList = trip.attendees
      .map((att) => {
        const familyName =
          att.family.name || att.family.members.map((m) => m.name).join(' ו-');
        return `• ${familyName}`;
      })
      .join('\n');

    const variables = {
      tripName: trip.name,
      attendeeCount: attendeeCount.toString(),
      attendeeList,
    };

    return await whatsappService.generateMessage(
      {
        templateId: template.id,
        tripId,
        variables,
        triggerType,
      },
      userId,
    );
  },

  /**
   * Generate gear assignment message
   */
  generateGearAssignmentMessage: async (
    tripId: string,
    userId: string,
    triggerType: MessageTriggerType = MessageTriggerType.AUTOMATIC,
  ) => {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        gearItems: {
          include: {
            assignments: {
              include: {
                family: {
                  include: {
                    members: {
                      where: { type: 'ADULT' },
                      select: { name: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }

    const template = await prisma.whatsAppMessageTemplate.findFirst({
      where: {
        eventType: MessageEventType.GEAR_ASSIGNMENT,
        isActive: true,
      },
    });

    if (!template) {
      throw new ApiError(404, 'No active template found for gear assignment');
    }

    const gearList = trip.gearItems
      .map((item) => {
        const totalAssigned = item.assignments.reduce(
          (sum, ass) => sum + ass.quantityAssigned,
          0,
        );
        const assignmentDetails = item.assignments
          .map((ass) => {
            const familyName =
              ass.family.name ||
              ass.family.members.map((m) => m.name).join(' ו-');
            return `  - ${familyName}: ${ass.quantityAssigned}`;
          })
          .join('\n');

        return `• ${item.name} (${totalAssigned}/${item.quantityNeeded})\n${assignmentDetails}`;
      })
      .join('\n\n');

    const variables = {
      tripName: trip.name,
      gearList,
    };

    return await whatsappService.generateMessage(
      {
        templateId: template.id,
        tripId,
        variables,
        triggerType,
      },
      userId,
    );
  },

  /**
   * Generate trip reminder message
   */
  generateTripReminderMessage: async (
    tripId: string,
    userId: string,
    daysUntilTrip: number,
    triggerType: MessageTriggerType = MessageTriggerType.MANUAL,
  ) => {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        attendees: {
          include: {
            family: {
              include: {
                members: true,
              },
            },
          },
        },
        gearItems: {
          include: {
            assignments: {
              include: {
                family: {
                  include: {
                    members: {
                      where: { type: 'ADULT' },
                      select: { name: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }

    const template = await prisma.whatsAppMessageTemplate.findFirst({
      where: {
        eventType: MessageEventType.TRIP_REMINDER,
        isActive: true,
      },
    });

    if (!template) {
      throw new ApiError(404, 'No active template found for trip reminder');
    }

    const startDate = new Date(trip.startDate).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });

    const variables = {
      tripName: trip.name,
      location: trip.location,
      startDate,
      daysUntilTrip: daysUntilTrip.toString(),
    };

    return await whatsappService.generateMessage(
      {
        templateId: template.id,
        tripId,
        variables,
        triggerType,
      },
      userId,
    );
  },

  /**
   * Generate trip start notification message
   */
  generateTripStartMessage: async (
    tripId: string,
    userId: string,
    triggerType: MessageTriggerType = MessageTriggerType.MANUAL,
  ) => {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        scheduleItems: {
          where: { day: 1 },
          orderBy: { startTime: 'asc' },
        },
      },
    });

    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }

    const template = await prisma.whatsAppMessageTemplate.findFirst({
      where: {
        eventType: MessageEventType.TRIP_START,
        isActive: true,
      },
    });

    if (!template) {
      throw new ApiError(404, 'No active template found for trip start');
    }

    const firstDaySchedule = trip.scheduleItems
      .map((item) => {
        const timeRange = item.endTime
          ? `${item.startTime} - ${item.endTime}`
          : item.startTime;
        return `• ${timeRange}: ${item.title}${item.location ? ` (${item.location})` : ''}`;
      })
      .join('\n');

    const variables = {
      tripName: trip.name,
      location: trip.location,
      schedule: firstDaySchedule || 'לא נקבע לוח זמנים',
    };

    return await whatsappService.generateMessage(
      {
        templateId: template.id,
        tripId,
        variables,
        triggerType,
      },
      userId,
    );
  },

  /**
   * Generate attendance cutoff reminder message
   */
  generateAttendanceCutoffReminderMessage: async (
    tripId: string,
    userId: string,
    triggerType: MessageTriggerType = MessageTriggerType.MANUAL,
  ) => {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }

    if (!trip.attendanceCutoffDate) {
      throw new ApiError(400, 'Trip does not have an attendance cutoff date');
    }

    const template = await prisma.whatsAppMessageTemplate.findFirst({
      where: {
        eventType: MessageEventType.ATTENDANCE_CUTOFF_REMINDER,
        isActive: true,
      },
    });

    if (!template) {
      throw new ApiError(
        404,
        'No active template found for attendance cutoff reminder',
      );
    }

    const cutoffDate = new Date(trip.attendanceCutoffDate).toLocaleDateString(
      'he-IL',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      },
    );

    const daysUntilCutoff = Math.ceil(
      (new Date(trip.attendanceCutoffDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24),
    );

    const variables = {
      tripName: trip.name,
      cutoffDate,
      daysUntilCutoff: daysUntilCutoff.toString(),
    };

    return await whatsappService.generateMessage(
      {
        templateId: template.id,
        tripId,
        variables,
        triggerType,
      },
      userId,
    );
  },

  /**
   * Get message history for a trip
   */
  getTripMessageHistory: async (
    tripId: string,
    userId: string,
    userRole: Role,
  ) => {
    // Verify trip access
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        admins: true,
      },
    });

    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }

    // Check permissions for draft trips
    if (trip.draft) {
      const isTripAdmin = trip.admins.some((admin) => admin.id === userId);
      if (userRole !== Role.SUPER_ADMIN && !isTripAdmin) {
        throw new ApiError(
          403,
          'Draft trips are only visible to trip admins and super-admins',
        );
      }
    }

    // Trip admins can only see their own trips
    if (userRole === Role.TRIP_ADMIN) {
      const isTripAdmin = trip.admins.some((admin) => admin.id === userId);
      if (!isTripAdmin) {
        throw new ApiError(403, 'You can only view trips you manage');
      }
    }

    const messages = await prisma.whatsAppMessage.findMany({
      where: { tripId },
      include: {
        template: {
          select: {
            name: true,
            eventType: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return messages;
  },

  /**
   * Get all messages (for super-admin)
   */
  getAllMessages: async (eventType?: MessageEventType) => {
    const where: Record<string, unknown> = {};

    if (eventType) {
      where.eventType = eventType;
    }

    const messages = await prisma.whatsAppMessage.findMany({
      where,
      include: {
        template: {
          select: {
            name: true,
            eventType: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return messages;
  },
};
