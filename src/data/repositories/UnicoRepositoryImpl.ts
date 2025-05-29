import { DocumentType } from '@domain/entities/DocumentEntity';
import {
  CaptureResult,
  UnicoPermissions,
  UnicoRepository,
} from '@domain/repositories/UnicoRepository';
import {
  captureDocumentWithPermissionCheck,
  captureSelfieWithPermissionCheck,
  checkPermissions,
  testConnection,
} from '@infrastructure/UnicoSdkService';

const testConnectionImpl = async (): Promise<string> => {
  return await testConnection();
};

const checkPermissionsImpl = async (): Promise<UnicoPermissions> => {
  return await checkPermissions();
};

const captureSelfieImpl = async (): Promise<CaptureResult> => {
  return await captureSelfieWithPermissionCheck();
};

const captureDocumentImpl = async (
  documentType: DocumentType
): Promise<CaptureResult> => {
  return await captureDocumentWithPermissionCheck(documentType);
};

const ensureCameraPermissionImpl = async (): Promise<boolean> => {
  try {
    const permissions = await checkPermissionsImpl();
    return permissions.camera;
  } catch (error) {
    console.error('Erro ao verificar permissões:', error);
    return false;
  }
};

export const unicoRepositoryImpl: UnicoRepository = {
  testConnection: testConnectionImpl,
  checkPermissions: checkPermissionsImpl,
  captureSelfie: captureSelfieImpl,
  captureDocument: captureDocumentImpl,
  ensureCameraPermission: ensureCameraPermissionImpl,
};

export {
  captureDocumentImpl as captureDocument,
  captureSelfieImpl as captureSelfie,
  checkPermissionsImpl as checkPermissions,
  ensureCameraPermissionImpl as ensureCameraPermission,
  testConnectionImpl as testConnection,
};
