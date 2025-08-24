export const formatCurrency = (amount: string | number): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `₹${num.toLocaleString('en-IN')}`;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN');
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-IN');
};

export const calculateTotal = (items: Array<{ qty: string; rate: string }>): number => {
  return items.reduce((sum, item) => {
    const qty = parseFloat(item.qty) || 0;
    const rate = parseFloat(item.rate) || 0;
    return sum + (qty * rate);
  }, 0);
};