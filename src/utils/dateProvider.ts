export const DateFormatter = (
  startDate: string,
  endDate: string
): { startDate: Date; endDate: Date } => {
  const parseDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    
    // Attempt standard parsing
    let date = new Date(dateStr);
    
    // If invalid, try DD-MM-YYYY or DD/MM/YYYY
    if (isNaN(date.getTime())) {
      const parts = dateStr.split(/[-/]/);
      if (parts.length === 3) {
        // Assume DD-MM-YYYY
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        date = new Date(year, month, day);
      }
    }
    
    return isNaN(date.getTime()) ? new Date() : date;
  };

  const from = parseDate(startDate);
  const to = parseDate(endDate);

  from.setUTCHours(0, 0, 0, 0);
  to.setUTCHours(23, 59, 59, 999);

  return {
    startDate: from,
    endDate: to,
  };
};
