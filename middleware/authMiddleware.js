/* =========================================
   AUTH MIDDLEWARE
========================================= */

/* 🔐 Ensure user is logged in */
function ensureAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/account/login")
  }
  next()
}

/* 🔐 Check user role */
function checkRole(role) {
  return (req, res, next) => {

    if (!req.session.user) {
      return res.redirect("/account/login")
    }

    if (req.session.user.role !== role) {
      return res.status(403).send("Access denied")
    }

    next()
  }
}

module.exports = {
  ensureAuth,
  checkRole
}