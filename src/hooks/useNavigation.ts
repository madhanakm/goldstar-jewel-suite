import { useCallback } from 'react';

export const useNavigation = () => {
  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback to dashboard if no history
      window.location.href = '/';
    }
  }, []);

  return { goBack };
};