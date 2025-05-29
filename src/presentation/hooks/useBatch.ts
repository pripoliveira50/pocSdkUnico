import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { batchRepositoryImpl } from '@data/repositories/BatchRepositoryImpl';
import { BatchResponse } from '@domain/entities/BatchEntity';
import { CapturedItem } from '@domain/entities/DocumentEntity';
import { createCheckBatchStatusUseCase } from '@domain/usecases/CheckBatchStatusUseCase';
import { createSubmitBatchUseCase } from '@domain/usecases/SubmitBatchUseCase';

export const useBatch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentOperation, setCurrentOperation] = useState('');
  const [batchResponse, setBatchResponse] = useState<
    BatchResponse | undefined
  >();
  const [batchStatus, setBatchStatus] = useState<any>(null);

  const useCases = useMemo(() => {
    return {
      submitBatch: createSubmitBatchUseCase(batchRepositoryImpl),
      checkBatchStatus: createCheckBatchStatusUseCase(batchRepositoryImpl),
    };
  }, []);

  const submitBatch = useCallback(
    async (
      items: CapturedItem[]
    ): Promise<{ success: boolean; response?: BatchResponse }> => {
      if (items.length === 0) {
        Alert.alert(
          '⚠️ Atenção',
          'Capture pelo menos uma imagem antes de enviar!'
        );
        return { success: false };
      }

      try {
        setIsLoading(true);
        setCurrentOperation('Enviando lote para o backend...');

        const response = await useCases.submitBatch.execute(items);
        setBatchResponse(response);

        if (response.success) {
          Alert.alert('🎉 Sucesso!', response.message, [
            { text: 'OK' },
            {
              text: 'Ver Status',
              onPress: () => {
                if (response.batchId) {
                  checkBatchStatus(response.batchId);
                }
              },
            },
          ]);
          return { success: true, response };
        } else {
          Alert.alert('❌ Erro', response.message);
          return { success: false, response };
        }
      } catch (error: unknown) {
        Alert.alert('Erro', (error as Error).message);
        return { success: false };
      } finally {
        setIsLoading(false);
        setCurrentOperation('');
      }
    },
    [useCases.submitBatch]
  );

  const checkBatchStatus = useCallback(
    async (batchId: string): Promise<void> => {
      try {
        setIsLoading(true);
        setCurrentOperation('Verificando status do lote...');

        const status = await useCases.checkBatchStatus.execute(batchId);
        setBatchStatus(status);

        if (status) {
          Alert.alert(
            '📊 Status',
            `Status geral: ${status.overallStatus.toUpperCase()}`
          );
        }
      } catch (error: unknown) {
        Alert.alert('Erro', (error as Error).message);
      } finally {
        setIsLoading(false);
        setCurrentOperation('');
      }
    },
    [useCases.checkBatchStatus]
  );

  return {
    isLoading,
    currentOperation,
    batchResponse,
    batchStatus,
    submitBatch,
    checkBatchStatus,
  };
};
