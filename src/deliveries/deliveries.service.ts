import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DeliveriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create({ name, taskId }: { name: string; taskId: string }) {
    const delivery = await this.prisma.delivery.create({
      data: { name, taskId },
    });

    return delivery;
  }

  async findAll() {
    return this.prisma.delivery.findMany({
      include: {
        versions: true,
      },
    });
  }

  async findDeliveriesByTask(taskId: string) {
    const reliveries = await this.prisma.delivery.findMany({
      include: {
        versions: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      where: { taskId },
    });

    if (!reliveries) {
      throw new NotFoundException('La tarea no cuenta con entregas');
    }

    return reliveries;
  }

  async findOne(id: string) {
    const delivery = await this.prisma.delivery.findUnique({
      include: {
        versions: true,
      },
      where: { id },
    });

    if (!delivery) {
      throw new NotFoundException('La entrega no existe');
    }

    return delivery;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.delivery.delete({ where: { id } });
  }
}
