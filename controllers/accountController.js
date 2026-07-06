const utilities = require("../utilities")
const pool = require("../database/connection")
const bcrypt = require("bcryptjs")
const accountModel = require("../models/accountModel")

const accountController = {}

/* ===============================
   REGISTER ACCOUNT (SECURE 🔐)
================================ */
accountController.registerAccount = async function (req, res) {
  try {
    const {
      account_firstname,
      account_lastname,
      account_email,
      account_password,
      account_role
    } = req.body

    const name = `${account_firstname} ${account_lastname}`

    // 🚨 FORCE SAFE ROLES ONLY
    let role = "student" // default

    if (account_role === "parent") {
      role = "parent"
    }

    // ❌ BLOCK admin/staff completely
    if (account_role === "admin" || account_role === "staff") {
      return res.render("account/register", {
        title: "Register",
        errors: null,
        errorMessage: "Unauthorized role selection",
        account_firstname,
        account_lastname,
        account_email,
        account_role
      })
    }

    const hashedPassword = await bcrypt.hash(account_password, 12)
    const result = await accountModel.registerAccount(
      name,
      account_email,
      hashedPassword,
      role
    )

    if (!result) {
      return res.render("account/register", {
        title: "Register",
        errors: null,
        errorMessage: "Unable to register. Please try again.",
        account_firstname,
        account_lastname,
        account_email,
        account_role
      })
    }

    // Registration successful, redirect to login
    res.redirect("/account/login")

  } catch (err) {
    console.error(err)
    res.status(500).send("Server error")
  }
}


/* ===============================
   ADMIN DASHBOARD
================================ */
accountController.admin = async function (req, res) {
  let nav = await utilities.getNav()

  res.render("dashboard/admin", {
    title: "Admin Dashboard",
    nav,
    user: req.session.user
  })
}


/* ===============================
   LOGIN HANDLER
================================ */
accountController.login = async function (req, res) {
  try {
    const { account_email, account_password } = req.body

    if (!account_email || !account_password) {
      return res.render("account/login", { title: "Login", errorMessage: "Email and password are required." })
    }

    const user = await accountModel.getAccountByEmail(account_email)

    if (!user) {
      return res.render("account/login", { title: "Login", errorMessage: "Invalid email or password." })
    }

    const isBcryptHash = typeof user.password === 'string' && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(user.password)
    let passwordMatches = false

    if (isBcryptHash) {
      passwordMatches = await bcrypt.compare(account_password, user.password)
    } else {
      passwordMatches = user.password === account_password
    }

    if (!passwordMatches) {
      return res.render("account/login", { title: "Login", errorMessage: "Invalid email or password." })
    }

    // Store user in session
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }

    // If password is plain-text, force reset before allowing dashboard access
    if (!isBcryptHash) {
      req.session.forcePasswordReset = true
      return res.redirect("/account/reset-password")
    }

    // Password is already hashed; redirect to dashboard
    const role = (user.role || "student")
    return res.redirect(`/dashboard/${role}`)
  } catch (err) {
    console.error(err)
    res.status(500).send("Server error")
  }
}

/* ===============================
   STAFF DASHBOARD
================================ */
accountController.staff = async function (req, res) {
  let nav = await utilities.getNav()

  res.render("dashboard/staff", {
    title: "Staff Dashboard",
    nav,
    user: req.session.user
  })
}

/* ===============================
   STUDENT DASHBOARD
================================ */
accountController.student = async function (req, res) {
  let nav = await utilities.getNav()

  res.render("dashboard/student", {
    title: "Student Dashboard",
    nav,
    user: req.session.user
  })
}

/* ===============================
   PARENT DASHBOARD
================================ */
accountController.parent = async function (req, res) {
  let nav = await utilities.getNav()

  res.render("dashboard/parent", {
    title: "Parent Dashboard",
    nav,
    user: req.session.user
  })
}


/* ===============================
   FORCE PASSWORD RESET (for plain-text password users)
================================ */
accountController.resetPassword = async function (req, res) {
  try {
    // Check if user is authenticated and forced to reset
    if (!req.session.user || !req.session.forcePasswordReset) {
      return res.redirect("/account/login")
    }

    res.render("account/reset-password", {
      title: "Reset Password",
      userName: req.session.user.name,
      errorMessage: null
    })
  } catch (err) {
    console.error(err)
    res.status(500).send("Server error")
  }
}

accountController.submitResetPassword = async function (req, res) {
  try {
    if (!req.session.user || !req.session.forcePasswordReset) {
      return res.redirect("/account/login")
    }

    const { new_password, confirm_password } = req.body
    const userEmail = req.session.user.email

    if (!new_password || !confirm_password) {
      return res.render("account/reset-password", {
        title: "Reset Password",
        userName: req.session.user.name,
        errorMessage: "Both password fields are required."
      })
    }

    if (new_password !== confirm_password) {
      return res.render("account/reset-password", {
        title: "Reset Password",
        userName: req.session.user.name,
        errorMessage: "Passwords do not match."
      })
    }

    // Validate password strength (same rules as registration)
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{12,}$/
    if (!passwordRegex.test(new_password)) {
      return res.render("account/reset-password", {
        title: "Reset Password",
        userName: req.session.user.name,
        errorMessage: "Password must be at least 12 characters and include: uppercase, lowercase, number, and special character."
      })
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(new_password, 12)
    const result = await accountModel.updatePasswordByEmail(userEmail, hashedPassword)

    if (!result) {
      return res.render("account/reset-password", {
        title: "Reset Password",
        userName: req.session.user.name,
        errorMessage: "Failed to update password. Please try again."
      })
    }

    // Clear the force reset flag
    delete req.session.forcePasswordReset

    // Redirect to dashboard
    const role = req.session.user.role || "student"
    res.redirect(`/dashboard/${role}`)
  } catch (err) {
    console.error(err)
    res.status(500).send("Server error")
  }
}

/* ===============================
   GET LIVE STATS
================================ */
accountController.getStats = async (req, res) => {
  try {
    const students = await pool.query("SELECT COUNT(*) FROM users WHERE role='student'")
    const staff = await pool.query("SELECT COUNT(*) FROM users WHERE role='staff'")
    const classes = await pool.query("SELECT COUNT(DISTINCT class) FROM lessons")

    res.json({
      students: students.rows[0].count,
      staff: staff.rows[0].count,
      classes: classes.rows[0].count
    })
  } catch (err) {
    console.error(err)
    res.status(500).send("Error loading stats")
  }
}

module.exports = accountController
