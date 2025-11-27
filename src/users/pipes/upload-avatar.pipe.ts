import { BadRequestException, Injectable } from '@nestjs/common';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // ? 5MB

const ALLOWED_MIME_TYPES = [
  // ? tipos de archivos permitidos;
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

@Injectable()
export class UploadAvatarPipe {
  private readonly maxFileSize: number;
  constructor() {}

  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    const maxFileSize = this.maxFileSize
      ? this.maxFileSize * 1024 * 1024
      : MAX_FILE_SIZE;

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        // `El archivo ${file.originalname} tiene un tipo MIME no permitido: ${file.mimetype}.`,
        'La extensión del archivo no es permitida',
      );
    }

    if (typeof file.size === 'number' && file.size > maxFileSize) {
      throw new BadRequestException(
        `El archivo ${file.originalname} excede el tamaño máximo permitido de ${
          maxFileSize / (1024 * 1024)
        }MB.`,
      );
    }

    return file;
  }
}
