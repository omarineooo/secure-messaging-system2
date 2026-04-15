const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../public")));

const db = new sqlite3.Database(path.join(__dirname, "../database.db"));

// USERS TABLE
db.run(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
)
`);

// MESSAGES TABLE
db.run(`
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender TEXT,
  receiver TEXT,
  message TEXT
)
`);

// REGISTER
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.json({ success: false, message: "Please fill all fields" });
    }

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    const hash = await bcrypt.hash(cleanPass, 10);

    db.run(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [cleanUser, hash],
      function (err) {
        if (err) {
          return res.json({ success: false, message: "Username already exists" });
        }

        res.json({ success: true, message: "Registered successfully" });
      }
    );
  } catch (error) {
    res.json({ success: false, message: "Register failed" });
  }
});

// LOGIN
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({ success: false, message: "Please fill all fields" });
  }

  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username.trim()],
    async (err, user) => {
      if (err) {
        return res.json({ success: false, message: "Database error" });
      }

      if (!user) {
        return res.json({ success: false, message: "User not found" });
      }

      const match = await bcrypt.compare(password.trim(), user.password);

      if (!match) {
        return res.json({ success: false, message: "Wrong password" });
      }

      res.json({ success: true, message: "Login success" });
    }
  );
});

// SEND MESSAGE
app.post("/api/send", (req, res) => {
  const { from, to, message } = req.body;

  if (!from || !to || !message) {
    return res.json({ success: false, message: "Please fill all fields" });
  }

  db.get("SELECT * FROM users WHERE username = ?", [to.trim()], (err, user) => {
    if (err) {
      return res.json({ success: false, message: "Database error" });
    }

    if (!user) {
      return res.json({ success: false, message: "Receiver not found" });
    }

    db.run(
      "INSERT INTO messages (sender, receiver, message) VALUES (?, ?, ?)",
      [from.trim(), to.trim(), message.trim()],
      function (err) {
        if (err) {
          return res.json({ success: false, message: "Send failed" });
        }

        res.json({ success: true, message: "Message sent successfully" });
      }
    );
  });
});

// INBOX
app.get("/api/inbox/:username", (req, res) => {
  const username = req.params.username;

  db.all(
    "SELECT sender, message FROM messages WHERE receiver = ? ORDER BY id DESC",
    [username],
    (err, rows) => {
      if (err) {
        return res.json([]);
      }

      res.json(rows || []);
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});