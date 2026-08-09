/* ******************************************
 * PDF GENERATOR (REPORT CARD)
 ******************************************/
const PDFDocument = require("pdfkit")
const fs = require("fs")
const path = require("path")

function generateReportCard(res, student, results, publication = null) {

  const doc = new PDFDocument()
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right
  const tableLeft = doc.page.margins.left
  const rowHeight = 24
  const columnWidths = [pageWidth * 0.5, pageWidth * 0.2, pageWidth * 0.15, pageWidth * 0.15]
  const schoolName = "Sacred Harvasters International Christian School"
  const schoolLogoPath = path.join(__dirname, "..", "public", "images", "people", "harvester.png")

  function safeFileName(value) {
    return String(value || "student")
      .replace(/[\\/:*?"<>|]/g, "-")
      .replace(/\s+/g, " ")
      .trim()
  }

  function drawTableRow(y, cells, options = {}) {
    const fillColor = options.fillColor || null
    const textColor = options.textColor || "#111111"
    const borderColor = options.borderColor || "#d1d5db"
    const fontSize = options.fontSize || 10
    let currentX = tableLeft

    if (fillColor) {
      doc.save()
      doc.rect(tableLeft, y, pageWidth, rowHeight).fill(fillColor)
      doc.restore()
    }

    cells.forEach((cell, index) => {
      const width = columnWidths[index]
      doc
        .save()
        .lineWidth(0.75)
        .strokeColor(borderColor)
        .rect(currentX, y, width, rowHeight)
        .stroke()
        .restore()

      doc
        .fillColor(textColor)
        .fontSize(fontSize)
        .text(String(cell ?? ""), currentX + 6, y + 7, {
          width: width - 12,
          height: rowHeight - 10,
          ellipsis: true,
          align: index === 1 || index === 2 || index === 3 ? "center" : "left"
        })

      currentX += width
    })
  }

  function drawSummaryRow(label, value, y) {
    const labelWidth = pageWidth * 0.7
    const valueWidth = pageWidth * 0.3

    doc
      .save()
      .lineWidth(0.75)
      .strokeColor("#d1d5db")
      .rect(tableLeft, y, labelWidth, rowHeight)
      .stroke()
      .rect(tableLeft + labelWidth, y, valueWidth, rowHeight)
      .stroke()
      .restore()

    doc.fontSize(10).fillColor("#111111").text(label, tableLeft + 6, y + 7, {
      width: labelWidth - 12,
      height: rowHeight - 10
    })
    doc.fontSize(10).fillColor("#111111").text(String(value ?? ""), tableLeft + labelWidth + 6, y + 7, {
      width: valueWidth - 12,
      height: rowHeight - 10,
      align: "right"
    })
  }

  // Set response headers
  res.setHeader("Content-Type", "application/pdf")
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${safeFileName(student.name)}-report.pdf"`
  )

  doc.pipe(res)

  // Header
  const headerTop = doc.y
  if (fs.existsSync(schoolLogoPath)) {
    try {
      doc.image(schoolLogoPath, tableLeft, headerTop, { width: 44, height: 44 })
    } catch (imageErr) {
      console.warn("Report logo could not be loaded:", imageErr.message)
    }
  }

  doc
    .fontSize(18)
    .fillColor("#111111")
    .text(schoolName, tableLeft + 56, headerTop + 2, { align: "left" })
  doc
    .fontSize(10)
    .fillColor("#4b5563")
    .text("Unofficial Student Report Card", tableLeft + 56, headerTop + 24)
  doc
    .fontSize(10)
    .fillColor("#6b7280")
    .text("Academic summary", tableLeft + 56, headerTop + 38)

  doc.moveDown(3)

  // Student Info
  doc.fontSize(12).fillColor("#111111").text(`Student Name: ${student.name}`)
  doc.fontSize(11).fillColor("#374151").text(`Email: ${student.email}`)
  if (publication) {
    doc.fontSize(11).text(`Term: ${publication.term}`)
  }
  doc.moveDown()

  // Results table
  const tableStartY = doc.y + 4
  drawTableRow(tableStartY, ["Subject", "Score", "Grade", "Term"], {
    fillColor: "#1f2937",
    textColor: "#ffffff",
    borderColor: "#1f2937",
    fontSize: 10
  })

  let currentY = tableStartY + rowHeight
  results.forEach((result, index) => {
    drawTableRow(currentY, [result.subject, result.score, result.grade, result.term], {
      fillColor: index % 2 === 0 ? "#f9fafb" : null,
      borderColor: "#d1d5db",
      fontSize: 10
    })
    currentY += rowHeight
  })

  doc.moveDown(2)

  const summaryStartY = currentY + 18
  doc.fontSize(12).fillColor("#111111").text("Report Summary", tableLeft, summaryStartY, {
    underline: true
  })

  const summaryRowY = summaryStartY + 22
  drawSummaryRow("Average Score", publication ? publication.average_score : "-", summaryRowY)
  drawSummaryRow("Remark", publication ? publication.remark : "-", summaryRowY + rowHeight)
  drawSummaryRow("Total Score", publication ? publication.total_score : "-", summaryRowY + rowHeight * 2)

  doc.end()
}

module.exports = generateReportCard