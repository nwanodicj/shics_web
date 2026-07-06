/* =========================================
   UTILITIES INDEX FILE
   - Shared helper functions
========================================= */

const utilities = {};

/* ===============================
   BUILD NAVIGATION (TEMP VERSION)
================================ */
utilities.getNav = async function () {
  // For now, return simple navigation
  // Later we will make it dynamic
  return `
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/account/login">Login</a></li>
      <li><a href="/account/register">Register</a></li>
    </ul>
  `;
};

utilities.handleErrors = function (fn) {
  return async function (req, res, next) {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

module.exports = utilities;