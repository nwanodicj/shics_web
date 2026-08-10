// AUTO-COMMENT: File Overview - routes/accountRoute.js
// Purpose: Routing layer: endpoint definitions and middleware wiring.
const express = require("express")
const router = express.Router()

const accountController = require("../controllers/accountController")

const regValidate = require('../utilities/account-validation')
const utilities = require('../utilities')

// REGISTER
router.post("/register", regValidate.registationRules(), regValidate.checkRegData,
utilities.handleErrors(accountController.registerAccount))

// LOGIN (handle form submission)
router.post("/login", utilities.handleErrors(accountController.login))

// LOGOUT
router.get("/logout", accountController.logout)
router.post("/logout", accountController.logout)

// (Optional) show register page
router.get("/register", (req, res) => {
  res.render("account/register", {
    title: "Register",
    errors: null,
    errorMessage: null,
    account_firstname: "",
    account_lastname: "",
    account_email: "",
    account_role: ""
  })
})

// LOGIN (if exists)
router.get("/login", (req, res) => {
  res.render("account/login", { title: "Login" })
})

// RESET PASSWORD (forced for plain-text password users)
router.get("/reset-password", utilities.handleErrors(accountController.resetPassword))
router.post("/reset-password", utilities.handleErrors(accountController.submitResetPassword))

module.exports = router