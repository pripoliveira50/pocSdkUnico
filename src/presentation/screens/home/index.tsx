import React from 'react';
import {
  Button,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  ActionType,
  DocumentStatus,
  DocumentType,
} from '@domain/entities/DocumentEntity';
import { styles } from '@shared/styles/home';
import { useHomeController } from '../../hooks/useHomeController';

const enum FlowStep {
  SELFIE = 'selfie',
  CNH_FRENTE = 'cnh_frente',
  CNH_VERSO = 'cnh_verso',
  SUBMIT = 'submit',
}

export const HomeScreen: React.FC = () => {
  const {
    state,
    testBasicBridge,
    checkPermissions,
    captureSelfie,
    captureDocument,
    submitBatch,
    checkBatchStatus,
    startGuidedFlow,
    cancelGuidedFlow,
    executeCurrentGuidedStep,
    removeItem,
    clearAll,
    getStatusIcon,
    isCurrentStepCompleted,
  } = useHomeController();

  const canExecuteCurrentStep = (): boolean => {
    const step = state.guidedFlow?.getCurrentStep();
    if (!step) return false;

    if (step.id === FlowStep.SUBMIT) {
      const hasSelfie = state.capturedItems.some(
        item => item.type === ActionType.SELFIE
      );
      const hasCnhFrente = state.capturedItems.some(
        item => item.documentType === DocumentType.CNH_FRENTE
      );
      const hasCnhVerso = state.capturedItems.some(
        item => item.documentType === DocumentType.CNH_VERSO
      );
      return hasSelfie && hasCnhFrente && hasCnhVerso;
    }

    return true;
  };

  const getFlowProgress = () => {
    if (!state.guidedFlow) return { current: 0, total: 0, percentage: 0 };

    const total = state.guidedFlow.steps.length;
    const current = state.guidedFlow.currentStep + 1;
    const percentage = (current / total) * 100;

    return { current, total, percentage };
  };

  const flowProgress = getFlowProgress();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>📦 Unico SDK Bridge</Text>
        <Text style={styles.subtitle}>
          Capture tudo primeiro, envie depois!
        </Text>

        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>🔧 Testes e Diagnósticos</Text>
          <View style={styles.buttonRow}>
            <Button
              title='🔍 Teste Bridge'
              onPress={testBasicBridge}
              disabled={state.isLoading}
            />
            <Button
              title='📷 Permissões'
              onPress={checkPermissions}
              disabled={state.isLoading}
            />
          </View>
        </View>

        {!state.isGuidedFlowActive ? (
          <View style={styles.guidedFlowSection}>
            <Text style={styles.sectionTitle}>🎯 Fluxo Guiado Real</Text>
            <Text style={styles.guidedDescription}>
              Simule um fluxo real: Selfie → CNH Frente → CNH Verso → Envio
            </Text>
            <Button
              title='🚀 Iniciar Fluxo Guiado'
              onPress={startGuidedFlow}
              disabled={state.isLoading}
              color={styles.guidedDescription.color}
            />
          </View>
        ) : (
          <View style={styles.guidedFlowActive}>
            <View style={styles.guidedHeader}>
              <Text style={styles.guidedTitle}>🎯 Fluxo Guiado Ativo</Text>
              <TouchableOpacity
                onPress={cancelGuidedFlow}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>❌ Cancelar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Passo {flowProgress.current} de {flowProgress.total}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${flowProgress.percentage}%`,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.currentStepContainer}>
              <Text style={styles.stepIcon}>
                {state.guidedFlow?.getCurrentStep()?.icon || '❓'}
              </Text>
              <Text style={styles.stepTitle}>
                {state.guidedFlow?.getCurrentStep()?.title ||
                  'Passo desconhecido'}
              </Text>
              <Text style={styles.stepDescription}>
                {state.guidedFlow?.getCurrentStep()?.description ||
                  'Descrição não disponível'}
              </Text>

              {isCurrentStepCompleted() ? (
                <View style={styles.stepCompleted}>
                  <Text style={styles.stepCompletedText}>
                    ✅ Passo concluído!
                  </Text>
                  {state.guidedFlow?.isLastStep() &&
                    state.batchResponse?.success && (
                      <Text
                        style={[styles.stepCompletedText, { marginTop: 10 }]}
                      >
                        🎉 Fluxo finalizado com sucesso!
                      </Text>
                    )}
                </View>
              ) : (
                <Button
                  title={`${state.guidedFlow?.getCurrentStep()?.icon} ${state.guidedFlow?.getCurrentStep()?.title}`}
                  onPress={executeCurrentGuidedStep}
                  disabled={state.isLoading || !canExecuteCurrentStep()}
                  color={styles.progressFill.backgroundColor}
                />
              )}

              {state.guidedFlow?.getCurrentStep()?.id === 'submit' &&
                !canExecuteCurrentStep() && (
                  <View
                    style={[
                      styles.stepCompleted,
                      {
                        backgroundColor: '#fff3cd',
                        marginTop: 10,
                        padding: 10,
                        borderRadius: 5,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.stepCompletedText, { color: '#856404' }]}
                    >
                      ⚠️ Complete todos os passos:
                    </Text>
                    <Text
                      style={[
                        styles.stepCompletedText,
                        { color: '#856404', fontSize: 12 },
                      ]}
                    >
                      {state.capturedItems.some(
                        item => item.type === ActionType.SELFIE
                      )
                        ? '✅'
                        : '❌'}{' '}
                      Selfie{'\n'}
                      {state.capturedItems.some(
                        item => item.documentType === DocumentType.CNH_FRENTE
                      )
                        ? '✅'
                        : '❌'}{' '}
                      CNH Frente{'\n'}
                      {state.capturedItems.some(
                        item => item.documentType === DocumentType.CNH_VERSO
                      )
                        ? '✅'
                        : '❌'}{' '}
                      CNH Verso
                    </Text>
                  </View>
                )}
            </View>

            {state.capturedItems.length > 0 && (
              <View style={styles.guidedSubmitSection}>
                <Text style={styles.guidedSubmitTitle}>
                  📋 Itens Capturados ({state.capturedItems.length}/3)
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    marginBottom: 10,
                  }}
                >
                  {[
                    FlowStep.SELFIE,
                    FlowStep.CNH_FRENTE,
                    FlowStep.CNH_VERSO,
                  ].map((itemName, index) => {
                    const captured = state.capturedItems.some(item => {
                      if (itemName === FlowStep.SELFIE)
                        return item.type === ActionType.SELFIE;
                      if (itemName === FlowStep.CNH_FRENTE)
                        return item.documentType === DocumentType.CNH_FRENTE;
                      if (itemName === FlowStep.CNH_VERSO)
                        return item.documentType === DocumentType.CNH_VERSO;
                      return false;
                    });

                    return (
                      <Text
                        key={index}
                        style={[
                          styles.stepCompletedText,
                          {
                            color: captured ? '#4caf50' : '#666',
                            fontSize: 12,
                          },
                        ]}
                      >
                        {captured ? '✅' : '⏳'} {itemName}
                      </Text>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        )}

        {!state.isGuidedFlowActive && (
          <View style={styles.captureSection}>
            <Text style={styles.sectionTitle}>📸 Capturar Imagens</Text>
            <View style={styles.buttonRow}>
              <Button
                title={`🤳 ${FlowStep.SELFIE}`}
                onPress={captureSelfie}
                disabled={state.isLoading}
              />
              <Button
                title={`🪪 ${FlowStep.CNH_FRENTE}`}
                onPress={() => captureDocument(DocumentType.CNH_FRENTE)}
                disabled={state.isLoading}
              />
            </View>
            <View style={styles.buttonRow}>
              <Button
                title={`🔄 ${FlowStep.CNH_VERSO}`}
                onPress={() => captureDocument(DocumentType.CNH_VERSO)}
                disabled={state.isLoading}
              />
            </View>
          </View>
        )}

        {state.capturedItems.length > 0 && (
          <View style={styles.collectionSection}>
            <Text style={styles.sectionTitle}>
              📋 Itens Capturados ({state.capturedItems.length})
            </Text>
            {state.capturedItems.map(item => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>
                    {getStatusIcon(item.status)}{' '}
                    {item.type === ActionType.SELFIE
                      ? FlowStep.SELFIE
                      : item.documentType}
                  </Text>
                  {!state.isGuidedFlowActive && (
                    <TouchableOpacity
                      onPress={() => removeItem(item.id)}
                      style={styles.removeButton}
                      disabled={item.status === DocumentStatus.SENDING}
                    >
                      <Text style={styles.removeButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.itemInfo}>
                  Capturado: {new Date(item.timestamp).toLocaleTimeString()}
                </Text>
                <Text style={styles.itemInfo}>Status: {item.status}</Text>
                {item.result.base64 && (
                  <Image
                    source={{
                      uri: `data:image/jpeg;base64,${item.result.base64}`,
                    }}
                    style={styles.thumbnail}
                    resizeMode='cover'
                  />
                )}
              </View>
            ))}
          </View>
        )}

        {!state.isGuidedFlowActive && (
          <View style={styles.batchActions}>
            <Button
              title={`📤 Enviar Lote (${state.capturedItems.length} itens)`}
              onPress={submitBatch}
              disabled={state.isLoading || state.capturedItems.length === 0}
              color={styles.stepCompletedText.color}
            />

            {state.batchResponse?.batchId && (
              <Button
                title='🔍 Verificar Status'
                onPress={() => checkBatchStatus(state.batchResponse!.batchId!)}
                disabled={state.isLoading}
                color={styles.loadingText.color}
              />
            )}

            {(state.capturedItems.length > 0 || state.batchResponse) && (
              <Button
                title='🗑️ Limpar Tudo'
                onPress={clearAll}
                color={styles.cancelButtonText.color}
              />
            )}
          </View>
        )}

        {state.isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{state.currentOperation}</Text>
          </View>
        )}

        {state.batchResponse && (
          <View style={styles.responseContainer}>
            <Text style={styles.responseTitle}>
              {state.batchResponse.success ? '✅' : '❌'} Resposta do Backend
            </Text>
            <Text style={styles.responseText}>
              Mensagem: {state.batchResponse.message}
            </Text>
            {state.batchResponse.batchId && (
              <Text style={styles.responseText}>
                Batch ID: {state.batchResponse.batchId}
              </Text>
            )}
          </View>
        )}

        {state.batchStatus && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusTitle}>📊 Status da Verificação</Text>
            <Text style={styles.statusText}>
              Status Geral: {state.batchStatus.overallStatus.toUpperCase()}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
