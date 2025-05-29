import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { BatchResponse } from '@domain/entities/BatchEntity';
import {
  ActionType,
  CapturedItem,
  DocumentType,
} from '@domain/entities/DocumentEntity';
import { GuidedFlowWithMethods } from '@domain/entities/FlowEntity';
import { createManageGuidedFlowUseCase } from '@domain/usecases/ManageGuidedFlowUseCase';

enum GuidedFlowStepId {
  SELFIE = 'selfie',
  CNH_FRENTE = 'cnh_frente',
  CNH_VERSO = 'cnh_verso',
  SUBMIT = 'submit',
}

export const useGuidedFlow = () => {
  const [guidedFlow, setGuidedFlow] = useState<
    GuidedFlowWithMethods | undefined
  >();
  const [isGuidedFlowActive, setIsGuidedFlowActive] = useState(false);

  const useCases = useMemo(
    () => ({
      manageGuidedFlow: createManageGuidedFlowUseCase(),
    }),
    []
  );

  const stepCompletionMap: Record<
    GuidedFlowStepId,
    (items: CapturedItem[], batchResponse?: BatchResponse) => boolean
  > = useMemo(
    () => ({
      [GuidedFlowStepId.SELFIE]: items =>
        items.some(item => item.type === ActionType.SELFIE),
      [GuidedFlowStepId.CNH_FRENTE]: items =>
        items.some(item => item.documentType === DocumentType.CNH_FRENTE),
      [GuidedFlowStepId.CNH_VERSO]: items =>
        items.some(item => item.documentType === DocumentType.CNH_VERSO),
      [GuidedFlowStepId.SUBMIT]: (items, batchResponse) =>
        !!batchResponse?.success,
    }),
    []
  );

  const stepAdvanceCheckMap: Record<
    GuidedFlowStepId,
    (docType?: DocumentType) => boolean
  > = useMemo(
    () => ({
      [GuidedFlowStepId.SELFIE]: () => true,
      [GuidedFlowStepId.CNH_FRENTE]: docType =>
        docType === DocumentType.CNH_FRENTE,
      [GuidedFlowStepId.CNH_VERSO]: docType =>
        docType === DocumentType.CNH_VERSO,
      [GuidedFlowStepId.SUBMIT]: () => false,
    }),
    []
  );

  const startGuidedFlow = useCallback((): void => {
    const flow = useCases.manageGuidedFlow.createFlow();
    setGuidedFlow(flow);
    setIsGuidedFlowActive(true);

    Alert.alert(
      '🎯 Fluxo Guiado Iniciado',
      'Vamos começar! Siga os passos para completar sua verificação.',
      [{ text: 'Começar!' }]
    );
  }, [useCases.manageGuidedFlow]);

  const cancelGuidedFlow = useCallback((): void => {
    setGuidedFlow(undefined);
    setIsGuidedFlowActive(false);
  }, []);

  const nextGuidedFlowStep = useCallback((): void => {
    if (guidedFlow) {
      const nextFlow = useCases.manageGuidedFlow.nextStep(guidedFlow);
      setGuidedFlow(nextFlow);

      const nextStep = nextFlow.getCurrentStep();
      if (nextStep && !nextFlow.isLastStep()) {
        setTimeout(() => {
          Alert.alert(
            '📋 Próximo Passo',
            `${nextStep.icon} ${nextStep.title}\n\n${nextStep.description}`,
            [{ text: 'Entendi!' }]
          );
        }, 500);
      }
    }
  }, [guidedFlow, useCases.manageGuidedFlow]);

  const checkAndAdvanceGuidedFlow = useCallback(
    (
      items: CapturedItem[],
      stepId: GuidedFlowStepId,
      docType?: DocumentType,
      batchResponse?: BatchResponse
    ): void => {
      if (!guidedFlow || !isGuidedFlowActive) return;

      const currentStep = guidedFlow.getCurrentStep();
      if (!currentStep || currentStep.id !== stepId) return;

      const shouldAdvance = stepAdvanceCheckMap[stepId](docType);
      if (!shouldAdvance) return;

      const isCompleted = stepCompletionMap[stepId](items, batchResponse);

      if (isCompleted) {
        setTimeout(() => {
          nextGuidedFlowStep();
        }, 1000);
      }
    },
    [
      guidedFlow,
      isGuidedFlowActive,
      stepAdvanceCheckMap,
      stepCompletionMap,
      nextGuidedFlowStep,
    ]
  );

  const isCurrentStepCompleted = useCallback(
    (items: CapturedItem[], batchResponse?: BatchResponse): boolean => {
      const step = guidedFlow?.getCurrentStep();
      if (!step) return false;

      const completionChecker = stepCompletionMap[step.id as GuidedFlowStepId];
      return completionChecker
        ? completionChecker(items, batchResponse)
        : false;
    },
    [guidedFlow, stepCompletionMap]
  );

  const canExecuteCurrentStep = useCallback(
    (items: CapturedItem[]): boolean => {
      const step = guidedFlow?.getCurrentStep();
      if (!step) return false;

      if (step.id === GuidedFlowStepId.SUBMIT) {
        const hasSelfie = items.some(item => item.type === ActionType.SELFIE);
        const hasCnhFrente = items.some(
          item => item.documentType === DocumentType.CNH_FRENTE
        );
        const hasCnhVerso = items.some(
          item => item.documentType === DocumentType.CNH_VERSO
        );
        return hasSelfie && hasCnhFrente && hasCnhVerso;
      }

      return true;
    },
    [guidedFlow]
  );

  return {
    guidedFlow,
    isGuidedFlowActive,
    startGuidedFlow,
    cancelGuidedFlow,
    nextGuidedFlowStep,
    checkAndAdvanceGuidedFlow,
    isCurrentStepCompleted,
    canExecuteCurrentStep,
    GuidedFlowStepId,
  };
};
