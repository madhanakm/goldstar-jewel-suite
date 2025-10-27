// Input sanitization utilities
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input.replace(/[\r\n\t<>"'&]/g, ' ').trim();
};

export const sanitizeForLog = (input: any): string => {
  if (typeof input !== 'string') {
    input = String(input);
  }
  return input.replace(/[\r\n\t<>"'&]/g, '_').substring(0, 500);
};

export const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

export const validateInput = (input: string, maxLength = 1000): boolean => {
  return input && input.length <= maxLength && !/[<>"'&\r\n\t]/.test(input);
};

export const sanitizeQueryParam = (param: any): string => {
  if (typeof param !== 'string') return '';
  return param.replace(/[^a-zA-Z0-9\-_]/g, '');
};

export const createSecureLogger = () => {
  return {
    log: (message: string, data?: any) => {
      const sanitizedMessage = sanitizeForLog(message);
      const sanitizedData = data ? sanitizeForLog(data) : '';
      console.log(`[LOG] ${sanitizedMessage}`, sanitizedData);
    },
    error: (message: string, error?: any) => {
      const sanitizedMessage = sanitizeForLog(message);
      const sanitizedError = error ? sanitizeForLog(error.message || error) : '';
      console.error(`[ERROR] ${sanitizedMessage}`, sanitizedError);
    }
  };
};

export const secureLogger = createSecureLogger();