export default function ComplaintList({ complaints, showUser, onToggleStatus }) {
  const badge = (status) =>
    status === 'resolved'
      ? <span className="badge resolved">已解决</span>
      : <span className="badge pending">待处理</span>;

  if (!complaints.length) {
    return <p className="empty">暂无投诉</p>;
  }

  return (
    <div className="list">
      {complaints.map((c) => (
        <div key={c.id} className="card">
          <div className="card-head">
            <h3>{c.title}</h3>
            {badge(c.status)}
          </div>
          <p className="card-content">{c.content}</p>
          <div className="card-meta">
            {showUser && <span>👤 {c.user_id}</span>}
            <span>🕐 {new Date(c.created_at).toLocaleString()}</span>
          </div>
          {onToggleStatus && (
            <button className="btn-sm" onClick={() => onToggleStatus(c.id)}>
              {c.status === 'pending' ? '✅ 标记已解决' : '↩️ 重新打开'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}