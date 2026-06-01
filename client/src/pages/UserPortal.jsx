import { useState, useEffect, useCallback } from 'react';
import ComplaintForm from '../components/ComplaintForm';

const USER_ID = 'user_1';

const TIME_FORMATTER = new Intl.DateTimeFormat('zh-CN', {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function formatTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);

  if (diffMin < 1) return '刚刚';
  if (diffMin < 60) return `${diffMin}分钟前`;
  if (diffHour < 24) return `${diffHour}小时前`;
  return TIME_FORMATTER.format(d);
}

const STATUS_ICON = {
  pending: '⏳',
  resolved: '✅',
};

export default function UserPortal() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState(null);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/complaints?userId=${USER_ID}`);
      if (res.ok) setComplaints(await res.json());
    } catch {
      // 静默处理
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleCreate = async ({ title, content }) => {
    const res = await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, userId: USER_ID }),
    });
    if (res.ok) {
      showToast('投诉已提交');
      fetchComplaints();
    }
  };

  const filtered = complaints.filter((c) => {
    if (filter === 'pending') return c.status === 'pending';
    if (filter === 'resolved') return c.status === 'resolved';
    return true;
  });

  const pending = complaints.filter((c) => c.status === 'pending');
  const resolved = complaints.filter((c) => c.status === 'resolved');
  const pendingCount = pending.length;
  const resolvedCount = resolved.length;

  const renderItem = (c) => (
    <div key={c.id} className="ios-list-item">
      <div className={`ios-item-icon ${c.status}`}>
        {STATUS_ICON[c.status]}
      </div>
      <div className="ios-item-body">
        <div className="ios-item-title">
          {c.title}
        </div>
        {c.content && <div className="ios-item-subtitle">{c.content}</div>}
      </div>
      <div className="ios-item-trailing">
        <span className={`ios-badge ${c.status}`}>
          {c.status === 'resolved' ? '已解决' : '待处理'}
        </span>
        <span className="ios-item-time">{formatTime(c.created_at)}</span>
      </div>
    </div>
  );

  return (
    <div className="mobile-app">
      {/* Toast */}
      {toast && <div className="ios-toast">{toast}</div>}

      {/* 导航栏 */}
      <nav className="ios-nav">
        <div className="ios-nav-inner">
          <div className="ios-nav-top">
            <h1>投诉反馈</h1>
            <div className="ios-nav-actions">
              <span className="ios-stat-pill">全部 <strong>{complaints.length}</strong></span>
              <span className="ios-stat-pill pending">待处理 <strong>{pendingCount}</strong></span>
              <span className="ios-stat-pill resolved">已解决 <strong>{resolvedCount}</strong></span>
            </div>
          </div>
        </div>
      </nav>

      {/* Segmented Control */}
      <div className="ios-segment">
        {['all', 'pending', 'resolved'].map((key) => (
          <button
            key={key}
            className={`ios-segment-btn ${filter === key ? 'active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {key === 'all' ? '全部' : key === 'pending' ? '待处理' : '已解决'}
          </button>
        ))}
      </div>

      {/* 列表内容 */}
      {loading ? (
        <div className="ios-loading">
          <span className="ios-loading-dot" />
          <span className="ios-loading-dot" />
          <span className="ios-loading-dot" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="ios-empty">
          <span className="ios-empty-icon">📋</span>
          <div className="ios-empty-title">
            {filter === 'all' ? '还没有投诉记录' : filter === 'pending' ? '没有待处理投诉' : '还没有已解决的投诉'}
          </div>
          <div className="ios-empty-desc">
            点击右下角的 + 按钮提交新的投诉反馈
          </div>
        </div>
      ) : (
        <div className="ios-list-section">
          <div className="ios-list">
            {filtered.map(renderItem)}
          </div>
        </div>
      )}

      {/* FAB */}
      <ComplaintForm userId={USER_ID} onSubmit={handleCreate} />
    </div>
  );
}