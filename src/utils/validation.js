export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());

export const EMAIL_ERROR = 'Format email belum benar. Contoh: nama@email.com';

export const MIN_PASSWORD = 10;
