// AUTO-COMMENT: File Overview - server.js
// Purpose: Application entrypoint: server bootstrapping and middleware setup.
/* ****************************************** 
 * server.js - Main Application Controller
 *******************************************/

/* ================================
   REQUIRE STATEMENTS
================================ */
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
require("dotenv").config()

const session = require("express-session")
const http = require("http")
const net = require("net")
const fs = require('fs')
const path = require('path')
let cookieParser
try {
   cookieParser = require('cookie-parser')
} catch (e) {
   // Fallback minimal cookie parser if dependency is not installed.
   cookieParser = function() {
      return function(req, res, next) {
         req.cookies = {}
         const header = req.headers && req.headers.cookie
         if (header) {
            header.split(';').forEach(pair => {
               const idx = pair.indexOf('=')
               if (idx > -1) {
                  const key = pair.slice(0, idx).trim()
                  const val = decodeURIComponent(pair.slice(idx + 1).trim())
                  req.cookies[key] = val
               }
            })
         }
         next()
      }
   }
}

// Routes
const staticRoutes = require("./routes/static")
const dashboardRoutes = require("./routes/dashboardRoute")
const accountRoute = require("./routes/accountRoute")
const adminRoutes = require("./routes/adminRoute")
const staffRoutes = require("./routes/staffRoute")
const studentRoutes = require("./routes/studentRoute")
const parentRoutes = require("./routes/parentRoute")
const notificationRoutes = require("./routes/notificationRoute")
const attendanceRoute = require("./routes/attendanceRoute")
const pageRoute = require("./routes/pageRoute")
const announcementRoutes = require("./routes/announcementRoute")
const eventRoutes = require("./routes/eventRoute")
const guardianRoute = require("./routes/guardianRoute")
const notificationModel = require("./models/notificationModel")

// Utilities
const utilities = require("./utilities")
const socketUtil = require("./utilities/socket")

/* ================================
   INIT APP FIRST (IMPORTANT)
================================ */
const app = express()

/* =========================================
   CREATE HTTP SERVER + SOCKET INIT
========================================= */
const server = http.createServer(app)

// ✅ Initialize socket using utility (BEST PRACTICE)
const io = socketUtil.init(server)

/* ================================
   MIDDLEWARE (ORDER MATTERS ⚠️)
================================ */

// Parse form data
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// cookies (used to persist chosen language)
app.use(cookieParser())

// Session
app.use(session({
  secret: process.env.JWT_SECRET || "supersecretkey",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // set true only in production (HTTPS)
}))

// Make session available in all views
app.use((req, res, next) => {
  res.locals.loggedin = !!req.session.user
  res.locals.user = req.session.user || null
   const forwardedProto = req.headers["x-forwarded-proto"]
   const protocol = forwardedProto ? forwardedProto.split(",")[0].trim() : req.protocol
   res.locals.siteOrigin = `${protocol}://${req.get("host")}`
   res.locals.notificationCount = 0
  next()
})

let skipUnreadCountUntil = 0
let unreadCountLastErrorLogAt = 0

function isTransientDbConnectionError(err) {
   const message = String(err && err.message ? err.message : "").toLowerCase()
   const code = String(err && err.code ? err.code : "").toLowerCase()

   return (
      code === "57p01" ||
      code === "ecconnreset" ||
      code === "etimedout" ||
      code === "enotfound" ||
      code === "eai_again" ||
      message.includes("connection timeout") ||
      message.includes("connection terminated") ||
      message.includes("timeout") ||
      message.includes("getaddrinfo")
   )
}

app.use(async (req, res, next) => {
   try {
      const user = req.session && req.session.user

      if (!user || !user.id || !user.role) {
         return next()
      }

      if (Date.now() < skipUnreadCountUntil) {
         res.locals.notificationCount = 0
         return next()
      }

      const unreadResult = await notificationModel.getUnreadNotificationCount(user.id, user.role)
      res.locals.notificationCount = unreadResult.rows[0] ? unreadResult.rows[0].count : 0
      skipUnreadCountUntil = 0
      return next()
   } catch (err) {
      if (isTransientDbConnectionError(err)) {
         skipUnreadCountUntil = Date.now() + 30000

         // Avoid flooding logs with identical timeout errors on every request.
         if (Date.now() - unreadCountLastErrorLogAt > 15000) {
            unreadCountLastErrorLogAt = Date.now()
            console.warn("Unable to load unread notification count:", err.message)
         }
      } else {
         console.error("Unable to load unread notification count:", err.message)
      }

      res.locals.notificationCount = 0
      return next()
   }
})

// -------------------------
// Server-side i18n loader
// -------------------------
const LOCALES_DIR = path.join(__dirname, 'locales')
const SUPPORTED_LOCALES = ['en', 'es', 'fr']

function loadCatalogs() {
   const catalogs = {}
   SUPPORTED_LOCALES.forEach(lang => {
      const p = path.join(LOCALES_DIR, `${lang}.json`)
      if (fs.existsSync(p)) {
         try { catalogs[lang] = JSON.parse(fs.readFileSync(p, 'utf8')) } catch (e) { catalogs[lang] = {} }
      } else {
         catalogs[lang] = {}
      }
   })
   return catalogs
}

let i18nCatalogs = loadCatalogs()
// reload on locale file changes (dev only)
try { fs.watch(LOCALES_DIR, () => { i18nCatalogs = loadCatalogs() }) } catch (e) {}

function i18nMiddleware(req, res, next) {
   let lang = (req.query.lang || req.cookies?.siteLang || (req.headers['accept-language'] || 'en').split(',')[0].split('-')[0] || 'en').toLowerCase()
   if (!SUPPORTED_LOCALES.includes(lang)) lang = 'en'
   res.cookie('siteLang', lang, { maxAge: 1000 * 60 * 60 * 24 * 365 })
   res.locals.lang = lang
   res.locals.t = function(key, fallback) {
      return (i18nCatalogs[lang] && i18nCatalogs[lang][key]) || fallback || key
   }
   res.locals.__ = res.locals.t
   next()
}

app.use(i18nMiddleware)

/* ================================
   VIEW ENGINE
================================ */
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ================================
   STATIC FILES
================================ */
app.use(staticRoutes)
app.use(express.static("public"))
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")))


app.use((req, res, next) => {
    res.locals.currentPage = req.path
    next()
})

/* ================================
   ROUTES
================================ */

// Home route
app.get("/", (req, res) => {
  res.render("index", { title: "Home" })
})

// Account routes
app.use("/account", accountRoute)

// Dashboard routes
app.use("/dashboard", dashboardRoutes)

// Role routes
app.use("/admin", adminRoutes)
app.use("/staff", staffRoutes)
app.use("/student", studentRoutes)
app.use("/parent", parentRoutes)

// Notifications route
app.use("/notifications", notificationRoutes)

// Attendance route
app.use("/attendance", attendanceRoute)

// announcement route
app.use("/announcements", announcementRoutes)

// event route
app.use("/events", eventRoutes)

// Page route
app.use("/", pageRoute)

// Guardian route
app.use("/guardians", guardianRoute)



// Student route
//app.use("/student", studentRoute)

/* ================================
   SERVER START
================================ */
const port = Number(process.env.PORT) || 5500
const host = process.env.HOST || (process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost")
const maxPortFallbackTries = process.env.NODE_ENV === "production" ? 0 : 10

function isPortAvailable(candidatePort, candidateHost) {
   return new Promise((resolve) => {
      const tester = net.createServer()

      tester.once("error", (err) => {
         if (err && (err.code === "EADDRINUSE" || err.code === "EACCES")) {
            resolve(false)
         } else {
            resolve(false)
         }
      })

      tester.once("listening", () => {
         tester.close(() => resolve(true))
      })

      tester.listen(candidatePort, candidateHost)
   })
}

async function resolveServerPort(startPort, tries) {
   for (let offset = 0; offset <= tries; offset += 1) {
      const candidatePort = startPort + offset
      const available = await isPortAvailable(candidatePort, host)

      if (available) {
         return candidatePort
      }

      if (offset < tries) {
         console.warn(`Port ${candidatePort} is already in use. Retrying on ${candidatePort + 1}...`)
      }
   }

   return null
}

async function bootServer() {
   const selectedPort = await resolveServerPort(port, maxPortFallbackTries)

   if (!selectedPort) {
      console.error(`No free port found in range ${port}-${port + maxPortFallbackTries}. Set PORT to a free port and restart.`)
      process.exit(1)
      return
   }

   server.once("error", (err) => {
      if (err && err.code === "EADDRINUSE") {
         console.error(`Port ${selectedPort} is already in use. Set PORT to a free port and restart.`)
      } else {
         console.error("Server failed to start:", err)
      }
      process.exit(1)
   })

   server.listen(selectedPort, host, () => {
      console.log(`Server running on ${host}:${selectedPort}`)
   })
}

bootServer().catch((err) => {
   console.error("Server bootstrap failed:", err)
   process.exit(1)
})