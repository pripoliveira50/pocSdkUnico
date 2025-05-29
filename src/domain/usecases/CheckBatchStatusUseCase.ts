import { BatchRepository } from '@domain/repositories/BatchRepository';

export const executeCheckBatchStatus = async (
  batchRepository: BatchRepository,
  batchId: string
): Promise<any> => {
  if (!batchId) {
    throw new Error('ID do lote é obrigatório');
  }

  return await batchRepository.checkBatchStatus(batchId);
};

export const createCheckBatchStatusUseCase = (
  batchRepository: BatchRepository
) => ({
  execute: (batchId: string) =>
    executeCheckBatchStatus(batchRepository, batchId),
});
