// Validation Utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const isValidPincode = (pincode: string): boolean => {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
};

export const isValidGST = (gst: string): boolean => {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gst);
};

export const isValidPAN = (pan: string): boolean => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
};

export const isValidAadhar = (aadhar: string): boolean => {
  const aadharRegex = /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/;
  return aadharRegex.test(aadhar.replace(/\s/g, ''));
};

// Business Validation
export const isValidWeight = (weight: number): boolean => {
  return weight > 0 && weight <= 10000; // Max 10kg
};

export const isValidPrice = (price: number): boolean => {
  return price >= 0 && price <= 100000000; // Max 10 crores
};

export const isValidQuantity = (quantity: number): boolean => {
  return Number.isInteger(quantity) && quantity >= 0;
};

export const isValidPurity = (purity: string, metal: string): boolean => {
  const validPurities = {
    Gold: ['24K', '22K', '18K', '14K', '10K'],
    Silver: ['999', '925', '900', '835', '800'],
    Platinum: ['999', '950', '900'],
    Diamond: ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2']
  };
  
  return validPurities[metal as keyof typeof validPurities]?.includes(purity) || false;
};

// Form Validation Helpers
export const validateRequired = (value: any): string | null => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return 'This field is required';
  }
  return null;
};

export const validateMinLength = (value: string, minLength: number): string | null => {
  if (value.length < minLength) {
    return `Minimum ${minLength} characters required`;
  }
  return null;
};

export const validateMaxLength = (value: string, maxLength: number): string | null => {
  if (value.length > maxLength) {
    return `Maximum ${maxLength} characters allowed`;
  }
  return null;
};