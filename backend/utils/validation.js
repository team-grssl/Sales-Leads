function validationError(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function requireFields(payload, fields) {
  for (const field of fields) {
    const value = payload[field];
    if (value === undefined || value === null || String(value).trim() === '') {
      throw validationError(`${field} is required.`);
    }
  }
}

function ensureEmail(value, fieldName = 'email') {
  if (!value) {
    return;
  }
  const email = String(value).trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw validationError(`${fieldName} must be a valid email address.`);
  }
}

function ensurePhone(value, fieldName = 'phone') {
  if (!value) {
    return;
  }
  const digits = String(value).replace(/[^\d+]/g, '');
  if (digits.length < 8) {
    throw validationError(`${fieldName} must be a valid phone number.`);
  }
}

function ensurePositiveNumber(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    return;
  }
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    throw validationError(`${fieldName} must be a valid non-negative number.`);
  }
}

module.exports = {
  validationError,
  requireFields,
  ensureEmail,
  ensurePhone,
  ensurePositiveNumber
};

