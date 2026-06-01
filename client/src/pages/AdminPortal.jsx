import { useState, useEffect, useCallback } from 'react';
import ComplaintList from '../components/ComplaintList';
import ComplaintForm from '../components/ComplaintForm';

export default function AdminPortal() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/complaints');
    if (res.ok) setComplaints(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const handleCreate = async ({ title, content, userId }) => {
    await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, userId }),
    });
    fetchComplaints();
  };

  const handleToggleStatus = async (id) => {
    await fetch(`/api/complaints/${id}/status`, { method: 'PATCH' });
    fetchComplaints();
  };

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'pending').length,
    resolved: complaints.filter((c) => c.status === 'resolved').length,
  };

  return (
    <div className="admin-app">
      <header className="admin-header">
        <h1>🏢 投诉管理后台</h1>
        <div className="admin-actions">
          <ComplaintForm userId="admin_1" onSubmit={handleCreate} />
        </div>
      </header>

      <div className="admin-body">
        <div className="admin-stats">
          <div className="stat-card">📋 总计 <strong>{stats.total}</strong></div>
          <div className="stat-card orange">⏳ 待处理 <strong>{stats.pending}</strong></div>
          <div className="stat-card green">✅ 已解决 <strong>{stats.resolved}</strong></div>
        </div>

        {loading ? <p className="loading">加载中...</p> : (
          <ComplaintList
            complaints={complaints}
            showUser
            onToggleStatus={handleToggleStatus}
          />
        )}
      </div>
    </div>
  );
}