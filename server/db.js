const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'complaints.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

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

// 插入种子数据
const count = db.prepare('SELECT COUNT(*) as cnt FROM complaints').get();
if (count.cnt === 0) {
  const insert = db.prepare(
    'INSERT INTO complaints (title, content, status, user_id) VALUES (?, ?, ?, ?)'
  );
  insert.run('网络连接不稳定', '办公室 3 楼 WiFi 频繁断连，影响工作', 'pending', 'user_1');
  insert.run('会议室投影仪故障', 'B-203 会议室投影仪颜色偏色严重', 'resolved', 'user_1');
  insert.run('空调制冷不足', '5 楼办公区空调出风不冷，下午温度偏高', 'pending', 'user_1');
  insert.run('门禁系统故障', '东侧大门门禁刷卡无法识别', 'pending', 'user_2');
  insert.run('电梯异响', '2 号电梯运行时有金属摩擦声', 'resolved', 'user_2');
  insert.run('饮水机缺水', '4 楼东侧饮水机已空置半天未更换', 'pending', 'user_3');

  console.log('✅ 种子数据已插入');
}

module.exports = db;