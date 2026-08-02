const getHome = (req, res) => {
    res.render("pages/index", { title: "Home", currentPage: "home" })
}

const getAbout = (req, res) => {
    res.render("pages/about", { title: "About", currentPage: "about" })
}

const getGuardians = (req, res) => {
    res.render("pages/guardians", { title: "Guardians", currentPage: "guardians" })
}

const getAdmission = (req, res) => {
    res.render("pages/admission", { title: "Admission", currentPage: "admission" })
}

const getContact = (req, res) => {
    res.render("pages/contact", { title: "Contact", currentPage: "contact" })
}

const getCreche = (req, res) => {
    res.render("pages/creche", { title: "Creche", currentPage: "creche" })
}

const getPreNursery = (req, res) => {
    res.render("pages/pre-nursery", { title: "Pre-Nursery", currentPage: "pre-nursery" })
}



const getPrep = (req, res) => {
    res.render("pages/prep", { title: "Prep", currentPage: "prep" })
}

const getNursery = (req, res) => {
    res.render("pages/nursery", { title: "Nursery", currentPage: "nursery" })
}

const getPrePrep = (req, res) => {
    res.render("pages/pre-prep", { title: "Pre-Prep", currentPage: "pre-prep" })
}

const getSecondary = (req, res) => {
    res.render("pages/secondary", { title: "Secondary", currentPage: "secondary" })
}
const getPrimary = (req, res) => {
    res.render("pages/primary", { title: "Primary", currentPage: "primary" })
}

const getVisionAndValues = (req, res) => {
    res.render("pages/vision-and-value", { title: "Vision and Values", currentPage: "vision-and-value" })
}

const getHistoryAndHeritage = (req, res) => { res.render("pages/history-and-heritage", { title: "History and Heritage", currentPage: "history-and-heritage" }) }

const getGallery = async (req, res) => {
  try {
    const galleryModel = require("../models/galleryModel")
    const result = await galleryModel.getAllGalleryImages()

    res.render("pages/gallery", {
      title: "Gallery",
      currentPage: "gallery",
      galleryImages: result.rows
    })
  } catch (err) {
    console.error(err)
    res.render("pages/gallery", {
      title: "Gallery",
      currentPage: "gallery",
      galleryImages: []
    })
  }
}

const getSchoolGuild = (req, res) => {res.render("pages/school-guild", {title: "School Guild", currentPage: "school-guild"})}

const getMidTermSchedule = (req, res) => {res.render("pages/mid-term-schedule", {title: "Mid Term Schedule", currentPage: "mid-term-schedule"})}

const getFees = (req, res) => {res.render("pages/fees", {title: "Fees", currentPage: "fees"})}

const getClasses= (req, res) => {res.render("pages/classes", {title: "Classes", currentPage: "classes"})}

const getHeadmaster = (req, res) => {res.render("pages/headmaster", {title: "Headmaster", currentPage: "headmaster"})}

module.exports = {
    getHome,
    getAbout,
    getGuardians,
    getAdmission,
    getContact,
    getCreche,
    getPreNursery,
    getPrep,
    getNursery,
    getPrePrep,
    getSecondary,
    getPrimary,
    getVisionAndValues,
    getHistoryAndHeritage,
    getGallery,
    getSchoolGuild,
    getMidTermSchedule,
    getFees,
    getClasses,
    getHeadmaster
}