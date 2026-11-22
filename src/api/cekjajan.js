import { request } from './client';
import { USE_MOCK } from '../config';
import * as mock from './mock';

// Profil anak dari API -> bentuk yang dipakai aplikasi.
const toChild = (c) => ({ id: c.id, name: c.nama_panggilan, age: c.usia_tahun });

const real_apiRegister = (nama, email, password) =>
  request('/auth/register', { method: 'POST', body: { nama, email, password } });

const real_apiLogin = (email, password) =>
  request('/auth/login', { method: 'POST', body: { email, password } });

const real_apiListChildren = async (token) => {
  const res = await request('/children', { token });
  return res.items.map(toChild);
};

const real_apiCreateChild = async (token, name, age) =>
  toChild(
    await request('/children', {
      method: 'POST',
      token,
      body: { nama_panggilan: name, usia_tahun: age },
    }),
  );

const real_apiDailyQuota = (token, childId) => request(`/children/${childId}/daily-quota`, { token });

const real_apiListConsumptions = async (token, childId, date) => {
  const res = await request(`/children/${childId}/consumptions`, { token, query: { date } });
  return res.items;
};

const real_apiCreateConsumption = (token, childId, productId, servings) =>
  request(`/children/${childId}/consumptions`, {
    method: 'POST',
    token,
    body: { product_id: productId, jumlah_sajian: servings },
  });

const real_apiCreateProduct = (token, product) =>
  request('/products', { method: 'POST', token, body: product });

// body: { barcode } atau { nutrisi }, plus jumlah_sajian dan child_id
const real_apiAssess = (token, body) => request('/assessments', { method: 'POST', token, body });

// Mode demo (EXPO_PUBLIC_USE_MOCK=true) memakai data contoh tanpa backend.
export const apiRegister = USE_MOCK ? mock.apiRegister : real_apiRegister;
export const apiLogin = USE_MOCK ? mock.apiLogin : real_apiLogin;
export const apiListChildren = USE_MOCK ? mock.apiListChildren : real_apiListChildren;
export const apiCreateChild = USE_MOCK ? mock.apiCreateChild : real_apiCreateChild;
export const apiDailyQuota = USE_MOCK ? mock.apiDailyQuota : real_apiDailyQuota;
export const apiListConsumptions = USE_MOCK ? mock.apiListConsumptions : real_apiListConsumptions;
export const apiCreateConsumption = USE_MOCK ? mock.apiCreateConsumption : real_apiCreateConsumption;
export const apiCreateProduct = USE_MOCK ? mock.apiCreateProduct : real_apiCreateProduct;
export const apiAssess = USE_MOCK ? mock.apiAssess : real_apiAssess;
