const pool = require("../database/connection");
const bcrypt = require("bcryptjs");

async function migratePasswords() {
  try {
    console.log("Starting password migration...");

    const usersResult = await pool.query("SELECT id, email, password FROM users");
    const users = usersResult.rows;

    let migrated = 0;
    let skipped = 0;

    for (const user of users) {
      const rawPassword = user.password;
      if (!rawPassword) {
        console.warn(`Skipping user ${user.email}: empty password`);
        skipped++;
        continue;
      }

      const isHashed = typeof rawPassword === "string" && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(rawPassword);
      if (isHashed) {
        skipped++;
        continue;
      }

      const hashedPassword = await bcrypt.hash(rawPassword, 12);
      await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, user.id]);
      migrated += 1;
      console.log(`Migrated user ${user.email}`);
    }

    console.log(`Password migration complete. Migrated: ${migrated}, Skipped: ${skipped}`);
    process.exit(0);
  } catch (error) {
    console.error("Password migration failed:", error);
    process.exit(1);
  }
}

migratePasswords();
