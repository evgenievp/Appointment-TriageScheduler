import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Този файл се внася само динамично, от main.jsx, и само в dev — иначе целият
// MSW влиза в продукционния bundle (над 400 kB на вятъра).
export const worker = setupWorker(...handlers);
