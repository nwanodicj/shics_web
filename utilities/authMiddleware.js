/* =========================================
   AUTHENTICATION & ROLE MIDDLEWARE
========================================= */

/* ===============================
   CHECK IF USER IS LOGGED IN
================================ */
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/account/login");
  }
  next();
}

/* ===============================
   CHECK USER ROLE
================================ */
function requireRole(role) {
  return function (req, res, next) {

    if (!req.session.user) {
      return res.redirect("/account/login");
    }

    if (req.session.user.role !== role) {
      return res.send("Access denied ❌");
    }

    next();
  };
}

module.exports = {
  requireLogin,
  requireRole
};