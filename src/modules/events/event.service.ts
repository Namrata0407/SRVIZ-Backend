import prisma from '../../utils/prisma';

export class EventService {
  async getAllEvents() {
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
  }

  async getEventById(eventId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        packages: {
          orderBy: { basePrice: 'asc' },
        },
      },
    });

    return event;
  }

  async getEventPackages(eventId: string) {
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
  }
}

export default new EventService();

