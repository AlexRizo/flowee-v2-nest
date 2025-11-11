export interface S3UploadRejected {
  filename: string;
  reason: string;
}

export interface S3UploadSuccessful {
  key: string;
  url: string;
  fileName: string;
}

export interface S3PrivateUploadSuccessful {
  key: string;
  fileName: string;
}
