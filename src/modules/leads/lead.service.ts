import prisma from '../../utils/prisma';
import { LeadStatus } from '@prisma/client';
import { isValidTransition } from '../../utils/leadWorkflow';
import { AppError } from '../../middleware/error.middleware';

export interface CreateLeadInput {
  name: string;
  email: string;
  phone?: string;
  eventId: string;
  travellersCount: number;
}

export interface UpdateLeadStatusInput {
  status: LeadStatus;
}

export interface LeadFilters {
  status?: LeadStatus;
  eventId?: string;
  month?: number;
  page?: number;
  limit?: number;
}

export class LeadService {
  async createLead(input: CreateLeadInput) {
    const event = await prisma.event.findUnique({
      where: { id: input.eventId },
    });

    if (!event) {
      throw new AppError(404, 'Event not found');
    }

    const lead = await prisma.lead.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        eventId: input.eventId,
        travellersCount: input.travellersCount,
        status: 'New',
        statusHistory: {
          create: {
            oldStatus: null,
            newStatus: 'New',
          },
        },
      },
      include: {
        event: true,
        statusHistory: {
          orderBy: { changedAt: 'desc' },
          take: 1,
        },
      },
    });

    return lead;
  }

  async getLeads(filters: LeadFilters = {}) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.eventId) {
      where.eventId = filters.eventId;
    }

    if (filters.month) {
      where.event = {
        startDate: {
          gte: new Date(2024, filters.month - 1, 1),
          lt: new Date(2024, filters.month, 1),
        },
      };
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          event: {
            select: {
              id: true,
              name: true,
              startDate: true,
              endDate: true,
            },
          },
          statusHistory: {
            orderBy: { changedAt: 'desc' },
            take: 5,
          },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    return {
      data: leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateLeadStatus(leadId: string, newStatus: LeadStatus) {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { statusHistory: { orderBy: { changedAt: 'desc' }, take: 1 } },
    });

    if (!lead) {
      throw new AppError(404, 'Lead not found');
    }

    const currentStatus = lead.status;

    if (!isValidTransition(currentStatus, newStatus)) {
      const validNext = this.getValidNextStatuses(currentStatus);
      throw new AppError(
        400,
        `Invalid status transition from ${currentStatus} to ${newStatus}. Valid next statuses: ${validNext.join(', ')}`
      );
    }

    const updatedLead = await prisma.$transaction(async (tx) => {
      const updated = await tx.lead.update({
        where: { id: leadId },
        data: { status: newStatus },
        include: {
          event: true,
          statusHistory: {
            orderBy: { changedAt: 'desc' },
            take: 5,
          },
        },
      });

      await tx.leadStatusHistory.create({
        data: {
          leadId,
          oldStatus: currentStatus,
          newStatus,
        },
      });

      return updated;
    });

    return updatedLead;
  }

  private getValidNextStatuses(currentStatus: LeadStatus): string[] {
    const validMap: Record<LeadStatus, string[]> = {
      New: ['Contacted'],
      Contacted: ['QuoteSent', 'ClosedLost'],
      QuoteSent: ['Interested', 'ClosedLost'],
      Interested: ['ClosedWon', 'ClosedLost'],
      ClosedWon: [],
      ClosedLost: [],
    };
    return validMap[currentStatus] || [];
  }
}

export default new LeadService();

