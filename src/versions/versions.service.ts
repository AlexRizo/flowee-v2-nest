import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AwsS3Service } from 'src/aws/aws-s3.service';
import { DeliveriesService } from 'src/deliveries/deliveries.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CheckVersionDto } from './dto/check-version.dto';
import { VersionStatus } from '@prisma/client';

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

    const anyVersionPendingOrAccepted = await this.prisma.version.findFirst({
      where: {
        deliveryId,
        status: {
          in: [VersionStatus.PENDING, VersionStatus.ACCEPTED],
        },
      },
    });

    if (anyVersionPendingOrAccepted) {
      throw new BadRequestException(
        'Ya existe una version pendiente o aprobada.',
      );
    }

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
    const version = await this.prisma.version.findUnique({
      where: { id },
    });

    if (!version) {
      throw new NotFoundException('Version not found');
    }
    return version;
  }

  async check(versionId: string, versionDataDto: CheckVersionDto) {
    const { deliveryId } = await this.findOne(versionId);

    const { versions: deliveryVersions } =
      await this.deliveriesService.findOne(deliveryId);

    const anyVersionApproved = deliveryVersions.find(
      version => version.status === VersionStatus.ACCEPTED,
    );

    if (anyVersionApproved && anyVersionApproved.id !== versionId) {
      throw new BadRequestException('Ya existe una version aprobada');
    }

    const pendingVersion = deliveryVersions.filter(
      version => version.status === VersionStatus.PENDING,
    );

    if (pendingVersion.length > 1) {
      throw new BadRequestException(
        'No puede haber mas de una version pendiente',
      );
    }

    return await this.prisma.version.update({
      where: { id: versionId },
      data: versionDataDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return await this.prisma.version.delete({ where: { id } });
  }

  async getFile(id: string, download: boolean) {
    const version = await this.findOne(id);

    return this.s3Service.getSignedUrl(version.attachment, 60, download);
  }
}
