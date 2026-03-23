import { useSnackbar, type VariantType } from 'notistack';

export const useToast = () => {
  const { enqueueSnackbar } = useSnackbar();

  const showToast = (message: string, variant: VariantType = 'default') => {
    enqueueSnackbar(message, { 
      variant,
      anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
      autoHideDuration: variant === 'error' ? 5000 : 3000,
    });
  };

  return {
    success: (msg: string) => showToast(msg, 'success'),
    error: (msg: string) => showToast(msg, 'error'),
    info: (msg: string) => showToast(msg, 'info'),
    warning: (msg: string) => showToast(msg, 'warning'),
    toast: showToast,
  };
};
