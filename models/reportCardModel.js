/* =========================================
   REPORT CARD / PUBLICATION MODEL
========================================= */
const pool = require("../database/connection")

let schemaReady = false

function getGrade(score) {
  if (score >= 90) return "A"
  if (score >= 80) return "B"
  if (score >= 70) return "C"
  if (score >= 60) return "D"
  if (score >= 50) return "E"
  return "F"
}

function buildSummary(results) {
  const totalScore = results.reduce((sum, result) => sum + Number(result.score || 0), 0)
  const subjectCount = results.length
  const averageScore = subjectCount > 0 ? totalScore / subjectCount : 0
  const remark = averageScore >= 50 ? "Passed" : "Failed"

  return {
    total_score: Number(totalScore.toFixed(2)),
    average_score: Number(averageScore.toFixed(2)),
    remark
  }
}

async function ensureSchema() {
  if (schemaReady) return

  await pool.query(`
    CREATE TABLE IF NOT EXISTS result_publications (
      id SERIAL PRIMARY KEY,
      student_id INT NOT NULL,
      term VARCHAR(20) NOT NULL,
      total_score NUMERIC(10,2) NOT NULL DEFAULT 0,
      average_score NUMERIC(10,2) NOT NULL DEFAULT 0,
      remark VARCHAR(20) NOT NULL,
      published_by INT,
      published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_result_publication_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_result_publication_published_by FOREIGN KEY (published_by) REFERENCES users(id) ON DELETE SET NULL,
      CONSTRAINT unique_result_publication UNIQUE (student_id, term)
    )
  `)

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_result_publications_student_term
    ON result_publications(student_id, term)
  `)

  schemaReady = true
}

async function getDraftResultsForStudentTerm(studentId, term) {
  return pool.query(
    `SELECT id, student_id, subject, score, term, created_at
     FROM results
     WHERE student_id = $1 AND term = $2
     ORDER BY subject ASC`,
    [studentId, term]
  )
}

async function upsertPublication(studentId, term, summary, publishedBy) {
  const result = await pool.query(
    `INSERT INTO result_publications (student_id, term, total_score, average_score, remark, published_by, published_at)
     VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
     ON CONFLICT (student_id, term)
     DO UPDATE SET
       total_score = EXCLUDED.total_score,
       average_score = EXCLUDED.average_score,
       remark = EXCLUDED.remark,
       published_by = EXCLUDED.published_by,
       published_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [studentId, term, summary.total_score, summary.average_score, summary.remark, publishedBy || null]
  )

  return result.rows[0]
}

async function publishStudentTerm(studentId, term, publishedBy) {
  await ensureSchema()

  const draftResults = await getDraftResultsForStudentTerm(studentId, term)
  if (!draftResults.rows.length) {
    return null
  }

  const summary = buildSummary(draftResults.rows)
  const publication = await upsertPublication(studentId, term, summary, publishedBy)

  return {
    publication,
    subjects: draftResults.rows.map((result) => ({
      subject: result.subject,
      score: Number(result.score),
      grade: getGrade(Number(result.score)),
      term: result.term
    })),
    summary
  }
}

async function publishTermForAll(term, publishedBy) {
  await ensureSchema()

  const students = await pool.query(
    `SELECT DISTINCT student_id
     FROM results
     WHERE term = $1
     ORDER BY student_id ASC`,
    [term]
  )

  const publishedCards = []

  for (const row of students.rows) {
    const card = await publishStudentTerm(row.student_id, term, publishedBy)
    if (card) {
      publishedCards.push({
        student_id: row.student_id,
        term,
        ...card
      })
    }
  }

  return publishedCards
}

async function getPublishedReportCardsForStudent(studentId) {
  await ensureSchema()

  const studentResult = await pool.query(
    `SELECT id, name, email, role, created_at
     FROM users
     WHERE id = $1`,
    [studentId]
  )

  const publicationRows = await pool.query(
    `SELECT *
     FROM result_publications
     WHERE student_id = $1
     ORDER BY published_at DESC`,
    [studentId]
  )

  const reportCards = []

  for (const publication of publicationRows.rows) {
    const subjectsResult = await getDraftResultsForStudentTerm(studentId, publication.term)

    reportCards.push({
      student: studentResult.rows[0] || null,
      publication,
      subjects: subjectsResult.rows.map((result) => ({
        subject: result.subject,
        score: Number(result.score),
        grade: getGrade(Number(result.score)),
        term: result.term
      }))
    })
  }

  return reportCards
}

async function getPublishedReportCardsForParent(parentId) {
  await ensureSchema()

  const children = await pool.query(
    `SELECT u.id, u.name, u.email, u.role, u.created_at
     FROM users u
     JOIN parent_student ps ON u.id = ps.student_id
     WHERE ps.parent_id = $1
     ORDER BY u.name ASC`,
    [parentId]
  )

  const cards = []

  for (const child of children.rows) {
    const childCards = await getPublishedReportCardsForStudent(child.id)
    childCards.forEach((card) => {
      cards.push({
        student: child,
        publication: card.publication,
        subjects: card.subjects
      })
    })
  }

  return cards
}

async function getLatestPublishedReportCard(studentId) {
  const cards = await getPublishedReportCardsForStudent(studentId)
  return cards[0] || null
}

async function getPublishedReportCardForStudentTerm(studentId, term) {
  await ensureSchema()

  const studentResult = await pool.query(
    `SELECT id, name, email, role, created_at
     FROM users
     WHERE id = $1`,
    [studentId]
  )

  const publicationResult = await pool.query(
    `SELECT *
     FROM result_publications
     WHERE student_id = $1 AND term = $2
     LIMIT 1`,
    [studentId, term]
  )

  if (!publicationResult.rows[0]) {
    return null
  }

  const subjectsResult = await getDraftResultsForStudentTerm(studentId, term)

  return {
    student: studentResult.rows[0] || null,
    publication: publicationResult.rows[0],
    subjects: subjectsResult.rows.map((result) => ({
      subject: result.subject,
      score: Number(result.score),
      grade: getGrade(Number(result.score)),
      term: result.term
    }))
  }
}

async function getPublishedReportCardSummaries() {
  await ensureSchema()

  const result = await pool.query(
    `SELECT rp.*, u.name AS student_name
     FROM result_publications rp
     JOIN users u ON u.id = rp.student_id
     ORDER BY rp.published_at DESC, u.name ASC`
  )

  return result.rows
}

module.exports = {
  ensureSchema,
  getGrade,
  buildSummary,
  publishStudentTerm,
  publishTermForAll,
  getPublishedReportCardsForStudent,
  getPublishedReportCardsForParent,
  getLatestPublishedReportCard,
  getPublishedReportCardForStudentTerm,
  getPublishedReportCardSummaries
}
