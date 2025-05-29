import {
  ActionType,
  CapturedItem,
  DocumentStatus,
} from '@domain/entities/DocumentEntity';
import { UnicoRepository } from '@domain/repositories/UnicoRepository';

export const executeCaptureSelfie = async (
  unicoRepository: UnicoRepository
): Promise<CapturedItem> => {
  const result = await unicoRepository.captureSelfie();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Erro na captura da selfie');
  }

  return {
    id: `selfie_${Date.now()}`,
    type: ActionType.SELFIE,
    result: result.data,
    timestamp: new Date().toISOString(),
    status: DocumentStatus.CAPTURED,
  };
};

export const createCaptureSelfieUseCase = (
  unicoRepository: UnicoRepository
) => ({
  execute: () => executeCaptureSelfie(unicoRepository),
});
