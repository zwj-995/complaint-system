const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ── GET /api/complaints ──
// 查询参数 ?userId=xxx  → 只返回该用户的投诉
// 不传 userId           → 返回全部（企业端）
app.get('/api/complaints', (req, res) => {
  try {
    const { userId } = req.query;
    let complaints;
    if (userId) {
      complaints = db
        .prepare('SELECT * FROM complaints WHERE user_id = ? ORDER BY created_at DESC')
        .all(userId);
    } else {
      complaints = db
        .prepare('SELECT * FROM complaints ORDER BY created_at DESC')
        .all();
    }
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/complaints ──
// 请求体: { title, content, userId }
app.post('/api/complaints', (req, res) => {
  try {
    const { title, content, userId } = req.body;
    if (!title || !userId) {
      return res.status(400).json({ error: 'title 和 userId 必填' });
    }
    const result = db
      .prepare('INSERT INTO complaints (title, content, user_id) VALUES (?, ?, ?)')
      .run(title, content || '', userId);
    const complaint = db
      .prepare('SELECT * FROM complaints WHERE id = ?')
      .get(result.lastInsertRowid);
    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/complaints/:id/status ──
// 切换 pending ↔ resolved
app.patch('/api/complaints/:id/status', (req, res) => {
  try {
    const complaint = db
      .prepare('SELECT * FROM complaints WHERE id = ?')
      .get(req.params.id);
    if (!complaint) return res.status(404).json({ error: '投诉不存在' });

    const newStatus = complaint.status === 'pending' ? 'resolved' : 'pending';
    db.prepare('UPDATE complaints SET status = ? WHERE id = ?').run(newStatus, req.params.id);
    const updated = db
      .prepare('SELECT * FROM complaints WHERE id = ?')
      .get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 投诉系统后端运行在 http://localhost:${PORT}`);
});