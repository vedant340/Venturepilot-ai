import ReactMarkdown from 'react-markdown'
import './StreamPanel.css'

export default function StreamPanel({ text, status, emptyTitle, emptyBody, onRun, runLabel }) {
  if (status === 'idle') {
    return (
      <div className="stream-empty">
        <div className="stream-empty-glyph" />
        <h3>{emptyTitle}</h3>
        <p>{emptyBody}</p>
        {onRun && (
          <button className="btn btn-primary" onClick={onRun}>{runLabel}</button>
        )}
      </div>
    )
  }

  if (status === 'loading' && !text) {
    return (
      <div className="stream-skeleton">
        <div className="skel-line" style={{ width: '40%' }} />
        <div className="skel-line" style={{ width: '92%' }} />
        <div className="skel-line" style={{ width: '86%' }} />
        <div className="skel-line" style={{ width: '70%' }} />
        <div className="skel-line" style={{ width: '95%' }} />
      </div>
    )
  }

  return (
    <div className="stream-output scrollbar-thin">
      <ReactMarkdown>{text}</ReactMarkdown>
      {status === 'loading' && <span className="stream-cursor" />}
    </div>
  )
}
