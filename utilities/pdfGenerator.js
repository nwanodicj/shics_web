/* ******************************************
 * PDF GENERATOR (REPORT CARD)
 ******************************************/
const PDFDocument = require("pdfkit")

function generateReportCard(res, student, results) {

  const doc = new PDFDocument()

  // Set response headers
  res.setHeader("Content-Type", "application/pdf")
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${student.name}-report.pdf`
  )

  doc.pipe(res)

  // Title
  doc.fontSize(20).text("Student Report Card", { align: "center" })
  doc.moveDown()

  // Student Info
  doc.fontSize(12).text(`Name: ${student.name}`)
  doc.text(`Email: ${student.email}`)
  doc.moveDown()

  // Results
  doc.text("Results:", { underline: true })
  doc.moveDown()

  results.forEach(r => {
    doc.text(`${r.subject} - ${r.score} (${r.term})`)
  })

  doc.end()
}

module.exports = generateReportCard