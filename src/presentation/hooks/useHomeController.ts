import { useCallback } from 'react';
import { Alert } from 'react-native';

import { DocumentStatus, DocumentType } from '@domain/entities/DocumentEntity';

import { useBatch } from './useBatch';
import { useCapture } from './useCapture';
import { useCapturedItems } from './useCapturedItems';
import { useDiagnostics } from './useDiagnostics';
import { useGuidedFlow } from './useGuidedFlow';

export const useHomeController = () => {
  const capturedItemsHook = useCapturedItems();
  const captureHook = useCapture();
  const batchHook = useBatch();
  const guidedFlowHook = useGuidedFlow();
  const diagnosticsHook = useDiagnostics();

  const isLoading =
    captureHook.isLoading || batchHook.isLoading || diagnosticsHook.isLoading;
  const currentOperation =
    captureHook.currentOperation ||
    batchHook.currentOperation ||
    diagnosticsHook.currentOperation;

  const captureSelfie = useCallback(async (): Promise<void> => {
    const newItem = await captureHook.captureSelfie();
    if (newItem) {
      capturedItemsHook.addItem(newItem);

      guidedFlowHook.checkAndAdvanceGuidedFlow(
        [...capturedItemsHook.capturedItems, newItem],
        guidedFlowHook.GuidedFlowStepId.SELFIE
      );
    }
  }, [captureHook, capturedItemsHook, guidedFlowHook]);

  const captureDocument = useCallback(
    async (docType: DocumentType): Promise<void> => {
      const newItem = await captureHook.captureDocument(docType);
      if (newItem) {
        capturedItemsHook.addItem(newItem);

        const stepId =
          docType === DocumentType.CNH_FRENTE
            ? guidedFlowHook.GuidedFlowStepId.CNH_FRENTE
            : guidedFlowHook.GuidedFlowStepId.CNH_VERSO;

        guidedFlowHook.checkAndAdvanceGuidedFlow(
          [...capturedItemsHook.capturedItems, newItem],
          stepId,
          docType
        );
      }
    },
    [captureHook, capturedItemsHook, guidedFlowHook]
  );

  const submitBatch = useCallback(async (): Promise<void> => {
    capturedItemsHook.updateItemsStatus(DocumentStatus.SENDING);

    const result = await batchHook.submitBatch(capturedItemsHook.capturedItems);

    if (result.success) {
      capturedItemsHook.updateItemsStatus(DocumentStatus.SENT);

      if (guidedFlowHook.isGuidedFlowActive && guidedFlowHook.guidedFlow) {
        const currentStep = guidedFlowHook.guidedFlow.getCurrentStep();
        if (currentStep?.id === guidedFlowHook.GuidedFlowStepId.SUBMIT) {
          setTimeout(() => {
            Alert.alert(
              '🎉 Fluxo Concluído!',
              'Parabéns! Você completou todo o processo de verificação.',
              [
                {
                  text: 'Finalizar',
                  onPress: () => guidedFlowHook.cancelGuidedFlow(),
                },
              ]
            );
          }, 1000);
        }
      }
    }
    return capturedItemsHook.updateItemsStatus(DocumentStatus.ERROR);
  }, [capturedItemsHook, batchHook, guidedFlowHook]);

  const startGuidedFlow = useCallback((): void => {
    capturedItemsHook.clearItems();
    guidedFlowHook.startGuidedFlow();
  }, [capturedItemsHook, guidedFlowHook]);

  const clearAll = useCallback((): void => {
    capturedItemsHook.clearItems();
    guidedFlowHook.cancelGuidedFlow();
  }, [capturedItemsHook, guidedFlowHook]);

  const executeCurrentGuidedStep = useCallback(async (): Promise<void> => {
    const step = guidedFlowHook.guidedFlow?.getCurrentStep();
    if (!step) {
      Alert.alert('❌ Erro', 'Passo não encontrado');
      return;
    }

    const stepActionsMap: Record<string, () => Promise<void>> = {
      [guidedFlowHook.GuidedFlowStepId.SELFIE]: async () => {
        await captureSelfie();
      },
      [guidedFlowHook.GuidedFlowStepId.CNH_FRENTE]: async () => {
        await captureDocument(DocumentType.CNH_FRENTE);
      },
      [guidedFlowHook.GuidedFlowStepId.CNH_VERSO]: async () => {
        await captureDocument(DocumentType.CNH_VERSO);
      },
      [guidedFlowHook.GuidedFlowStepId.SUBMIT]: async () => {
        const hasSelfie = capturedItemsHook.hasSelfie;
        const hasCnhFrente = capturedItemsHook.hasDocument(
          DocumentType.CNH_FRENTE
        );
        const hasCnhVerso = capturedItemsHook.hasDocument(
          DocumentType.CNH_VERSO
        );

        if (!hasSelfie || !hasCnhFrente || !hasCnhVerso) {
          Alert.alert(
            '⚠️ Itens Faltando',
            'Complete todos os passos anteriores antes de enviar:\n' +
              `${hasSelfie ? '✅' : '❌'} Selfie\n` +
              `${hasCnhFrente ? '✅' : '❌'} CNH Frente\n` +
              `${hasCnhVerso ? '✅' : '❌'} CNH Verso`
          );
          return;
        }

        Alert.alert(
          '📤 Finalizar Verificação',
          'Você completou todas as capturas! Deseja enviar para verificação?',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Enviar!',
              style: 'default',
              onPress: () => submitBatch(),
            },
          ]
        );
      },
    };

    const actionHandler = stepActionsMap[step.id];

    if (!actionHandler) {
      Alert.alert('❌ Erro', `Ação não encontrada para o passo: ${step.id}`);
      return;
    }

    try {
      await actionHandler();
    } catch (error: unknown) {
      console.error('❌ Erro no passo:', error);
      Alert.alert(
        '❌ Erro',
        `Erro no passo ${step.title}: ${(error as Error).message}`
      );
    }
  }, [
    guidedFlowHook,
    captureSelfie,
    captureDocument,
    capturedItemsHook,
    submitBatch,
  ]);

  return {
    state: {
      capturedItems: capturedItemsHook.capturedItems,
      isLoading,
      currentOperation,
      batchResponse: batchHook.batchResponse,
      batchStatus: batchHook.batchStatus,
      guidedFlow: guidedFlowHook.guidedFlow,
      isGuidedFlowActive: guidedFlowHook.isGuidedFlowActive,
    },

    testBasicBridge: diagnosticsHook.testBasicBridge,
    checkPermissions: diagnosticsHook.checkPermissions,
    captureSelfie,
    captureDocument,
    submitBatch,
    checkBatchStatus: batchHook.checkBatchStatus,
    startGuidedFlow,
    cancelGuidedFlow: guidedFlowHook.cancelGuidedFlow,
    executeCurrentGuidedStep,
    removeItem: capturedItemsHook.removeItem,
    clearAll,
    getStatusIcon: capturedItemsHook.getStatusIcon,
    isCurrentStepCompleted: () =>
      guidedFlowHook.isCurrentStepCompleted(
        capturedItemsHook.capturedItems,
        batchHook.batchResponse
      ),
  };
};
