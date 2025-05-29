import { BatchResponse } from '@domain/entities/BatchEntity';
import { ActionType, CapturedItem } from '@domain/entities/DocumentEntity';
import { BatchRepository } from '@domain/repositories/BatchRepository';

const BACKEND_URL = 'https://seu-backend.com/api';
const USER_DATA = {
  cpf: '12345678900',
  name: 'João Silva',
  email: 'joao@email.com',
  phone: '11999999999',
};

const submitBatchImpl = async (
  capturedItems: CapturedItem[]
): Promise<BatchResponse> => {
  try {
    const selfieItem = capturedItems.find(
      item => item.type === ActionType.SELFIE
    );
    const documentItems = capturedItems.filter(
      item => item.type === ActionType.DOCUMENT
    );

    await new Promise(resolve => setTimeout(() => resolve(undefined), 3000));

    const mockResponse: BatchResponse = {
      success: true,
      batchId: `batch_${Date.now()}`,
      message: `Lote enviado com sucesso! ${capturedItems.length} itens processados.`,
      processedItems: {
        selfie: selfieItem
          ? {
              processId: `selfie_${Date.now()}`,
              status: 'processing',
            }
          : undefined,
        documents: documentItems.map((item, index) => ({
          type: item.documentType!,
          processId: `doc_${item.documentType}_${Date.now()}_${index}`,
          status: 'processing',
        })),
      },
    };

    return mockResponse;
  } catch (error: any) {
    console.error('❌ Erro no envio em lote:', error);
    return {
      success: false,
      message: 'Erro ao enviar lote para verificação',
      error: error.message,
    };
  }
};

const checkBatchStatusImpl = async (batchId: string): Promise<any> => {
  try {
    await new Promise(resolve => setTimeout(() => resolve(undefined), 1500));

    return {
      batchId,
      overallStatus: 'completed',
      results: {
        selfie: {
          status: 'approved',
          score: 0.96,
          confidence: 'HIGH',
        },
        documents: [
          {
            type: 'CNH_FRENTE',
            status: 'approved',
            extractedData: {
              name: 'JOÃO SILVA',
              number: '123456789',
              validity: '2030-12-31',
            },
          },
          {
            type: 'CNH_VERSO',
            status: 'approved',
            extractedData: {
              category: 'AB',
              issueDate: '2020-06-15',
              observations: 'NENHUMA',
            },
          },
        ],
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ Erro ao verificar status do lote:', error);
    return null;
  }
};

export const batchRepositoryImpl: BatchRepository = {
  submitBatch: submitBatchImpl,
  checkBatchStatus: checkBatchStatusImpl,
};

export {
  checkBatchStatusImpl as checkBatchStatus,
  submitBatchImpl as submitBatch,
};

export { BACKEND_URL, USER_DATA };
