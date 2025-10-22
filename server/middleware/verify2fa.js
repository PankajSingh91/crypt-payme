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

      // Validate token with 2FA microservice
      const profile = await whoami({ token, deviceId });
      const user = profile.user || profile; // normalize structure

      // --- ✅ Handle missing or old verifiedAt gracefully
      const verifiedAt = user.verifiedAt ? new Date(user.verifiedAt).getTime() : Date.now();
      const maxAge = parseInt(process.env.AUTH_SESSION_MAXAGE || String(15 * 60 * 1000), 10); // default 15 min

      if (Date.now() - verifiedAt > maxAge) {
        console.warn('Session expired for user', user.email || user.id);
        return res.status(401).json({ error: 'session expired, please re-verify OTP' });
      }

      // --- ✅ Device binding check (only if both are present)
      if (user.deviceId && deviceId && user.deviceId !== deviceId) {
        return res.status(401).json({ error: 'unrecognized device, please re-verify OTP' });
      }

      // Attach user object to the request
      req.user = user;
      return next();
    } catch (err) {
      console.error('verify2fa failed:', err?.response?.data || err.message);
      return res.status(401).json({ error: 'invalid or expired session' });
    }
  };
};
