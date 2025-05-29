import {
  UnicoPermissions,
  UnicoRepository,
} from '@domain/repositories/UnicoRepository';

export const executeCheckPermissions = async (
  unicoRepository: UnicoRepository
): Promise<UnicoPermissions> => {
  return await unicoRepository.checkPermissions();
};

export const createCheckPermissionsUseCase = (
  unicoRepository: UnicoRepository
) => ({
  execute: () => executeCheckPermissions(unicoRepository),
});
