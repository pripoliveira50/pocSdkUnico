import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { permissionRepositoryImpl } from '@data/repositories/PermissionRepositoryImpl';
import { unicoRepositoryImpl } from '@data/repositories/UnicoRepositoryImpl';
import { createCheckPermissionsUseCase } from '@domain/usecases/CheckPermissionsUseCase';
import { createRequestPermissionUseCase } from '@domain/usecases/RequestPermissionUseCase';
import { createTestBridgeUseCase } from '@domain/usecases/TestBridgeUseCase';

export const useDiagnostics = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentOperation, setCurrentOperation] = useState('');

  const useCases = useMemo(() => {
    return {
      testBridge: createTestBridgeUseCase(unicoRepositoryImpl),
      checkPermissions: createCheckPermissionsUseCase(unicoRepositoryImpl),
      requestPermission: createRequestPermissionUseCase(
        permissionRepositoryImpl
      ),
    };
  }, []);

  const testBasicBridge = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setCurrentOperation('Testando bridge básica...');

      const result = await useCases.testBridge.execute();
      Alert.alert('Teste Básico', `Bridge OK: ${result}`);
    } catch (error: unknown) {
      Alert.alert('Erro Teste Básico', (error as Error).message);
    } finally {
      setIsLoading(false);
      setCurrentOperation('');
    }
  }, [useCases.testBridge]);

  const checkPermissions = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setCurrentOperation('Verificando permissões...');

      const result = await useCases.checkPermissions.execute();

      if (!result.camera) {
        Alert.alert(
          'Permissão Necessária',
          'Este app precisa de acesso à câmera. Vá em Configurações > Apps > PocUnico > Permissões > Câmera e ative.',
          [
            { text: 'OK' },
            {
              text: 'Ir para Configurações',
              onPress: () => useCases.requestPermission.openSettings(),
            },
          ]
        );
      } else {
        Alert.alert('Permissões', 'Câmera: ✅ Autorizada');
      }
    } catch (error: unknown) {
      Alert.alert('Erro', (error as Error).message);
    } finally {
      setIsLoading(false);
      setCurrentOperation('');
    }
  }, [useCases.checkPermissions, useCases.requestPermission]);

  return {
    isLoading,
    currentOperation,
    testBasicBridge,
    checkPermissions,
  };
};
