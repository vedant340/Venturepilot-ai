import { motion } from 'framer-motion'
import './ScoreDial.css'

// A cockpit "altitude gauge" style dial for the 0-100 idea score.
export default function ScoreDial({ score = 0, label = 'Idea Score' }) {
  const clamped = Math.max(0, Math.min(100, score))
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (clamped / 100) * circumference
  const color = clamped >= 70 ? 'var(--green)' : clamped >= 40 ? 'var(--amber)' : 'var(--red)'

  return (
    <div className="score-dial">
      <svg width="150" height="150" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r="54" fill="none" stroke="var(--border)" strokeWidth="10" />
        <motion.circle
          cx="65" cy="65" r="54" fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          transform="rotate(-90 65 65)"
        />
        {/* tick marks, instrument-panel feel */}
        {Array.from({ length: 20 }).map((_, i) => {
          const angle = (i / 20) * 2 * Math.PI - Math.PI / 2
          const x1 = 65 + Math.cos(angle) * 46
          const y1 = 65 + Math.sin(angle) * 46
          const x2 = 65 + Math.cos(angle) * 41
          const y2 = 65 + Math.sin(angle) * 41
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--border-strong)" strokeWidth="1.5" />
        })}
      </svg>
      <div className="score-dial-center">
        <span className="score-dial-value">{Math.round(clamped)}</span>
        <span className="score-dial-label">{label}</span>
      </div>
    </div>
  )
}
