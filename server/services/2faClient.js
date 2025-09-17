// server/services/2faClient.js
const axios = require('axios');

const TWO_FA_URL = process.env.TWO_FA_URL || 'http://localhost:5001'; // 2FA microservice base

async function requestOtp({ email, deviceId, userAgent }) {
  const resp = await axios.post(`${TWO_FA_URL}/api/auth/request-otp`, { email, deviceId, userAgent });
  return resp.data;
}

async function verifyOtp({ email, otp, deviceId, userAgent }) {
  const resp = await axios.post(`${TWO_FA_URL}/api/auth/verify-otp`, { email, otp, deviceId, userAgent });
  return resp.data; // expected: { authToken, refreshToken, user }
}

async function whoami({ token, deviceId }) {
  const resp = await axios.get(`${TWO_FA_URL}/api/auth/whoami`, {
    headers: { Authorization: token ? `Bearer ${token}` : undefined, 'x-device-id': deviceId }
  });
  return resp.data;
}

async function logout({ token, deviceId }) {
  try {
    const resp = await axios.post(`${TWO_FA_URL}/api/auth/logout`, {}, {
      headers: { Authorization: token ? `Bearer ${token}` : undefined, 'x-device-id': deviceId }
    });
    return resp.data;
  } catch (e) {
    return null;
  }
}

/**
 * Ask the 2FA microservice to add a wallet to the given email's profile.
 * Body: { email, wallet } (wallet should be checksum/lowercase string)
 * Requires authentication? If your 2FA endpoint expects bearer, adapt accordingly.
 */
async function addWalletToUser({ email, wallet, token, deviceId } = {}) {
  // If the 2FA microservice exposes a protected endpoint /api/wallets/add that expects
  // Authorization header, pass token. Otherwise it may accept email+wallet directly.
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (deviceId) headers['x-device-id'] = deviceId;

  const resp = await axios.post(`${TWO_FA_URL}/api/wallets/add`, { email, wallet }, { headers });
  return resp.data; // expected: { ok: true, user: {...} }
}

module.exports = {
  requestOtp,
  verifyOtp,
  whoami,
  logout,
  addWalletToUser
};
