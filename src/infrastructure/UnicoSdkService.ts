import { DocumentType, UnicoResult } from '@domain/entities/DocumentEntity';
import { NativeEventEmitter, NativeModules } from 'react-native';

export type UnicoPermissions = {
  camera: boolean;
};

export type CaptureResult = {
  success: boolean;
  data?: UnicoResult;
  error?: string;
};

const { UnicoSdk: UnicoSdkModule } = NativeModules;

if (!UnicoSdkModule) {
  throw new Error(
    'UnicoSdkModule não foi carregado. Verifique a implementação nativa.'
  );
}

const unicoEventEmitter = new NativeEventEmitter(UnicoSdkModule);

export const testConnection = (): Promise<string> => {
  return UnicoSdkModule.testConnection();
};

export const checkPermissions = (): Promise<UnicoPermissions> => {
  return UnicoSdkModule.checkPermissions();
};

export const captureSelfie = (): Promise<UnicoResult> => {
  return UnicoSdkModule.captureSelfie();
};

export const captureDocument = (
  documentType: DocumentType
): Promise<UnicoResult> => {
  return UnicoSdkModule.captureDocument(documentType);
};

export const addEventListener = (
  eventName: string,
  callback: (event: unknown) => void
): (() => void) => {
  const subscription = unicoEventEmitter.addListener(eventName, callback);
  return () => subscription.remove();
};

export const removeEventListener = (eventName?: string): void => {
  if (eventName) {
    unicoEventEmitter.removeAllListeners(eventName);
  }
};

export const ensureCameraPermission = async (): Promise<boolean> => {
  try {
    const permissions = await checkPermissions();
    return permissions.camera;
  } catch (error) {
    console.error('Erro ao verificar permissões:', error);
    return false;
  }
};

export const captureSelfieWithPermissionCheck =
  async (): Promise<CaptureResult> => {
    try {
      const hasPermission = await ensureCameraPermission();

      if (!hasPermission) {
        return {
          success: false,
          error:
            'Permissão de câmera necessária. Vá em Configurações > Privacidade > Câmera',
        };
      }

      const data = await captureSelfie();
      return { success: true, data };
    } catch (error: unknown) {
      return {
        success: false,
        error: (error as Error).message || 'Erro desconhecido na captura',
      };
    }
  };

export const captureDocumentWithPermissionCheck = async (
  documentType: DocumentType
): Promise<CaptureResult> => {
  try {
    const hasPermission = await ensureCameraPermission();

    if (!hasPermission) {
      return {
        success: false,
        error:
          'Permissão de câmera necessária. Vá em Configurações > Privacidade > Câmera',
      };
    }

    const data = await captureDocument(documentType);
    return { success: true, data };
  } catch (error: unknown) {
    return {
      success: false,
      error: (error as Error).message || 'Erro desconhecido na captura',
    };
  }
};

export { UnicoSdkModule };
