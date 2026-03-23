import { useSnackbar, type VariantType } from 'notistack';
import { useCallback, useMemo } from 'react';

export const useToast = () => {
  const { enqueueSnackbar } = useSnackbar();

  const showToast = useCallback((message: string, variant: VariantType = 'default') => {
    enqueueSnackbar(message, { 
      variant,
      anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
      autoHideDuration: variant === 'error' ? 5000 : 3000,
    });
  }, [enqueueSnackbar]);

  return useMemo(() => ({
    success: (msg: string) => showToast(msg, 'success'),
    error: (msg: string) => showToast(msg, 'error'),
    info: (msg: string) => showToast(msg, 'info'),
    warning: (msg: string) => showToast(msg, 'warning'),
    toast: showToast,
  }), [showToast]);
};
