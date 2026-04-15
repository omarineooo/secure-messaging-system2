const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "../database.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Connected to SQLite database");
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      public_key TEXT,
      private_key TEXT
    )
  `);

  db.all("PRAGMA table_info(users)", (err, columns) => {
    if (!err) {
      const columnNames = columns.map(col => col.name);

      if (!columnNames.includes("public_key")) {
        db.run(`ALTER TABLE users ADD COLUMN public_key TEXT`);
      }

      if (!columnNames.includes("private_key")) {
        db.run(`ALTER TABLE users ADD COLUMN private_key TEXT`);
      }
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      ciphertext TEXT NOT NULL,
      encryption_type TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;