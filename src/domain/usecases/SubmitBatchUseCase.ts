import { BatchResponse } from '@domain/entities/BatchEntity';
import { ActionType, CapturedItem } from '@domain/entities/DocumentEntity';
import { BatchRepository } from '@domain/repositories/BatchRepository';

export const executeSubmitBatch = async (
  batchRepository: BatchRepository,
  items: CapturedItem[]
): Promise<BatchResponse> => {
  if (items.length === 0) {
    throw new Error('Nenhum item para enviar');
  }

  const hasSelfie = items.some(item => item.type === ActionType.SELFIE);
  if (!hasSelfie) {
    throw new Error('É necessário pelo menos uma selfie');
  }

  return await batchRepository.submitBatch(items);
};

export const createSubmitBatchUseCase = (batchRepository: BatchRepository) => ({
  execute: (items: CapturedItem[]) =>
    executeSubmitBatch(batchRepository, items),
});
