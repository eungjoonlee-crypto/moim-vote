import { useEffect, useRef } from 'react';
import { startPeriodicSync } from '@/lib/youtube-api';

/**
 * 자동 동기화 훅
 * 주기적으로 YouTube 데이터를 동기화합니다.
 */
export const useAutoSync = (intervalMinutes: number = 60, enabled: boolean = true) => {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (enabled) {
      // 자동 동기화 시작
      cleanupRef.current = startPeriodicSync(intervalMinutes);
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [intervalMinutes, enabled]);

  return {
    isEnabled: enabled,
    intervalMinutes
  };
};
