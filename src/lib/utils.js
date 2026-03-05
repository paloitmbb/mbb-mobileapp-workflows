/**
 * Format currency to MYR
 */
export const formatCurrency = (amount) => {
  return `RM ${parseFloat(amount).toFixed(2)}`;
};

/**
 * Format date to DD/MM/YYYY
 */
export const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Mask account number (show last 4 digits)
 */
export const maskAccountNumber = (accountNumber) => {
  if (!accountNumber || accountNumber.length < 4) {
    return accountNumber;
  }
  const last4 = accountNumber.slice(-4);
  const masked = '*'.repeat(accountNumber.length - 4);
  return `${masked}${last4}`;
};
