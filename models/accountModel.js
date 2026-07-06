const pool = require("../database/connection"); // your pg connection

const accountModel = {};

/* ===============================
   GET USER BY EMAIL
================================ */
accountModel.getAccountByEmail = async function (email) {
  try {
    const sql = `
      SELECT * FROM users
      WHERE email = $1
    `;
    const result = await pool.query(sql, [email]);
    return result.rows[0]; // return single user
  } catch (error) {
    console.error("getAccountByEmail error:", error);
    throw error;
  }
};

/* ===============================
   REGISTER ACCOUNT
================================ */
accountModel.registerAccount = async function (name, email, password, role) {
  try {
    const sql = `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await pool.query(sql, [name, email, password, role]);

    return result.rows[0];

  } catch (error) {
    console.error("registerAccount error:", error);
    return null;
  }
};

accountModel.updatePasswordByEmail = async function (email, hashedPassword) {
  try {
    const sql = `
      UPDATE users
      SET password = $1
      WHERE email = $2
      RETURNING *
    `;
    const result = await pool.query(sql, [hashedPassword, email]);
    return result.rows[0];
  } catch (error) {
    console.error("updatePasswordByEmail error:", error);
    return null;
  }
};

module.exports = accountModel;