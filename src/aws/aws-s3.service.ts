import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/config/env.validation';
import { sanitizeFileName } from './helpers/files';
import {
  S3UploadRejected,
  S3UploadSuccessful,
} from './interfaces/s3.interfaces';

@Injectable()
export class AwsS3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly bucketRegion: string;
  private readonly secure_url: string;

  constructor(private readonly configService: ConfigService<Env, true>) {
    this.bucketName = this.configService.get('AWS_BUCKET');
    this.bucketRegion = this.configService.get('AWS_REGION');
    this.secure_url = this.configService.get('AWS_DIST_DOMAIN');

    this.s3Client = new S3Client({
      region: this.bucketRegion,
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY'),
        secretAccessKey: this.configService.get('AWS_SECRET_KEY'),
      },
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string) {
    const sanitizedFileName = sanitizeFileName(file.originalname);
    const fileKey = `${folder}/${sanitizedFileName}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: fileKey,
          Body: file.buffer,
          ContentType: file.mimetype,
          CacheControl: 'max-age=31536000, public',
          ContentDisposition: 'inline',
        }),
      );

      const fileUrl = `https://${this.bucketName}.s3.${this.bucketRegion}.amazonaws.com/${fileKey}`;

      return {
        key: fileKey,
        url: fileUrl,
        fileName: sanitizedFileName,
        message: 'Archivo subido correctamente',
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error uploading file to S3');
    }
  }

  async uploadFiles(files: Express.Multer.File[], folder: string) {
    let message: string = 'Archivos subidos correctamente';
    const rejectedFiles: S3UploadRejected[] = [];
    const successfulFiles: S3UploadSuccessful[] = [];

    const uploads = files.map(
      async file => await this.uploadFile(file, folder),
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
}
