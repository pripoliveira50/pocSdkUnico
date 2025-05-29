export enum DocumentType {
  CNH_FRENTE = 'CNH_FRENTE',
  CNH_VERSO = 'CNH_VERSO',
  CPF = 'CPF',
  RG = 'RG',
}

export enum ActionType {
  SELFIE = 'selfie',
  DOCUMENT = 'document',
}

export enum DocumentStatus {
  CAPTURED = 'captured',
  SENDING = 'sending',
  SENT = 'sent',
  ERROR = 'error',
}

export type UnicoResult = {
  base64: string;
  encrypted: string;
  confidence?: number;
  liveness?: boolean;
};

export type CapturedItem = {
  id: string;
  type: ActionType;
  documentType?: DocumentType;
  result: UnicoResult;
  timestamp: string;
  status: DocumentStatus;
};
