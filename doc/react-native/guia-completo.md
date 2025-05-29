# 📱 Estrutura React Native - Guia Detalhado Completo

Este documento explica **detalhadamente** cada parte da estrutura React Native do projeto SDK Unico Bridge, desde o propósito até a implementação prática. É um guia completo para entender **por que** cada arquivo existe e **como** implementar uma arquitetura similar.

---

## 🏗️ Visão Geral da Arquitetura

```
src/
├── domain/          # 🧠 CÉREBRO - Regras de negócio puras
├── data/           # 🔌 CONECTORES - Implementações concretas
├── infrastructure/ # 🌉 PONTE - Comunicação com mundo externo
├── presentation/   # 🎨 INTERFACE - UI e interação com usuário
├── shared/         # 🛠️ UTILITÁRIOS - Recursos compartilhados
└── App.tsx         # 🚀 ENTRADA - Ponto inicial da aplicação
```

### **Por que esta estrutura?**

1. **Separação de Responsabilidades**: Cada camada tem uma função específica
2. **Testabilidade**: Cada parte pode ser testada independentemente
3. **Manutenibilidade**: Mudanças em uma camada não afetam outras
4. **Escalabilidade**: Fácil adicionar novas funcionalidades
5. **Reutilização**: Lógica pode ser reutilizada em diferentes contextos

---

## 🧠 DOMAIN LAYER - O Cérebro da Aplicação

### **Propósito Geral**

O Domain é o **coração** da aplicação. Contém todas as regras de negócio, sem depender de frameworks, UI ou tecnologias específicas. É a camada mais importante porque define **o que** a aplicação faz.

---

### 📁 `domain/entities/` - Modelos de Dados

#### **Para que serve:**

- Define a **estrutura** dos dados que a aplicação manipula
- Estabelece **contratos** que outras camadas devem seguir
- Garante **consistência** em toda a aplicação

#### `BatchEntity.ts` - Entidade de Lote de Envio

```typescript
export type BatchResponse = {
  success: boolean;
  batchId?: string;
  message: string;
  processedItems?: {
    selfie?: { processId: string; status: string };
    documents?: Array<{ type: string; processId: string; status: string }>;
  };
  error?: string;
};
```

**Por que existe:**

- **Padronização**: Garante que todas as respostas do backend sigam o mesmo formato
- **Tipagem**: TypeScript pode validar em tempo de compilação
- **Documentação**: Serve como documentação viva da API

**Como usar:**

```typescript
// ✅ Correto - tipado e seguro
const response: BatchResponse = await submitBatch(items);
if (response.success) {
  console.log(`Batch criado: ${response.batchId}`);
}

// ❌ Incorreto - sem tipagem
const response = await submitBatch(items);
if (response.sucess) {
  // Erro de digitação não detectado
  console.log(response.batchID); // Propriedade inexistente
}
```

#### `DocumentEntity.ts` - Entidade de Documentos

```typescript
export enum DocumentType {
  CNH_FRENTE = 'CNH_FRENTE',
  CNH_VERSO = 'CNH_VERSO',
  CPF = 'CPF',
  RG = 'RG',
}

export type CapturedItem = {
  id: string;
  type: ActionType;
  documentType?: DocumentType;
  result: UnicoResult;
  timestamp: string;
  status: DocumentStatus;
};
```

**Por que existe:**

- **Enumeração Segura**: Previne uso de strings inválidas
- **Estrutura Consistente**: Todos os itens capturados seguem o mesmo formato
- **Evolução Controlada**: Adicionar novos tipos é seguro e rastreável

**Exemplo de uso:**

```typescript
// ✅ Seguro - TypeScript valida o tipo
const captureDocument = (type: DocumentType) => {
  // Só aceita valores válidos do enum
};

captureDocument(DocumentType.CNH_FRENTE); // ✅ Válido
captureDocument('CNH_FRONT'); // ❌ Erro de compilação

// ✅ Estrutura garantida
const item: CapturedItem = {
  id: 'unique-id',
  type: ActionType.DOCUMENT,
  documentType: DocumentType.CNH_FRENTE,
  result: { base64: '...', encrypted: '...' },
  timestamp: new Date().toISOString(),
  status: DocumentStatus.CAPTURED,
};
```

#### `FlowEntity.ts` - Entidade de Fluxo Guiado

```typescript
export type FlowStep = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

export type GuidedFlowWithMethods = {
  readonly steps: FlowStep[];
  readonly currentStep: number;
  nextStep(): GuidedFlowWithMethods;
  getCurrentStep(): FlowStep | null;
  isLastStep(): boolean;
  isCompleted(items: CapturedItem[], batchResponse?: BatchResponse): boolean;
  reset(): GuidedFlowWithMethods;
};
```

**Por que existe:**

- **Imutabilidade**: `readonly` garante que o estado não seja modificado acidentalmente
- **Encapsulamento**: Métodos controlam como o fluxo pode ser manipulado
- **Funcional**: Cada método retorna uma nova instância (sem side effects)

**Exemplo prático:**

```typescript
// ✅ Padrão imutável
const flow = createGuidedFlow(steps);
const nextFlow = flow.nextStep(); // Nova instância
console.log(flow.currentStep); // 0 (original não mudou)
console.log(nextFlow.currentStep); // 1 (nova instância)

// ❌ Padrão mutável (evitado)
flow.currentStep++; // Erro: readonly
```

---

### 📁 `domain/repositories/` - Contratos de Interface

#### **Para que serve:**

- Define **interfaces** que outras camadas devem implementar
- Estabelece **contratos** sem se preocupar com implementação
- Permite **inversão de dependência** (Dependency Inversion Principle)

#### `UnicoRepository.ts` - Contrato do SDK

```typescript
export type UnicoRepository = {
  testConnection(): Promise<string>;
  checkPermissions(): Promise<UnicoPermissions>;
  captureSelfie(): Promise<CaptureResult>;
  captureDocument(documentType: DocumentType): Promise<CaptureResult>;
  ensureCameraPermission(): Promise<boolean>;
};
```

**Por que é importante:**

- **Abstração**: O Domain não precisa saber se usa Android ou iOS
- **Testabilidade**: Pode criar mocks facilmente
- **Flexibilidade**: Implementação pode mudar sem afetar regras de negócio

**Exemplo de uso:**

```typescript
// Use Case não sabe se é Android ou iOS
const executeCaptureSelfie = async (
  unicoRepository: UnicoRepository // Interface, não implementação
): Promise<CapturedItem> => {
  const result = await unicoRepository.captureSelfie();
  // ... lógica de negócio
};

// Em tempo de execução, injeta a implementação correta
const useCase = createCaptureSelfieUseCase(unicoRepositoryImpl);
```

#### `BatchRepository.ts` - Contrato de Envio

```typescript
export type BatchRepository = {
  submitBatch(items: CapturedItem[]): Promise<BatchResponse>;
  checkBatchStatus(batchId: string): Promise<unknown>;
};
```

**Por que existe:**

- **Flexibilidade de Backend**: Pode trocar de API sem mudar lógica
- **Ambiente**: Desenvolvimento vs Produção vs Mock
- **Evolução**: API pode evoluir independentemente

---

### 📁 `domain/usecases/` - Casos de Uso (Regras de Negócio)

#### **Para que serve:**

- Implementa **regras específicas** de cada funcionalidade
- Orquestra **interações** entre entidades e repositórios
- Mantém **lógica de negócio** separada da UI

#### `CaptureSelfieUseCase.ts` - Lógica de Captura de Selfie

```typescript
export const executeCaptureSelfie = async (
  unicoRepository: UnicoRepository
): Promise<CapturedItem> => {
  // 1. Executa a captura
  const result = await unicoRepository.captureSelfie();

  // 2. Valida o resultado (regra de negócio)
  if (!result.success || !result.data) {
    throw new Error(result.error || 'Erro na captura da selfie');
  }

  // 3. Cria estrutura padronizada (regra de negócio)
  return {
    id: `selfie_${Date.now()}`, // Gera ID único
    type: ActionType.SELFIE, // Define tipo
    result: result.data, // Dados da captura
    timestamp: new Date().toISOString(), // Marca temporal
    status: DocumentStatus.CAPTURED, // Estado inicial
  };
};
```

**Por que não fazer isso na UI:**

- **Reutilização**: Mesma lógica pode ser usada em diferentes telas
- **Testabilidade**: Fácil testar regras sem envolver UI
- **Manutenção**: Mudanças de regra ficam centralizadas

**Exemplo de teste:**

```typescript
// ✅ Fácil de testar
const mockRepository: UnicoRepository = {
  captureSelfie: jest.fn().mockResolvedValue({
    success: true,
    data: { base64: 'mock-base64', encrypted: 'mock-encrypted' },
  }),
  // ... outros métodos mockados
};

const result = await executeCaptureSelfie(mockRepository);
expect(result.type).toBe(ActionType.SELFIE);
expect(result.status).toBe(DocumentStatus.CAPTURED);
```

#### `SubmitBatchUseCase.ts` - Lógica de Envio

```typescript
export const executeSubmitBatch = async (
  batchRepository: BatchRepository,
  items: CapturedItem[]
): Promise<BatchResponse> => {
  // Validação de regra de negócio
  if (items.length === 0) {
    throw new Error('Nenhum item para enviar');
  }

  // Regra específica: precisa ter pelo menos uma selfie
  const hasSelfie = items.some(item => item.type === ActionType.SELFIE);
  if (!hasSelfie) {
    throw new Error('É necessário pelo menos uma selfie');
  }

  // Delega para o repositório
  return await batchRepository.submitBatch(items);
};
```

**Por que estas validações aqui:**

- **Regras de Negócio**: "Sempre precisa de selfie" é uma regra da aplicação
- **Consistência**: Validação sempre acontece, independente da UI
- **Feedback Claro**: Erros específicos para o usuário

#### `ManageGuidedFlowUseCase.ts` - Lógica do Fluxo Guiado

```typescript
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
```

**Por que definir os passos aqui:**

- **Regra de Negócio**: A sequência é uma regra da aplicação
- **Flexibilidade**: Fácil alterar ordem ou adicionar passos
- **Reutilização**: Pode usar em diferentes contextos

---

## 🔌 DATA LAYER - Os Conectores

### **Propósito Geral**

O Data Layer implementa os **contratos** definidos no Domain. É onde as **abstrações** se tornam **implementações concretas**.

---

### 📁 `data/repositories/` - Implementações dos Contratos

#### `UnicoRepositoryImpl.ts` - Implementação do SDK

```typescript
import { unicoRepositoryImpl } from '@infrastructure/UnicoSdkService';

const testConnectionImpl = async (): Promise<string> => {
  return await testConnection(); // Delega para infrastructure
};

const captureSelfieImpl = async (): Promise<CaptureResult> => {
  return await captureSelfieWithPermissionCheck(); // Adiciona verificação de permissão
};

export const unicoRepositoryImpl: UnicoRepository = {
  testConnection: testConnectionImpl,
  checkPermissions: checkPermissionsImpl,
  captureSelfie: captureSelfieImpl,
  captureDocument: captureDocumentImpl,
  ensureCameraPermission: ensureCameraPermissionImpl,
};
```

**Por que esta camada:**

- **Adaptação**: Adapta interface externa para contrato interno
- **Composição**: Combina multiple serviços se necessário
- **Validação Extra**: Adiciona validações específicas da implementação

**Exemplo de adaptação:**

```typescript
// Infrastructure retorna formato X
const nativeResult = await UnicoSdkService.capture();

// Repository adapta para formato do Domain
const domainResult: CaptureResult = {
  success: nativeResult.success,
  data: nativeResult.success
    ? {
        base64: nativeResult.base64,
        encrypted: nativeResult.encrypted,
      }
    : undefined,
  error: nativeResult.error,
};
```

#### `BatchRepositoryImpl.ts` - Implementação de Envio

```typescript
const submitBatchImpl = async (
  capturedItems: CapturedItem[]
): Promise<BatchResponse> => {
  try {
    // Organiza dados para envio
    const selfieItem = capturedItems.find(
      item => item.type === ActionType.SELFIE
    );
    const documentItems = capturedItems.filter(
      item => item.type === ActionType.DOCUMENT
    );

    // Simula requisição HTTP
    await new Promise(resolve => setTimeout(() => resolve(undefined), 3000));

    // Formata resposta no padrão esperado
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
    return {
      success: false,
      message: 'Erro ao enviar lote para verificação',
      error: error.message,
    };
  }
};
```

**Por que organizar os dados aqui:**

- **Transformação**: Converte estrutura interna para formato da API
- **Tratamento de Erro**: Converte erros de rede para formato esperado
- **Mock/Real**: Pode alternar entre implementação real e mock

#### `PermissionRepositoryImpl.ts` - Implementação de Permissões

```typescript
import { PERMISSIONS, RESULTS, request } from 'react-native-permissions';

const checkCameraPermissionImpl = async (): Promise<boolean> => {
  const permission = isIos
    ? PERMISSIONS.IOS.CAMERA
    : PERMISSIONS.ANDROID.CAMERA;

  const result = await request(permission);
  return result === RESULTS.GRANTED;
};
```

**Por que existe:**

- **Abstração de Plataforma**: Esconde diferenças entre iOS e Android
- **Biblioteca Externa**: Isola dependência de `react-native-permissions`
- **Lógica Específica**: Adiciona lógica específica da aplicação

---

## 🌉 INFRASTRUCTURE LAYER - A Ponte

### **Propósito Geral**

O Infrastructure é a **ponte** entre a aplicação e o mundo externo (APIs, módulos nativos, bibliotecas).

---

### 📁 `infrastructure/UnicoSdkService.ts` - Ponte com Módulo Nativo

```typescript
import { NativeEventEmitter, NativeModules } from 'react-native';

const { UnicoSdk: UnicoSdkModule } = NativeModules;

// Validação de existência do módulo
if (!UnicoSdkModule) {
  throw new Error(
    'UnicoSdkModule não foi carregado. Verifique a implementação nativa.'
  );
}

// Criação do emissor de eventos
const unicoEventEmitter = new NativeEventEmitter(UnicoSdkModule);

// Funções diretas (thin wrapper)
export const testConnection = (): Promise<string> => {
  return UnicoSdkModule.testConnection();
};

export const captureSelfie = (): Promise<UnicoResult> => {
  return UnicoSdkModule.captureSelfie();
};
```

**Por que este arquivo:**

- **Centralização**: Todas as chamadas nativas passam por aqui
- **Validação**: Verifica se módulo nativo está carregado
- **Eventos**: Gerencia eventos nativos centralizadamente
- **Thin Wrapper**: Não adiciona lógica, apenas expõe funcionalidades

**Funções com Lógica Adicional:**

```typescript
export const captureSelfieWithPermissionCheck =
  async (): Promise<CaptureResult> => {
    try {
      // 1. Verifica permissão primeiro
      const hasPermission = await ensureCameraPermission();
      if (!hasPermission) {
        return {
          success: false,
          error:
            'Permissão de câmera necessária. Vá em Configurações > Privacidade > Câmera',
        };
      }

      // 2. Executa captura
      const data = await captureSelfie();
      return { success: true, data };
    } catch (error: unknown) {
      return {
        success: false,
        error: (error as Error).message || 'Erro desconhecido na captura',
      };
    }
  };
```

**Por que adicionar lógica aqui:**

- **Padrão Comum**: Verificação de permissão sempre necessária
- **Tratamento de Erro**: Converte exceções em resultados estruturados
- **Reutilização**: Múltiplos lugares precisam desta lógica

**Gerenciamento de Eventos:**

```typescript
export const addEventListener = (
  eventName: string,
  callback: (event: unknown) => void
): (() => void) => {
  const subscription = unicoEventEmitter.addListener(eventName, callback);
  return () => subscription.remove(); // Retorna função de cleanup
};

// Uso na aplicação
const removeListener = addEventListener('onErrorAcessoBio', event => {
  console.error('Erro do SDK:', event);
});

// Cleanup quando necessário
removeListener();
```

---

## 🎨 PRESENTATION LAYER - A Interface

### **Propósito Geral**

O Presentation Layer é onde a **lógica de apresentação** acontece. Gerencia estados da UI, interações do usuário e coordena com as camadas inferiores.

---

### 📁 `presentation/hooks/` - Lógica de Estado

#### **Por que usar Custom Hooks:**

- **Reutilização**: Lógica pode ser usada em múltiplos componentes
- **Separação**: Lógica separada da renderização
- **Testabilidade**: Hooks podem ser testados independentemente
- **Composição**: Hooks podem usar outros hooks

#### `useCapturedItems.ts` - Gerenciamento da Coleção

```typescript
export const useCapturedItems = () => {
  const [capturedItems, setCapturedItems] = useState<CapturedItem[]>([]);

  const addItem = useCallback((newItem: CapturedItem): void => {
    setCapturedItems(prevItems => {
      // Lógica de substituição: remove item anterior do mesmo tipo
      const filteredItems = prevItems.filter(item => {
        if (newItem.type === ActionType.SELFIE) {
          return item.type !== ActionType.SELFIE; // Só uma selfie por vez
        }
        if (newItem.type === ActionType.DOCUMENT) {
          return !(
            item.type === ActionType.DOCUMENT &&
            item.documentType === newItem.documentType // Só um doc de cada tipo
          );
        }
        return true;
      });

      return [...filteredItems, newItem];
    });
  }, []);

  // Funções de conveniência
  const hasSelfie = useMemo(
    () => capturedItems.some(item => item.type === ActionType.SELFIE),
    [capturedItems]
  );

  const hasDocument = useCallback(
    (docType: DocumentType): boolean =>
      capturedItems.some(item => item.documentType === docType),
    [capturedItems]
  );

  return {
    capturedItems,
    addItem,
    removeItem,
    updateItemsStatus,
    clearItems,
    hasSelfie,
    hasDocument,
    getItemsCount: capturedItems.length,
  };
};
```

**Por que esta lógica:**

- **Regra de UX**: Usuário pode refazer captura, mas só mantém a mais recente
- **Performance**: `useMemo` para cálculos derivados
- **Immutabilidade**: Sempre retorna novo array, nunca modifica existente

#### `useCapture.ts` - Gerenciamento de Capturas

```typescript
export const useCapture = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentOperation, setCurrentOperation] = useState('');

  const { requestPermissionOrRedirect } = usePermissions();

  const captureSelfie = useCallback(async (): Promise<CapturedItem | null> => {
    try {
      // 1. Verifica permissão antes de qualquer coisa
      const granted = await requestPermissionOrRedirect();
      if (!granted) return null;

      // 2. Indica loading para UI
      setIsLoading(true);
      setCurrentOperation('Capturando selfie...');

      // 3. Executa Use Case
      const newItem = await useCases.captureSelfie.execute();

      // 4. Feedback para usuário
      Alert.alert('✅ Sucesso', 'Selfie capturada e adicionada à coleção!');
      return newItem;
    } catch (error: unknown) {
      console.error('❌ Erro captura selfie:', error);
      Alert.alert('Erro', (error as Error).message);
      return null;
    } finally {
      // 5. Sempre limpa loading
      setIsLoading(false);
      setCurrentOperation('');
    }
  }, [requestPermissionOrRedirect, useCases.captureSelfie]);

  return {
    isLoading,
    currentOperation,
    captureSelfie,
    captureDocument,
  };
};
```

**Por que esta estrutura:**

- **UX Consistente**: Sempre verifica permissão primeiro
- **Feedback Visual**: Loading states para operações demoradas
- **Tratamento de Erro**: Sempre mostra feedback ao usuário
- **Cleanup**: `finally` garante que loading seja limpo

#### `useGuidedFlow.ts` - Gerenciamento do Fluxo Guiado

```typescript
export const useGuidedFlow = () => {
  const [guidedFlow, setGuidedFlow] = useState<
    GuidedFlowWithMethods | undefined
  >();
  const [isGuidedFlowActive, setIsGuidedFlowActive] = useState(false);

  // Mapa de verificação de conclusão de passo
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

      // Verifica se deve avançar baseado no tipo de documento
      const shouldAdvance = stepAdvanceCheckMap[stepId](docType);
      if (!shouldAdvance) return;

      // Verifica se o passo foi realmente completado
      const isCompleted = stepCompletionMap[stepId](items, batchResponse);

      if (isCompleted) {
        // Avança após um delay para melhor UX
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
```

**Por que esta complexidade:**

- **Flexibilidade**: Diferentes passos têm diferentes critérios de conclusão
- **UX**: Avança automaticamente quando passo é completado
- **Validação**: Verifica múltiplas condições antes de avançar
- **Timing**: Delay melhora percepção do usuário

#### `useHomeController.ts` - Orchestrador Principal

```typescript
export const useHomeController = () => {
  // Agrega todos os hooks especializados
  const capturedItemsHook = useCapturedItems();
  const captureHook = useCapture();
  const batchHook = useBatch();
  const guidedFlowHook = useGuidedFlow();
  const diagnosticsHook = useDiagnostics();

  // Estados derivados
  const isLoading =
    captureHook.isLoading || batchHook.isLoading || diagnosticsHook.isLoading;
  const currentOperation =
    captureHook.currentOperation ||
    batchHook.currentOperation ||
    diagnosticsHook.currentOperation;

  // Orchestração de ações
  const captureSelfie = useCallback(async (): Promise<void> => {
    const newItem = await captureHook.captureSelfie();
    if (newItem) {
      // 1. Adiciona à coleção
      capturedItemsHook.addItem(newItem);

      // 2. Avança fluxo guiado se ativo
      guidedFlowHook.checkAndAdvanceGuidedFlow(
        [...capturedItemsHook.capturedItems, newItem],
        guidedFlowHook.GuidedFlowStepId.SELFIE
      );
    }
  }, [captureHook, capturedItemsHook, guidedFlowHook]);

  const executeCurrentGuidedStep = useCallback(async (): Promise<void> => {
    const step = guidedFlowHook.guidedFlow?.getCurrentStep();
    if (!step) {
      Alert.alert('❌ Erro', 'Passo não encontrado');
      return;
    }

    // Mapa de ações por passo
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
        // Validação antes do envio
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

        // Confirmação antes do envio
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
    if (actionHandler) {
      try {
        await actionHandler();
      } catch (error: unknown) {
        console.error('❌ Erro no passo:', error);
        Alert.alert(
          '❌ Erro',
          `Erro no passo ${step.title}: ${(error as Error).message}`
        );
      }
    } else {
      Alert.alert('❌ Erro', `Ação não encontrada para o passo: ${step.id}`);
    }
  }, [
    guidedFlowHook,
    captureSelfie,
    captureDocument,
    capturedItemsHook,
    submitBatch,
  ]);

  // Interface unificada para a UI
  return {
    // Estados
    state: {
      capturedItems: capturedItemsHook.capturedItems,
      isLoading,
      currentOperation,
      batchResponse: batchHook.batchResponse,
      batchStatus: batchHook.batchStatus,
      guidedFlow: guidedFlowHook.guidedFlow,
      isGuidedFlowActive: guidedFlowHook.isGuidedFlowActive,
    },

    // Ações
    testBasicBridge: diagnosticsHook.testBasicBridge,
    checkPermissions: diagnosticsHook.checkPermissions,
    captureSelfie,
    captureDocument,
    submitBatch,
    checkBatchStatus: batchHook.checkBatchStatus,
    startGuidedFlow: () => {
      capturedItemsHook.clearItems(); // Limpa itens anteriores
      guidedFlowHook.startGuidedFlow();
    },
    cancelGuidedFlow: guidedFlowHook.cancelGuidedFlow,
    executeCurrentGuidedStep,
    removeItem: capturedItemsHook.removeItem,
    clearAll: () => {
      capturedItemsHook.clearItems();
      guidedFlowHook.cancelGuidedFlow();
    },
    getStatusIcon: capturedItemsHook.getStatusIcon,
    isCurrentStepCompleted: () =>
      guidedFlowHook.isCurrentStepCompleted(
        capturedItemsHook.capturedItems,
        batchHook.batchResponse
      ),
  };
};
```

**Por que este hook é necessário:**

- **Orchestração**: Coordena múltiplos hooks especializados
- **Interface Unificada**: UI só precisa se conectar a um lugar
- **Lógica de Negócio**: Implementa regras específicas da tela
- **Composição**: Reutiliza lógica de outros hooks

---

### 📁 `presentation/screens/home/index.tsx` - Interface Principal

```typescript
export const HomeScreen: React.FC = () => {
  const {
    state,
    testBasicBridge,
    captureSelfie,
    startGuidedFlow,
    executeCurrentGuidedStep,
    // ... outras ações
  } = useHomeController();

  // Função auxiliar para verificar se pode executar passo atual
  const canExecuteCurrentStep = (): boolean => {
    const step = state.guidedFlow?.getCurrentStep();
    if (!step) return false;

    if (step.id === FlowStep.SUBMIT) {
      // Validação específica para envio
      const hasSelfie = state.capturedItems.some(item => item.type === ActionType.SELFIE);
      const hasCnhFrente = state.capturedItems.some(item => item.documentType === DocumentType.CNH_FRENTE);
      const hasCnhVerso = state.capturedItems.some(item => item.documentType === DocumentType.CNH_VERSO);
      return hasSelfie && hasCnhFrente && hasCnhVerso;
    }

    return true;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Título */}
        <Text style={styles.title}>📦 Unico SDK Bridge</Text>
        <Text style={styles.subtitle}>Capture tudo primeiro, envie depois!</Text>

        {/* Seção de Diagnósticos */}
        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>🔧 Testes e Diagnósticos</Text>
          <View style={styles.buttonRow}>
            <Button title='🔍 Teste Bridge' onPress={testBasicBridge} disabled={state.isLoading} />
            <Button title='📷 Permissões' onPress={checkPermissions} disabled={state.isLoading} />
          </View>
        </View>

        {/* Renderização condicional baseada no fluxo */}
        {!state.isGuidedFlowActive ? (
          // Modo manual
          <NonGuidedModeComponent />
        ) : (
          // Modo guiado
          <GuidedModeComponent />
        )}

        {/* Lista de itens capturados */}
        {state.capturedItems.length > 0 && (
          <CapturedItemsListComponent />
        )}

        {/* Indicador de loading */}
        {state.isLoading && (
          <LoadingComponent />
        )}

        {/* Respostas do backend */}
        {state.batchResponse && (
          <ResponseComponent />
        )}

      </ScrollView>
    </SafeAreaView>
  );
};
```

**Por que esta estrutura:**

- **Renderização Condicional**: UI se adapta ao estado atual
- **Componentização**: Pode quebrar em componentes menores se necessário
- **Estado Centralizado**: Toda informação vem do controller
- **Responsividade**: ScrollView permite conteúdo dinâmico

---

## 🛠️ SHARED LAYER - Recursos Compartilhados

### 📁 `shared/styles/home.ts` - Estilos Centralizados

```typescript
export const styles = StyleSheet.create({
  // Layout principal
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },

  // Seções com cores semânticas
  testSection: {
    backgroundColor: '#f0f4ff', // Azul claro - área técnica
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },

  captureSection: {
    backgroundColor: '#e8f5e8', // Verde claro - ações de captura
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },

  guidedFlowSection: {
    backgroundColor: '#f3e5f5', // Roxo claro - fluxo guiado
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },

  // Estados visuais
  progressBar: {
    height: 8,
    backgroundColor: '#c5cae9',
    borderRadius: 4,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#5e35b1',
    borderRadius: 4,
  },

  // Componentes interativos
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },

  // Cards de itens
  itemCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },

  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'center',
  },
});
```

**Por que centralizar estilos:**

- **Consistência**: Mesmos padrões em toda aplicação
- **Manutenção**: Mudanças centralizadas
- **Performance**: StyleSheet otimiza estilos
- **Reutilização**: Componentes podem compartilhar estilos

---

## 🚀 APP.TSX - Ponto de Entrada

```typescript
import React from 'react';
import HomeScreen from './presentation/screens/home';

export default function App() {
  return <HomeScreen />;
}
```

**Por que tão simples:**

- **Single Responsibility**: Apenas ponto de entrada
- **Escalabilidade**: Fácil adicionar navegação ou providers
- **Clareza**: Mostra que complexidade está bem organizada

**Evolução possível:**

```typescript
export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <ThemeProvider>
          <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </Stack.Navigator>
        </ThemeProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}
```

---

## 🔄 Fluxo Completo de Dados

### **1. Inicialização da Aplicação**

```
App.tsx → HomeScreen → useHomeController() →
[todos os hooks especializados são inicializados] →
Estado inicial renderizado
```

### **2. Captura de Selfie (Fluxo Manual)**

```
Usuário toca botão "Selfie" →
HomeScreen.onPress() →
useHomeController.captureSelfie() →
useCapture.captureSelfie() →
usePermissions.requestPermissionOrRedirect() →
[verifica se precisa pedir permissão] →
UnicoRepositoryImpl.captureSelfie() →
UnicoSdkService.captureSelfieWithPermissionCheck() →
NativeModules.UnicoSdk.captureSelfie() →
[código nativo executa] →
Resultado volta pela cadeia →
CaptureSelfieUseCase.execute() →
[valida resultado e cria CapturedItem] →
useCapturedItems.addItem() →
[estado atualizado] →
UI re-renderiza com novo item
```

### **3. Fluxo Guiado Completo**

```
Usuário toca "Iniciar Fluxo Guiado" →
useHomeController.startGuidedFlow() →
useCapturedItems.clearItems() →
useGuidedFlow.startGuidedFlow() →
ManageGuidedFlowUseCase.createFlow() →
[fluxo criado com passos padrão] →
Estado atualizado →
UI mostra primeiro passo →

Usuário executa passo atual →
useHomeController.executeCurrentGuidedStep() →
[identifica ação baseada no passo] →
[executa captura correspondente] →
useGuidedFlow.checkAndAdvanceGuidedFlow() →
[verifica se passo foi completado] →
[avança para próximo passo se necessário] →
UI atualizada para novo passo →

[repete até último passo] →

Último passo (Submit) →
useBatch.submitBatch() →
SubmitBatchUseCase.execute() →
[valida se tem todos os itens necessários] →
BatchRepositoryImpl.submitBatch() →
[envia para backend] →
Resposta atualiza estado →
UI mostra resultado final
```

### **4. Gerenciamento de Estado Reativo**

```
Qualquer mudança de estado →
React detecta mudança →
Componentes que dependem re-renderizam →
useMemo/useCallback otimizam re-cálculos →
UI sempre consistente com estado atual
```

---

## 🎯 Princípios de Design Aplicados

### **1. Single Responsibility Principle**

- Cada arquivo tem **uma** responsabilidade
- Cada função faz **uma** coisa
- Cada hook gerencia **um** aspecto

### **2. Dependency Inversion Principle**

- Domain define **interfaces**
- Data implementa **contratos**
- Infrastructure fornece **implementações**

### **3. Open/Closed Principle**

- Fácil **adicionar** novas funcionalidades
- **Sem modificar** código existente
- Extensão via **composição**

### **4. Interface Segregation Principle**

- Interfaces **específicas** para cada necessidade
- Não força implementação de métodos desnecessários

### **5. DRY (Don't Repeat Yourself)**

- Lógica **centralizada** em hooks
- **Reutilização** via composição
- **Abstrações** para operações comuns

---

## 🚀 Como Implementar uma Estrutura Similar

### **1. Começar pelo Domain**

```typescript
// 1. Definir entidades
export type MyEntity = {
  /* ... */
};

// 2. Definir contratos
export type MyRepository = {
  /* ... */
};

// 3. Implementar use cases
export const executeMyUseCase = async (/* ... */) => {
  /* ... */
};
```

### **2. Implementar Data Layer**

```typescript
// 1. Implementar repositórios
export const myRepositoryImpl: MyRepository = {
  /* ... */
};

// 2. Adaptar interfaces externas
const adaptExternalAPI = externalData => internalFormat;
```

### **3. Criar Infrastructure**

```typescript
// 1. Conectar com serviços externos
export const myExternalService = {
  /* ... */
};

// 2. Gerenciar recursos (cache, eventos, etc)
```

### **4. Desenvolver Presentation**

```typescript
// 1. Criar hooks especializados
export const useMyFeature = () => {
  /* ... */
};

// 2. Criar controller principal
export const useMyController = () => {
  /* ... */
};

// 3. Implementar UI
export const MyScreen = () => {
  /* ... */
};
```

### **5. Adicionar Shared Resources**

```typescript
// 1. Estilos centralizados
export const styles = StyleSheet.create({
  /* ... */
});

// 2. Utilitários comuns
export const formatDate = date => {
  /* ... */
};
```

Esta estrutura garante **escalabilidade**, **manutenibilidade** e **testabilidade** em projetos React Native de qualquer tamanho! 🎉
