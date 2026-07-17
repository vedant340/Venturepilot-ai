import { useState } from 'react'
import { Swords } from 'lucide-react'
import TopNav from '../components/TopNav.jsx'
import StreamPanel from '../components/StreamPanel.jsx'
import { useStartup } from '../lib/StartupContext.jsx'
import { streamModule } from '../lib/api.js'

export default function Critic() {
  const { startup } = useStartup()
  const [status, setStatus] = useState('idle')
  const [text, setText] = useState('')
  const [error, setError] = useState(null)

  const run = async () => {
    setStatus('loading')
    setText('')
    setError(null)
    try {
      await streamModule('/critic', { startup }, (_, full) => setText(full), setError)
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <TopNav title="VC Pitch Critic" subtitle="A blunt AI investor, not a cheerleader." />
      <div className="module-body">
        {status !== 'idle' && (
          <button className="btn" style={{ marginBottom: 16 }} onClick={run} disabled={status === 'loading'}>
            Re-run critique
          </button>
        )}
        {error && <p style={{ color: 'var(--red)', marginBottom: 12, fontSize: 13.5 }}>{error}</p>}
        <StreamPanel
          text={text}
          status={status}
          emptyTitle="No critique yet"
          emptyBody="Claude will play a partner-meeting VC: tough questions, missing assumptions, a scorecard, and a verdict."
          onRun={run}
          runLabel={<><Swords size={15} /> Face the VC</>}
        />
      </div>
    </>
  )
}
