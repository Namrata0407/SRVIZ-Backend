import prisma from '../../utils/prisma';

async function retryQuery<T>(queryFn: () => Promise<T>, maxRetries = 5): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await queryFn();
    } catch (error: any) {
      lastError = error;
      const errorMsg = error.message || '';
      const errorCode = error.meta?.code || error.code || '';
      
      if ((errorMsg.includes('prepared statement') || errorCode === '42P05') && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 200 * (i + 1)));
        continue;
      }
      
      if (i === maxRetries - 1) {
        throw error;
      }
    }
  }
  throw lastError || new Error('Query failed after retries');
}

export class EventService {
  async getAllEvents() {
    return retryQuery(async () => {
      const events = await prisma.event.findMany({
        orderBy: { startDate: 'asc' },
        include: {
          _count: {
            select: {
              packages: true,
            },
          },
        },
      });
      return events;
    });
  }

  async getEventById(eventId: string) {
    return retryQuery(async () => {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          packages: {
            orderBy: { basePrice: 'asc' },
          },
        },
      });
      return event;
    });
  }

  async getEventPackages(eventId: string) {
    return retryQuery(async () => {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        return null;
      }

      const packages = await prisma.package.findMany({
        where: { eventId },
        orderBy: { basePrice: 'asc' },
      });

      return packages;
    });
  }
}

export default new EventService();

