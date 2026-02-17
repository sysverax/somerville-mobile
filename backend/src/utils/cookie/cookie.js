const { NODE_ENV, COOKIE_CONFIG } = require("../../config/envConfig");
/**
 * Generates the cookie name based on environment and user role.
 */
const name = (userRole) => {
  const ENV = NODE_ENV;
  return `${ENV}_somerville_${userRole}`;
};

/**
 * Sets a cookie in the response with appropriate options according to environment.
 *
 * @param {import('express').Response} res
 * @param {string} userRole
 * @param {string} value
 * @param {Object} options
 */
const setCookie = (res, userRole, value, options = {}) => {
  const COOKIE_EXPIRY_DURATION = COOKIE_CONFIG.EXPIRY_DURATION_IN_MS;
  const defaultOptions = {
    httpOnly: true,
    secure: NODE_ENV === "dev" ? false : true,
    sameSite: NODE_ENV === "dev" ? "Strict" : "None",
    path: "/",
    maxAge: Number(COOKIE_EXPIRY_DURATION),
  };
  const cookieOptions = { ...defaultOptions, ...options };
  res.cookie(name(userRole), value, cookieOptions);
};

/**
 * Clears a cookie in the response based on environment and user role.
 *
 * @param {import('express').Response} res
 * @param {string} userRole
 */
const clearCookie = (res, userRole) => {
  res.clearCookie(name(userRole), { path: "/" });
};

/** Finds and returns the cookie token value from the request based on environment and user role.
 *
 * @param {import('express').Request} req
 * @param {string} userRole
 * @returns {string|null} The token value from the cookie, or null if not found.
 */
const getTokenFromCookies = (cookies, userRole) => {
  return cookies ? cookies[name(userRole)] : null;
};

module.exports = {
  setCookie,
  clearCookie,
  getTokenFromCookies,
};
