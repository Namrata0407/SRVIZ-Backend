import prisma from '../../utils/prisma';
import { calculatePricing } from '../../utils/pricing';
import { AppError } from '../../middleware/error.middleware';
import { LeadStatus } from '@prisma/client';

export interface GenerateQuoteInput {
  leadId: string;
  packageId: string;
  travellersCount: number;
}

export class QuoteService {
  async generateQuote(input: GenerateQuoteInput) {
    const [lead, pkg] = await Promise.all([
      prisma.lead.findUnique({
        where: { id: input.leadId },
        include: { event: true },
      }),
      prisma.package.findUnique({
        where: { id: input.packageId },
        include: { event: true },
      }),
    ]);

    if (!lead) {
      throw new AppError(404, 'Lead not found');
    }

    if (!pkg) {
      throw new AppError(404, 'Package not found');
    }

    if (pkg.eventId !== lead.eventId) {
      throw new AppError(
        400,
        'Package does not belong to the same event as the lead'
      );
    }

    const travellersCount = input.travellersCount || lead.travellersCount;

    const pricing = calculatePricing({
      basePrice: Number(pkg.basePrice),
      eventStartDate: lead.event.startDate,
      travellersCount,
    });

    const result = await prisma.$transaction(async (tx) => {
      const quote = await tx.quote.create({
        data: {
          leadId: input.leadId,
          packageId: input.packageId,
          basePrice: pricing.basePrice,
          seasonalAdjustment: pricing.seasonalAdjustment,
          earlyBirdAdjustment: pricing.earlyBirdAdjustment,
          lastMinuteAdjustment: pricing.lastMinuteAdjustment,
          groupDiscount: pricing.groupDiscount,
          weekendSurcharge: pricing.weekendSurcharge,
          finalPrice: pricing.finalPrice,
        },
        include: {
          package: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      if (lead.status !== 'QuoteSent') {
        const currentStatus = lead.status;

        if (currentStatus === 'New' || currentStatus === 'Contacted') {
          await tx.lead.update({
            where: { id: input.leadId },
            data: { status: 'QuoteSent' },
          });

          await tx.leadStatusHistory.create({
            data: {
              leadId: input.leadId,
              oldStatus: currentStatus,
              newStatus: 'QuoteSent',
            },
          });
        }
      }

      return quote;
    });

    return {
      quoteId: result.id,
      basePrice: pricing.basePrice,
      adjustments: {
        seasonal: pricing.seasonalAdjustment,
        earlyBird: pricing.earlyBirdAdjustment,
        lastMinute: pricing.lastMinuteAdjustment,
        groupDiscount: pricing.groupDiscount,
        weekendSurcharge: pricing.weekendSurcharge,
      },
      finalPrice: pricing.finalPrice,
      package: result.package,
      leadStatus: 'QuoteSent',
    };
  }
}

export default new QuoteService();

