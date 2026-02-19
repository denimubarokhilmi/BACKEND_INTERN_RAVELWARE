const VALID_MONTH_NAMES = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

const validateQueryParams = (month, year) => {
  const hasMonth = month !== undefined && month !== "";
  const hasYear = year !== undefined && year !== "";

  if (!hasMonth && !hasYear) return null;

  if (hasMonth && !hasYear) {
    return {
      status: 400,
      message: "Parameter 'year' wajib diisi jika menggunakan filter bulan.",
    };
  }
  if (!hasMonth && hasYear) {
    return {
      status: 400,
      message: "Parameter 'month' wajib diisi jika menggunakan filter tahun.",
    };
  }

  const key = month.toLowerCase().substring(0, 3);
  const isValidMonthName = VALID_MONTH_NAMES.includes(key) && month.length >= 3;
  const isValidMonthNum =
    /^\d{1,2}$/.test(month) && parseInt(month) >= 1 && parseInt(month) <= 12;

  if (!isValidMonthName && !isValidMonthNum) {
    return {
      status: 400,
      message: `Format 'month' tidak valid: "${month}". Gunakan format seperti: jan, feb, mar, ... atau angka 1-12.`,
    };
  }

  const yearNum = parseInt(year);
  if (isNaN(yearNum) || !/^\d{4}$/.test(year)) {
    return {
      status: 400,
      message: `Format 'year' tidak valid: "${year}". Gunakan format 4 digit, contoh: 2026.`,
    };
  }

  return null;
};

export default { validateQueryParams };
