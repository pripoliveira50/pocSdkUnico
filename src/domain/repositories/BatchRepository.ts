import { CapturedItem } from '@domain/entities/DocumentEntity';
import { BatchResponse } from '@entities/BatchEntity';

export type BatchRepository = {
  submitBatch(items: CapturedItem[]): Promise<BatchResponse>;
  checkBatchStatus(batchId: string): Promise<unknown>;
};
