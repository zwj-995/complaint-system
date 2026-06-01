import { useState, useEffect, useCallback, useMemo } from 'react';

const TIME_FMT = new Intl.DateTimeFormat('zh-CN', {
  month: 'short', day: 'numeric',
  hour: '2-digit', minute: '2-digit',
});

export default function AdminPortal() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formUser, setFormUser] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | pending | resolved
  const [sortKey, setSortKey] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/complaints');
    if (res.ok) setComplaints(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formUser.trim() || submitting) return;
    setSubmitting(true);
    try {
      await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: formTitle.trim(), content: formContent.trim(), userId: formUser.trim() }),
      });
      setFormTitle(''); setFormContent(''); setFormUser('');
      setShowForm(false);
      showToast('投诉已创建');
      fetchComplaints();
    } finally { setSubmitting(false); }
  };

  const handleToggleStatus = async (id) => {
    await fetch(`/api/complaints/${id}/status`, { method: 'PATCH' });
    showToast('状态已更新');
    fetchComplaints();
  };

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sortArrow = (key) => {
    if (sortKey !== key) return '';
    return sortDir === 'asc' ? ' ▲' : ' ▼';
  };

  // 搜索 + 筛选 + 排序
  const filtered = useMemo(() => {
    let list = [...complaints];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => c.title.toLowerCase().includes(q) || c.user_id.toLowerCase().includes(q));
    }

    if (statusFilter !== 'all') {
      list = list.filter(c => c.status === statusFilter);
    }

    list.sort((a, b) => {
      let va, vb;
      if (sortKey === 'title') { va = a.title; vb = b.title; }
      else if (sortKey === 'user_id') { va = a.user_id; vb = b.user_id; }
      else if (sortKey === 'status') { va = a.status; vb = b.status; }
      else { va = a.created_at; vb = b.created_at; }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [complaints, search, statusFilter, sortKey, sortDir]);

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  const formatTime = (t) => TIME_FMT.format(new Date(t));

  return (
    <div className="mac-app">
      {toast && <div className="mac-toast">{toast}</div>}

      {/* 工具栏 */}
      <header className="mac-toolbar">
        <div className="mac-toolbar-left">
          <div className="mac-toolbar-icon">🏢</div>
          <h1 className="mac-toolbar-title">投诉管理后台</h1>
          <div className="mac-toolbar-divider" />
          <span className="mac-toolbar-subtitle">共 {complaints.length} 条</span>
        </div>
        <div className="mac-toolbar-right">
          <button className="mac-btn mac-btn-primary" onClick={() => setShowForm(true)}>
            <span className="mac-btn-icon">＋</span>
            新建投诉
          </button>
        </div>
      </header>

      <div className="mac-content">
        {/* 统计卡片 */}
        <div className="mac-stats">
          <div className="mac-stat-card">
            <div className="mac-stat-value">{stats.total}</div>
            <div className="mac-stat-label">总计</div>
          </div>
          <div className="mac-stat-card mac-stat-orange">
            <div className="mac-stat-value">{stats.pending}</div>
            <div className="mac-stat-label">待处理</div>
          </div>
          <div className="mac-stat-card mac-stat-green">
            <div className="mac-stat-value">{stats.resolved}</div>
            <div className="mac-stat-label">已解决</div>
          </div>
        </div>

        {/* 搜索 + 筛选 */}
        <div className="mac-toolbar-row">
          <div className="mac-search-box">
            <span className="mac-search-icon">🔍</span>
            <input
              className="mac-search-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索标题或用户 ID…"
            />
            {search && <button className="mac-search-clear" onClick={() => setSearch('')}>✕</button>}
          </div>
          <div className="mac-filter-tabs">
            {['all', 'pending', 'resolved'].map(t => (
              <button
                key={t}
                className={`mac-filter-tab ${statusFilter === t ? 'active' : ''}`}
                onClick={() => setStatusFilter(t)}
              >
                {t === 'all' ? '全部' : t === 'pending' ? '待处理' : '已解决'}
              </button>
            ))}
          </div>
        </div>

        {/* 表格 */}
        {loading ? (
          <div className="mac-loading"><span className="mac-loading-bar" /></div>
        ) : (
          <div className="mac-table-wrap">
            <table className="mac-table">
              <thead>
                <tr>
                  <th className="mac-th-sort" onClick={() => handleSort('title')} style={{width:'30%'}}>
                    标题{sortArrow('title')}
                  </th>
                  <th style={{width:'auto'}}>内容</th>
                  <th className="mac-th-sort" onClick={() => handleSort('user_id')} style={{width:'90px'}}>
                    用户{sortArrow('user_id')}
                  </th>
                  <th className="mac-th-sort" onClick={() => handleSort('status')} style={{width:'80px'}}>
                    状态{sortArrow('status')}
                  </th>
                  <th className="mac-th-sort" onClick={() => handleSort('created_at')} style={{width:'110px'}}>
                    时间{sortArrow('created_at')}
                  </th>
                  <th style={{width:'70px'}}>操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="mac-table-empty">
                      {search || statusFilter !== 'all' ? '无匹配结果' : '暂无投诉数据'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((c, i) => (
                    <tr key={c.id} className={i % 2 === 0 ? 'mac-row-even' : ''}>
                      <td className="mac-cell-title">{c.title}</td>
                      <td className="mac-cell-desc">{c.content || '—'}</td>
                      <td><span className="mac-user-badge">{c.user_id}</span></td>
                      <td>
                        <span className={`mac-status ${c.status}`}>
                          {c.status === 'resolved' ? '已解决' : '待处理'}
                        </span>
                      </td>
                      <td className="mac-cell-time">{formatTime(c.created_at)}</td>
                      <td>
                        <button
                          className="mac-btn-icon-only"
                          onClick={() => handleToggleStatus(c.id)}
                          title={c.status === 'pending' ? '标记已解决' : '重新打开'}
                        >
                          {c.status === 'pending' ? '✅' : '↩️'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* macOS 风格弹窗 */}
      {showForm && (
        <div className="mac-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="mac-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mac-modal-header">
              <span className="mac-modal-dot mac-modal-dot-red" onClick={() => setShowForm(false)} />
              <span className="mac-modal-dot mac-modal-dot-yellow" />
              <span className="mac-modal-dot mac-modal-dot-green" />
              <span className="mac-modal-title">新建投诉</span>
            </div>
            <form className="mac-modal-body" onSubmit={handleCreate}>
              <div className="mac-field">
                <label className="mac-field-label">投诉标题</label>
                <input className="mac-field-input" value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="输入标题" required maxLength={100} disabled={submitting} autoFocus />
              </div>
              <div className="mac-field">
                <label className="mac-field-label">用户 ID</label>
                <input className="mac-field-input" value={formUser} onChange={e => setFormUser(e.target.value)} placeholder="例如 user_1" required maxLength={50} disabled={submitting} />
              </div>
              <div className="mac-field">
                <label className="mac-field-label">详细描述</label>
                <textarea className="mac-field-input mac-field-textarea" value={formContent} onChange={e => setFormContent(e.target.value)} placeholder="选填" maxLength={1000} disabled={submitting} />
              </div>
              <div className="mac-modal-actions">
                <button type="button" className="mac-btn mac-btn-secondary" onClick={() => setShowForm(false)} disabled={submitting}>取消</button>
                <button type="submit" className="mac-btn mac-btn-primary" disabled={!formTitle.trim() || !formUser.trim() || submitting}>{submitting ? '创建中…' : '创建投诉'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}