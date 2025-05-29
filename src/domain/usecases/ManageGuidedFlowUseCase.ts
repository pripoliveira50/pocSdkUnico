import {
  FlowStep,
  GuidedFlowWithMethods,
  createGuidedFlowWithMethods,
} from '@domain/entities/FlowEntity';

const DEFAULT_STEPS: FlowStep[] = [
  {
    id: 'selfie',
    title: 'Capturar Selfie',
    description: 'Primeiro, vamos tirar uma selfie sua',
    icon: '🤳',
  },
  {
    id: 'cnh_frente',
    title: 'CNH Frente',
    description: 'Agora capture a frente da sua CNH',
    icon: '🪪',
  },
  {
    id: 'cnh_verso',
    title: 'CNH Verso',
    description: 'Por último, capture o verso da CNH',
    icon: '🔄',
  },
  {
    id: 'submit',
    title: 'Enviar',
    description: 'Pronto! Vamos enviar tudo para verificação',
    icon: '📤',
  },
];

export const createFlow = (): GuidedFlowWithMethods => {
  return createGuidedFlowWithMethods(DEFAULT_STEPS);
};

export const nextStep = (
  flow: GuidedFlowWithMethods
): GuidedFlowWithMethods => {
  return flow.nextStep();
};

export const resetFlow = (): GuidedFlowWithMethods => {
  return createGuidedFlowWithMethods(DEFAULT_STEPS, 0);
};

export const createManageGuidedFlowUseCase = () => ({
  createFlow,
  nextStep,
  resetFlow,
});

export { DEFAULT_STEPS };
