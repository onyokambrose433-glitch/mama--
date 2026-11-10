export const formatUGX = (amount: number | string | undefined | null): string => {
  if (amount === undefined || amount === null) return 'UGX 0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'UGX 0';
  return `UGX ${Math.round(num).toLocaleString('en-US')}`;
};

export const formatDateTime = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};
