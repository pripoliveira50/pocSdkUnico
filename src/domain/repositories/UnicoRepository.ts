import { DocumentType, UnicoResult } from '@domain/entities/DocumentEntity';

export type CaptureResult = {
  success: boolean;
  data?: UnicoResult;
  error?: string;
};

export type UnicoPermissions = {
  camera: boolean;
};

export type UnicoRepository = {
  testConnection(): Promise<string>;
  checkPermissions(): Promise<UnicoPermissions>;
  captureSelfie(): Promise<CaptureResult>;
  captureDocument(documentType: DocumentType): Promise<CaptureResult>;
  ensureCameraPermission(): Promise<boolean>;
};
