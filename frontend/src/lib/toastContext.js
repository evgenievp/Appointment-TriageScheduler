import { createContext, useContext } from 'react';

// Контекстът стои отделно от компонента, за да не смесва един файл компонент
// и hook — иначе react-refresh се оплаква и HMR губи състояние.
export const ToastContext = createContext(() => {});

/** showToast({ tone, title, message }) */
export const useToast = () => useContext(ToastContext);
