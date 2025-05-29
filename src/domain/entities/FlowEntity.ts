import { BatchResponse } from './BatchEntity';
import { ActionType, CapturedItem, DocumentType } from './DocumentEntity';

export type FlowStep = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

export type GuidedFlowEntity = {
  readonly steps: FlowStep[];
  readonly currentStep: number;
};

export const createGuidedFlow = (
  steps: FlowStep[],
  currentStep: number = 0
): GuidedFlowEntity => ({
  steps,
  currentStep,
});

export const nextStep = (flow: GuidedFlowEntity): GuidedFlowEntity => {
  if (flow.currentStep < flow.steps.length - 1) {
    return createGuidedFlow(flow.steps, flow.currentStep + 1);
  }
  return flow;
};

export const getCurrentStep = (flow: GuidedFlowEntity): FlowStep | null => {
  return flow.steps[flow.currentStep] || null;
};

export const isLastStep = (flow: GuidedFlowEntity): boolean => {
  return flow.currentStep === flow.steps.length - 1;
};

export const isCompleted = (
  flow: GuidedFlowEntity,
  capturedItems: CapturedItem[],
  batchResponse?: BatchResponse
): boolean => {
  const step = getCurrentStep(flow);
  if (!step) return false;

  const stepCompletionMap: Record<string, () => boolean> = {
    selfie: () => capturedItems.some(item => item.type === ActionType.SELFIE),
    cnh_frente: () =>
      capturedItems.some(item => item.documentType === DocumentType.CNH_FRENTE),
    cnh_verso: () =>
      capturedItems.some(item => item.documentType === DocumentType.CNH_VERSO),
    submit: () => !!batchResponse?.success,
  };

  const completionChecker = stepCompletionMap[step.id];
  return completionChecker ? completionChecker() : false;
};

export const resetFlow = (flow: GuidedFlowEntity): GuidedFlowEntity => {
  return createGuidedFlow(flow.steps, 0);
};

export type GuidedFlowWithMethods = {
  readonly steps: FlowStep[];
  readonly currentStep: number;
  nextStep(): GuidedFlowWithMethods;
  getCurrentStep(): FlowStep | null;
  isLastStep(): boolean;
  isCompleted(
    capturedItems: CapturedItem[],
    batchResponse?: BatchResponse
  ): boolean;
  reset(): GuidedFlowWithMethods;
};

export const createGuidedFlowWithMethods = (
  steps: FlowStep[],
  currentStep: number = 0
): GuidedFlowWithMethods => {
  const flow: GuidedFlowEntity = { steps, currentStep };

  return {
    steps,
    currentStep,
    nextStep() {
      const newFlow = nextStep(flow);
      return createGuidedFlowWithMethods(newFlow.steps, newFlow.currentStep);
    },
    getCurrentStep() {
      return getCurrentStep(flow);
    },
    isLastStep() {
      return isLastStep(flow);
    },
    isCompleted(capturedItems: CapturedItem[], batchResponse?: BatchResponse) {
      return isCompleted(flow, capturedItems, batchResponse);
    },
    reset() {
      const newFlow = resetFlow(flow);
      return createGuidedFlowWithMethods(newFlow.steps, newFlow.currentStep);
    },
  };
};
