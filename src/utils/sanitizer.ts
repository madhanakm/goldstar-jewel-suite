// Input sanitization utilities
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input.replace(/[\r\n\t]/g, ' ').trim();
};

export const sanitizeForLog = (input: any): string => {
  if (typeof input !== 'string') {
    input = JSON.stringify(input);
  }
  return sanitizeInput(input);
};

export const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

export const validateInput = (input: string, maxLength = 1000): boolean => {
  return input && input.length <= maxLength && !/[<>'"&]/.test(input);
};