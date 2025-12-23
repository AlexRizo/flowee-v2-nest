import { Injectable, NotFoundException } from '@nestjs/common';
import { AwsS3Service } from 'src/aws/aws-s3.service';
import { DeliveriesService } from 'src/deliveries/deliveries.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VersionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: AwsS3Service,
    private readonly deliveriesService: DeliveriesService,
  ) {}

  async create({
    description,
    deliveryId,
    attachment,
  }: {
    description: string;
    deliveryId: string;
    attachment: Express.Multer.File;
  }) {
    const { taskId } = await this.deliveriesService.findOne(deliveryId);

    const { key, fileName } = await this.s3Service.uploadPrivateFile(
      attachment,
      `tasks/${taskId}/versions`,
    );

    const version = await this.prisma.version.create({
      data: {
        description,
        deliveryId,
        attachment: key,
        attachmentName: fileName,
      },
    });

    return version;
  }

  async findAll() {
    return await this.prisma.version.findMany();
  }

  async findOne(id: string) {
    const version = await this.prisma.version.findUnique({ where: { id } });

    if (!version) {
      throw new NotFoundException('Version not found');
    }
    return version;
  }

  async remove(id: string) {
    await this.findOne(id);

    return await this.prisma.version.delete({ where: { id } });
  }
}
