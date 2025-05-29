import { DocumentType } from './DocumentEntity';

export type BatchResponse = {
  success: boolean;
  batchId?: string;
  message: string;
  processedItems?: {
    selfie?: { processId: string; status: string };
    documents?: Array<{ type: string; processId: string; status: string }>;
  };
  error?: string;
};

export type BatchSubmission = {
  user: {
    cpf: string;
    name: string;
    email: string;
    phone: string;
  };
  captures: {
    selfie?: {
      encrypted: string;
      base64: string;
      timestamp: string;
    };
    documents: Array<{
      type: DocumentType;
      encrypted: string;
      base64: string;
      timestamp: string;
    }>;
  };
  metadata: {
    submissionTimestamp: string;
    deviceInfo: string;
    platform: string;
    totalItems: number;
  };
};
