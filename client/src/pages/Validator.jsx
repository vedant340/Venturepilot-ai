import { useState } from 'react'
import { Gauge } from 'lucide-react'
import TopNav from '../components/TopNav.jsx'
import StreamPanel from '../components/StreamPanel.jsx'
import ScoreDial from '../components/ScoreDial.jsx'
import { useStartup } from '../lib/StartupContext.jsx'
import { streamModule } from '../lib/api.js'

export default function Validator() {
  const { startup } = useStartup()
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [text, setText] = useState('')
  const [error, setError] = useState(null)

  const score = (() => {
    const m = text.match(/##\s*Idea Score\s*\n+\D*(\d{1,3})/i)
    return m ? Math.min(100, parseInt(m[1], 10)) : null
  })()

  const run = async () => {
    setStatus('loading')
    setText('')
    setError(null)
    try {
      await streamModule('/validate', { startup }, (_, full) => setText(full), setError)
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <TopNav title="Idea Validator" subtitle={`Scoring ${startup.name} against market need, audience fit, and edge.`} />
      <div className="module-body">
        {status !== 'idle' && (
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
            <ScoreDial score={score ?? 0} />
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: 13.5, lineHeight: 1.6 }}>
                The score updates live as the report streams in. It reflects problem clarity, market
                need, competitive landscape, and the strength of {startup.name || 'your'}'s unique
                value proposition.
              </p>
              <button className="btn" style={{ marginTop: 12 }} onClick={run} disabled={status === 'loading'}>
                Re-run validation
              </button>
            </div>
          </div>
        )}
        {error && <p style={{ color: 'var(--red)', marginBottom: 12, fontSize: 13.5 }}>{error}</p>}
        <StreamPanel
          text={text}
          status={status}
          emptyTitle="No validation run yet"
          emptyBody="Claude will analyze problem clarity, audience, market need, competitors, and your unique value proposition."
          onRun={run}
          runLabel={<><Gauge size={15} /> Validate idea</>}
        />
      </div>
    </>
  )
}
