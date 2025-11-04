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

export type FilesPayload = {
  referenceFiles: Express.Multer.File[];
  requiredFiles: Express.Multer.File[];
};

@Injectable()
export class TaskFilesPayloadPipe {
  constructor(
    private readonly opts?: {
      maxFileSize?: number;
      allowedMimeTypes?: string[];
      requiredReference?: boolean;
      requiredFiles?: boolean;
      allowEmptyArrays?: boolean;
    },
  ) {}

  transform(payload: FilesPayload) {
    const ref = payload?.referenceFiles ?? [];
    const req = payload?.requiredFiles ?? [];

    const missing: string[] = [];

    if (this.opts?.requiredReference !== false && ref.length === 0) {
      missing.push('[referenceFiles]');
    }

    if (this.opts?.requiredFiles !== false && req.length === 0) {
      missing.push('[requiredFiles]');
    }

    if (!missing.length) {
      throw new BadRequestException(
        `Se esperaban archivos en los siguientes campos: ${missing.join(', ')}`,
      );
    }

    if (!this.opts?.allowEmptyArrays) {
      if ('referenceFiles' in (payload ?? {}) && !ref.length) {
        throw new BadRequestException(
          'El campo [referenceFiles] no puede estar vacío',
        );
      }

      if ('requiredFiles' in (payload ?? {}) && req.length === 0) {
        throw new BadRequestException(
          `El campo [requiredFiles] no puede estar vacío.`,
        );
      }
    }

    const maxFileSize = this.opts?.maxFileSize
      ? this.opts?.maxFileSize * 1024 * 1024
      : MAX_FILE_SIZE;

    const allowedMimeTypes = this.opts?.allowedMimeTypes
      ? this.opts?.allowedMimeTypes
      : ALLOWED_MIME_TYPES;

    const files = [...ref, ...req];

    for (const file of files) {
      if (typeof file.size === 'number' && file.size > maxFileSize) {
        throw new BadRequestException(
          `El archivo ${file.originalname} excede el tamaño máximo permitido de ${
            maxFileSize / (1024 * 1024)
          }MB.`,
        );
      }

      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `El archivo ${file.originalname} tiene un tipo MIME no permitido: ${file.mimetype}.`,
        );
      }
    }
  }
}
