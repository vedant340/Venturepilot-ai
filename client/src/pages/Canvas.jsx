import { useState } from 'react'
import { LayoutGrid } from 'lucide-react'
import TopNav from '../components/TopNav.jsx'
import { useStartup } from '../lib/StartupContext.jsx'
import { fetchCanvas } from '../lib/api.js'
import './Canvas.css'

const BLOCKS = [
  { key: 'key_partners', label: 'Key Partners' },
  { key: 'key_activities', label: 'Key Activities' },
  { key: 'value_proposition', label: 'Value Proposition' },
  { key: 'customer_relationships', label: 'Customer Relationships' },
  { key: 'customer_segments', label: 'Customer Segments' },
  { key: 'key_resources', label: 'Key Resources' },
  { key: 'channels', label: 'Channels' },
  { key: 'cost_structure', label: 'Cost Structure' },
  { key: 'revenue_streams', label: 'Revenue Streams' },
]

export default function Canvas() {
  const { startup } = useStartup()
  const [status, setStatus] = useState('idle')
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const run = async () => {
    setStatus('loading')
    setError(null)
    try {
      const res = await fetchCanvas(startup)
      if (res.error) throw new Error(res.error)
      setData(res)
      setStatus('done')
    } catch (e) {
      setError(e.message)
      setStatus('error')
    }
  }

  return (
    <>
      <TopNav title="Business Model Canvas" subtitle="Nine building blocks, generated from your idea." />
      <div className="module-body" style={{ maxWidth: 980 }}>
        {status !== 'idle' && (
          <button className="btn" style={{ marginBottom: 16 }} onClick={run} disabled={status === 'loading'}>
            Regenerate canvas
          </button>
        )}
        {error && <p style={{ color: 'var(--red)', marginBottom: 12, fontSize: 13.5 }}>{error}</p>}

        {status === 'idle' && (
          <div className="stream-empty">
            <div className="stream-empty-glyph" />
            <h3>No canvas generated yet</h3>
            <p>Claude will lay out customer segments, value proposition, channels, and six more blocks.</p>
            <button className="btn btn-primary" onClick={run}><LayoutGrid size={15} /> Generate canvas</button>
          </div>
        )}

        {status === 'loading' && (
          <div className="canvas-grid">
            {BLOCKS.map((b) => (
              <div className="canvas-block" key={b.key}>
                <span className="canvas-block-label">{b.label}</span>
                <div className="skel-line" style={{ width: '80%' }} />
                <div className="skel-line" style={{ width: '60%' }} />
              </div>
            ))}
          </div>
        )}

        {status === 'done' && data && (
          <div className="canvas-grid">
            {BLOCKS.map((b) => (
              <div className="canvas-block" key={b.key}>
                <span className="canvas-block-label">{b.label}</span>
                <p>{data[b.key]}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
