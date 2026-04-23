function parseDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getFiscalYearStart(input = new Date()) {
  const date = parseDate(input) || new Date();
  const year = date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;
  return new Date(Date.UTC(year, 3, 1, 0, 0, 0, 0));
}

function getFiscalYearNumber(input = new Date()) {
  return getFiscalYearStart(input).getUTCFullYear();
}

function getFiscalYearEnd(input = new Date()) {
  const start = getFiscalYearStart(input);
  return new Date(Date.UTC(start.getUTCFullYear() + 1, 2, 31, 23, 59, 59, 999));
}

function getFiscalQuarter(input = new Date()) {
  const date = parseDate(input) || new Date();
  const month = date.getUTCMonth();
  if (month >= 3 && month <= 5) return 'Q1';
  if (month >= 6 && month <= 8) return 'Q2';
  if (month >= 9 && month <= 11) return 'Q3';
  return 'Q4';
}

function getFiscalQuarterMonths(input = new Date()) {
  const fiscalYear = getFiscalYearNumber(input);
  const quarter = getFiscalQuarter(input);
  if (quarter === 'Q1') {
    return [
      { label: 'Apr', month: 3, year: fiscalYear },
      { label: 'May', month: 4, year: fiscalYear },
      { label: 'Jun', month: 5, year: fiscalYear }
    ];
  }
  if (quarter === 'Q2') {
    return [
      { label: 'Jul', month: 6, year: fiscalYear },
      { label: 'Aug', month: 7, year: fiscalYear },
      { label: 'Sep', month: 8, year: fiscalYear }
    ];
  }
  if (quarter === 'Q3') {
    return [
      { label: 'Oct', month: 9, year: fiscalYear },
      { label: 'Nov', month: 10, year: fiscalYear },
      { label: 'Dec', month: 11, year: fiscalYear }
    ];
  }
  return [
    { label: 'Jan', month: 0, year: fiscalYear + 1 },
    { label: 'Feb', month: 1, year: fiscalYear + 1 },
    { label: 'Mar', month: 2, year: fiscalYear + 1 }
  ];
}

function getFiscalQuarterRange(input = new Date()) {
  const months = getFiscalQuarterMonths(input);
  const start = new Date(Date.UTC(months[0].year, months[0].month, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(months[2].year, months[2].month + 1, 0, 23, 59, 59, 999));
  return { start, end };
}

function inRange(value, from, to) {
  const date = parseDate(value);
  const fromDate = from ? parseDate(from) : null;
  const toDate = to ? parseDate(to) : null;
  if (!date) {
    return false;
  }
  if (fromDate && date < fromDate) {
    return false;
  }
  if (toDate && date > toDate) {
    return false;
  }
  return true;
}

module.exports = {
  parseDate,
  getFiscalYearStart,
  getFiscalYearNumber,
  getFiscalYearEnd,
  getFiscalQuarter,
  getFiscalQuarterMonths,
  getFiscalQuarterRange,
  inRange
};

