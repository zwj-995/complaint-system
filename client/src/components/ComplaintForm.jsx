import { useState, useRef, useEffect } from 'react';

export default function ComplaintForm({ userId, onSubmit }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      // 延迟聚焦让 sheet 动画先跑
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), content: content.trim() });
      setTitle('');
      setContent('');
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    setOpen(false);
  };

  return (
    <>
      {/* FAB */}
      <button className="ios-fab" onClick={() => setOpen(true)} aria-label="新建投诉">
        +
      </button>

      {/* Bottom Sheet */}
      {open && (
        <div className="ios-sheet-overlay" onClick={handleClose}>
          <form
            className="ios-sheet"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
          >
            <div className="ios-sheet-grabber" />
            <div className="ios-sheet-title">新建投诉</div>

            <div className="ios-field-group">
              <div className="ios-field-label">标题</div>
              <input
                ref={inputRef}
                className="ios-field"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="投诉标题"
                required
                maxLength={100}
                disabled={submitting}
              />
            </div>

            <div className="ios-field-group">
              <div className="ios-field-label">详细描述</div>
              <textarea
                className="ios-field ios-field-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="请详细描述您遇到的问题（可选）"
                maxLength={1000}
                disabled={submitting}
              />
            </div>

            <div className="ios-sheet-actions">
              <button
                type="button"
                className="ios-btn ios-btn-secondary"
                onClick={handleClose}
                disabled={submitting}
              >
                取消
              </button>
              <button
                type="submit"
                className="ios-btn ios-btn-primary"
                disabled={!title.trim() || submitting}
              >
                {submitting ? '提交中...' : '提交'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}