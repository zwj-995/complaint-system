/**
 * 种子数据脚本
 * 用法: npm run seed
 * 仅当表为空时插入演示数据
 */
const db = require('./db');

const count = db.prepare('SELECT COUNT(*) as cnt FROM complaints').get();
if (count.cnt > 0) {
  console.log(`⏭️  数据库中已有 ${count.cnt} 条数据，跳过种子插入`);
  process.exit(0);
}

const insert = db.prepare(
  'INSERT INTO complaints (title, content, status, user_id) VALUES (?, ?, ?, ?)'
);

const seedData = [
  ['网络连接不稳定', '办公室 3 楼 WiFi 频繁断连，影响工作', 'pending', 'user_1'],
  ['会议室投影仪故障', 'B-203 会议室投影仪颜色偏色严重', 'resolved', 'user_1'],
  ['空调制冷不足', '5 楼办公区空调出风不冷，下午温度偏高', 'pending', 'user_1'],
  ['门禁系统故障', '东侧大门门禁刷卡无法识别', 'pending', 'user_2'],
  ['电梯异响', '2 号电梯运行时有金属摩擦声', 'resolved', 'user_2'],
  ['饮水机缺水', '4 楼东侧饮水机已空置半天未更换', 'pending', 'user_3'],
];

const tx = db.transaction((data) => {
  for (const row of data) insert.run(...row);
});

tx(seedData);
console.log(`✅ 种子数据插入完成: ${seedData.length} 条`);