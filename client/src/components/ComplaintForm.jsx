import { useState } from 'react';

export default function ComplaintForm({ userId, onSubmit }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onSubmit({ title, content, userId });
    setTitle('');
    setContent('');
    setOpen(false);
  };

  return (
    <>
      <button className="btn" onClick={() => setOpen(true)}>➕ 新建投诉</button>
      {open && (
        <div className="overlay" onClick={() => setOpen(false)}>
          <form className="form" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
            <h2>新建投诉</h2>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="投诉标题"
              required
              autoFocus
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="详细描述（可选）"
              rows={4}
            />
            <div className="form-actions">
              <button type="submit" className="btn">提交</button>
              <button type="button" className="btn btn-cancel" onClick={() => setOpen(false)}>取消</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}