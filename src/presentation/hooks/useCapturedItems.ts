import { useCallback, useMemo, useState } from 'react';

import {
  ActionType,
  CapturedItem,
  DocumentStatus,
  DocumentType,
} from '@domain/entities/DocumentEntity';

export const useCapturedItems = () => {
  const [capturedItems, setCapturedItems] = useState<CapturedItem[]>([]);

  const statusIconMap: Record<DocumentStatus, string> = useMemo(
    () => ({
      [DocumentStatus.CAPTURED]: '📸',
      [DocumentStatus.SENDING]: '⏳',
      [DocumentStatus.SENT]: '✅',
      [DocumentStatus.ERROR]: '❌',
    }),
    []
  );

  const addItem = useCallback((newItem: CapturedItem): void => {
    setCapturedItems(prevItems => {
      const filteredItems = prevItems.filter(item => {
        if (newItem.type === ActionType.SELFIE) {
          return item.type !== ActionType.SELFIE;
        }
        if (newItem.type === ActionType.DOCUMENT) {
          return !(
            item.type === ActionType.DOCUMENT &&
            item.documentType === newItem.documentType
          );
        }
        return true;
      });

      return [...filteredItems, newItem];
    });
  }, []);

  const removeItem = useCallback((itemId: string): void => {
    setCapturedItems(prevItems => prevItems.filter(item => item.id !== itemId));
  }, []);

  const updateItemsStatus = useCallback((status: DocumentStatus): void => {
    setCapturedItems(prevItems => prevItems.map(item => ({ ...item, status })));
  }, []);

  const clearItems = useCallback((): void => {
    setCapturedItems([]);
  }, []);

  const getStatusIcon = useCallback(
    (status: CapturedItem['status']): string => {
      return statusIconMap[status as DocumentStatus] || '❓';
    },
    [statusIconMap]
  );

  const hasSelfie = useMemo(
    () => capturedItems.some(item => item.type === ActionType.SELFIE),
    [capturedItems]
  );

  const hasDocument = useCallback(
    (docType: DocumentType): boolean =>
      capturedItems.some(item => item.documentType === docType),
    [capturedItems]
  );

  const getItemsCount = useMemo(() => capturedItems.length, [capturedItems]);

  return {
    capturedItems,
    addItem,
    removeItem,
    updateItemsStatus,
    clearItems,
    getStatusIcon,
    hasSelfie,
    hasDocument,
    getItemsCount,
  };
};
