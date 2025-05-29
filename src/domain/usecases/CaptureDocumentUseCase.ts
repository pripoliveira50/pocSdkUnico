import {
  ActionType,
  CapturedItem,
  DocumentStatus,
  DocumentType,
} from '@domain/entities/DocumentEntity';
import { UnicoRepository } from '@domain/repositories/UnicoRepository';

export const executeCaptureDocument = async (
  unicoRepository: UnicoRepository,
  documentType: DocumentType
): Promise<CapturedItem> => {
  if (!Object.values(DocumentType).includes(documentType)) {
    throw new Error('Tipo de documento inválido');
  }

  const result = await unicoRepository.captureDocument(documentType);

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Erro na captura do documento');
  }

  return {
    id: `${documentType}_${Date.now()}`,
    type: ActionType.DOCUMENT,
    documentType,
    result: result.data,
    timestamp: new Date().toISOString(),
    status: DocumentStatus.CAPTURED,
  };
};

export const createCaptureDocumentUseCase = (
  unicoRepository: UnicoRepository
) => ({
  execute: (documentType: DocumentType) =>
    executeCaptureDocument(unicoRepository, documentType),
});
