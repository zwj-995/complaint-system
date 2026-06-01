const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'complaints.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

// 只建表，不塞数据
db.exec(`
  CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'resolved')),
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;