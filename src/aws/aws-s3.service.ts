import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/config/env.validation';
import path from 'path';

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
    const fileKey = `${folder}/${file.originalname}-${Date.now()}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: fileKey,
        })
      )
    } catch (error) {
      
    }
  }
}
