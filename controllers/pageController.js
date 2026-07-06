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
    getPrimary
}