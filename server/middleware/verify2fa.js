// server/middleware/verify2fa.js
const { whoami } = require('../services/2faClient');

module.exports = function verify2fa() {
  return async function (req, res, next) {
    try {
      const cookieName = process.env.AUTH_COOKIE_NAME || 'cp_auth';
      const token =
        req.cookies[cookieName] ||
        (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);
      const deviceId = req.headers['x-device-id'];
      if (!token) {
        return res.status(401).json({ error: 'authentication required' });
      }

      // Call microservice to validate token
      const profile = await whoami({ token, deviceId });
      const user = profile.user || profile; // normalize

      // --- ✅ Session expiry check
      const verifiedAt = new Date(user.verifiedAt || 0).getTime();
      const maxAge =
        parseInt(process.env.AUTH_SESSION_MAXAGE || String(15 * 60 * 1000), 10); // default 15 min
      if (Date.now() - verifiedAt > maxAge) {
        return res.status(401).json({ error: 'session expired, please re-verify OTP' });
      }

      // --- ✅ Device binding check
      if (user.deviceId && deviceId && user.deviceId !== deviceId) {
        return res.status(401).json({ error: 'unrecognized device, please re-verify OTP' });
      }

      // Attach user to request for downstream routes
      req.user = user;
      return next();
    } catch (err) {
      console.error('verify2fa failed', err?.response?.data || err.message);
      return res.status(401).json({ error: 'invalid or expired session' });
    }
  };
};
