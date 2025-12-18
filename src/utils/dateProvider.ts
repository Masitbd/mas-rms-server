export const DateFormatter = (
  startDate: string,
  endDate: string
): { startDate: Date; endDate: Date } => {
  const from = new Date(startDate ?? new Date());
  const to = new Date(endDate ?? new Date());
  from.setUTCHours(0, 0, 0, 0);
  to.setUTCHours(23, 59, 59, 999);

  return {
    startDate: from,
    endDate: to,
  };
};
