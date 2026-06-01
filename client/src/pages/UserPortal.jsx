import { useState, useEffect, useCallback } from 'react';
import ComplaintForm from '../components/ComplaintForm';

const USER_ID = 'user_1';

export default function UserPortal() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/complaints?userId=${USER_ID}`);
    if (res.ok) setComplaints(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const handleCreate = async ({ title, content }) => {
    await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, userId: USER_ID }),
    });
    fetchComplaints();
  };

  // 按状态分组
  const pending = complaints.filter(c => c.status === 'pending');
  const resolved = complaints.filter(c => c.status === 'resolved');

  const badge = (status) =>
    status === 'resolved'
      ? <span className="badge resolved">已解决</span>
      : <span className="badge pending">待处理</span>;

  return (
    <div className="mobile-app">
      {/* 顶栏 */}
      <header className="mobile-header">
        <div className="mobile-header-top">
          <h1>投诉反馈</h1>
          <ComplaintForm userId={USER_ID} onSubmit={handleCreate} />
        </div>
        <div className="mobile-stats">
          <span>全部 <strong>{complaints.length}</strong></span>
          <span className="orange">待处理 <strong>{pending.length}</strong></span>
          <span className="green">已解决 <strong>{resolved.length}</strong></span>
        </div>
      </header>

      {/* 主内容 */}
      <main className="mobile-main">
        {loading ? (
          <div className="mobile-loading">加载中...</div>
        ) : complaints.length === 0 ? (
          <div className="mobile-empty">
            <div className="empty-icon">📋</div>
            <p>暂无投诉记录</p>
            <p className="empty-sub">点击右上角"新建投诉"提交</p>
          </div>
        ) : (
          <div className="mobile-list">
            {pending.map(c => (
              <div key={c.id} className="mobile-card pending-card">
                <div className="mobile-card-head">
                  <h3>{c.title}</h3>
                  {badge(c.status)}
                </div>
                {c.content && <p className="mobile-card-body">{c.content}</p>}
                <div className="mobile-card-time">
                  {new Date(c.created_at).toLocaleString('zh-CN', {
                    month: 'numeric', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
            {resolved.map(c => (
              <div key={c.id} className="mobile-card resolved-card">
                <div className="mobile-card-head">
                  <h3>{c.title}</h3>
                  {badge(c.status)}
                </div>
                {c.content && <p className="mobile-card-body">{c.content}</p>}
                <div className="mobile-card-time">
                  {new Date(c.created_at).toLocaleString('zh-CN', {
                    month: 'numeric', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}