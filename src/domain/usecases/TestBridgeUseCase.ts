import { UnicoRepository } from '@domain/repositories/UnicoRepository';

export const executeTestBridge = async (
  unicoRepository: UnicoRepository
): Promise<string> => {
  return await unicoRepository.testConnection();
};

export const createTestBridgeUseCase = (unicoRepository: UnicoRepository) => ({
  execute: () => executeTestBridge(unicoRepository),
});
