import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/config/env.validation';
import { sanitizeFileName } from './helpers/files';
import {
  S3PrivateUploadSuccessful,
  S3UploadRejected,
  S3UploadSuccessful,
} from './interfaces/s3.interfaces';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class AwsS3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly bucketRegion: string;
  private readonly cdnUrl: string;

  private readonly logger = new Logger(AwsS3Service.name);

  private readonly publicPrefix = 'public';
  private readonly privatePrefix = 'private';

  constructor(private readonly configService: ConfigService<Env, true>) {
    this.bucketName = this.configService.get('AWS_BUCKET');
    this.bucketRegion = this.configService.get('AWS_REGION');
    this.cdnUrl = this.configService.get('AWS_CF_CDN');

    this.s3Client = new S3Client({
      region: this.bucketRegion,
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY'),
        secretAccessKey: this.configService.get('AWS_SECRET_KEY'),
      },
    });
  }

  private async uploadFile(
    file: Express.Multer.File,
    key: string,
    isPrivate = true,
  ) {
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          CacheControl: isPrivate ? 'no-cache' : 'max-age=31536000, public',
          ContentDisposition: 'inline',
        }),
      );
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Error uploading file to S3');
    }
  }

  async uploadPublicFile(file: Express.Multer.File, folder: string) {
    const sanitizedFileName = sanitizeFileName(file.originalname);

    const fileKey = `${this.publicPrefix}/${folder}/${sanitizedFileName}`;

    await this.uploadFile(file, fileKey, false);

    const fileUrl = `${this.cdnUrl}/${fileKey}`;

    return {
      key: fileKey,
      url: fileUrl,
      fileName: sanitizedFileName,
    };
  }

  async uploadPrivateFile(file: Express.Multer.File, folder: string) {
    const sanitizedFileName = sanitizeFileName(file.originalname);

    const fileKey = `${this.privatePrefix}/${folder}/${sanitizedFileName}`;

    await this.uploadFile(file, fileKey, true);

    return {
      key: fileKey,
      fileName: sanitizedFileName,
    };
  }

  async uploadPublicFiles(files: Express.Multer.File[], folder: string) {
    let message: string = 'Archivos subidos correctamente';
    const rejectedFiles: S3UploadRejected[] = [];
    const successfulFiles: S3UploadSuccessful[] = [];

    const uploads = files.map(
      async file => await this.uploadPublicFile(file, folder),
    );

    const settled = await Promise.allSettled(uploads);

    settled.forEach((result, i) => {
      if (result.status === 'rejected') {
        const reason = result.reason as Error | { message?: string };

        message = 'Ha ocurrido un error al subir algunos archivos';

        rejectedFiles.push({
          filename: files[i].originalname || 'Archivo desconocido',
          reason:
            reason instanceof Error
              ? reason.message
              : reason.message || 'Error desconocido',
        });
      } else {
        successfulFiles.push(result.value);
      }
    });

    return {
      message,
      rejectedFiles,
      successfulFiles,
    };
  }

  async uploadPrivateFiles(files: Express.Multer.File[], folder: string) {
    let message: string = 'Archivos subidos correctamente';
    const rejectedFiles: S3UploadRejected[] = [];
    const successfulFiles: S3PrivateUploadSuccessful[] = [];

    const uploads = files.map(
      async file => await this.uploadPrivateFile(file, folder),
    );

    const settled = await Promise.allSettled(uploads);

    settled.forEach((result, i) => {
      if (result.status === 'rejected') {
        const reason = result.reason as Error | { message?: string };

        message = 'Ha ocurrido un error al subir algunos archivos';

        rejectedFiles.push({
          filename: files[i].originalname || 'Archivo desconocido',
          reason:
            reason instanceof Error
              ? reason.message
              : reason.message || 'Error desconocido',
        });
      } else {
        successfulFiles.push(result.value);
      }
    });

    return {
      message,
      rejectedFiles,
      successfulFiles,
    };
  }

  async deleteFile(key: string) {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Error deleting file from S3');
    }
  }

  async getSignedUrl(key: string, expires: number = 60) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: expires,
      });
      return signedUrl;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Error getting signed URL from S3',
      );
    }
  }
}
