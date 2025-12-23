import { BadRequestException, Injectable } from '@nestjs/common';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // ? 5MB

const ALLOWED_MIME_TYPES = [
  // ? tipos de archivos permitidos;
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.oasis.opendocument.text',
  'text/plain',
  'text/rtf',
];

@Injectable()
export class ParseVersionFilePipe {
  constructor(
    private readonly opts?: {
      maxFileSize?: number;
      allowedMimeTypes?: string[];
    },
  ) {}

  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Se esperaba un archivo');
    }

    const maxFileSize = this.opts?.maxFileSize
      ? this.opts?.maxFileSize * 1024 * 1024
      : MAX_FILE_SIZE;

    const allowedMimeTypes = this.opts?.allowedMimeTypes
      ? this.opts?.allowedMimeTypes
      : ALLOWED_MIME_TYPES;

    if (typeof file.size === 'number' && file.size > maxFileSize) {
      throw new BadRequestException(
        `El archivo excede el tamaño máximo permitido de ${maxFileSize / (1024 * 1024)}MB.`,
      );
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `El archivo tiene un tipo MIME no permitido: ${file.mimetype}.`,
      );
    }

    return file;
  }
}
