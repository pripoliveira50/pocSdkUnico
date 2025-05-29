import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { unicoRepositoryImpl } from '@data/repositories/UnicoRepositoryImpl';
import { CapturedItem, DocumentType } from '@domain/entities/DocumentEntity';
import { createCaptureDocumentUseCase } from '@domain/usecases/CaptureDocumentUseCase';
import { createCaptureSelfieUseCase } from '@domain/usecases/CaptureSelfieUseCase';
import { usePermissions } from './usePermissions';

export const useCapture = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentOperation, setCurrentOperation] = useState('');

  const { requestPermissionOrRedirect } = usePermissions();

  const useCases = useMemo(() => {
    return {
      captureSelfie: createCaptureSelfieUseCase(unicoRepositoryImpl),
      captureDocument: createCaptureDocumentUseCase(unicoRepositoryImpl),
    };
  }, []);

  const captureSelfie = useCallback(async (): Promise<CapturedItem | null> => {
    try {
      const granted = await requestPermissionOrRedirect();
      if (!granted) return null;

      setIsLoading(true);
      setCurrentOperation('Capturando selfie...');

      const newItem = await useCases.captureSelfie.execute();

      Alert.alert('✅ Sucesso', 'Selfie capturada e adicionada à coleção!');
      return newItem;
    } catch (error: unknown) {
      console.error('❌ Erro captura selfie:', error);
      Alert.alert('Erro', (error as Error).message);
      return null;
    } finally {
      setIsLoading(false);
      setCurrentOperation('');
    }
  }, [requestPermissionOrRedirect, useCases.captureSelfie]);

  const captureDocument = useCallback(
    async (docType: DocumentType): Promise<CapturedItem | null> => {
      try {
        const granted = await requestPermissionOrRedirect();
        if (!granted) return null;

        setIsLoading(true);
        setCurrentOperation(`Capturando ${docType}...`);

        const newItem = await useCases.captureDocument.execute(docType);

        Alert.alert(
          '✅ Sucesso',
          `${docType} capturado e adicionado à coleção!`
        );
        return newItem;
      } catch (error: unknown) {
        Alert.alert('Erro', (error as Error).message);
        return null;
      } finally {
        setIsLoading(false);
        setCurrentOperation('');
      }
    },
    [requestPermissionOrRedirect, useCases.captureDocument]
  );

  return {
    isLoading,
    currentOperation,
    captureSelfie,
    captureDocument,
  };
};
