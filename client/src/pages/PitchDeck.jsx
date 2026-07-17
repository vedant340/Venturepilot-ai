import { useState } from 'react'
import { Presentation, Copy, FileDown, Check } from 'lucide-react'
import TopNav from '../components/TopNav.jsx'
import StreamPanel from '../components/StreamPanel.jsx'
import { useStartup } from '../lib/StartupContext.jsx'
import { streamModule } from '../lib/api.js'

export default function PitchDeck() {
  const { startup } = useStartup()
  const [status, setStatus] = useState('idle')
  const [text, setText] = useState('')
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  const run = async () => {
    setStatus('loading')
    setText('')
    setError(null)
    try {
      await streamModule('/pitchdeck', { startup }, (_, full) => setText(full), setError)
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  const copyMarkdown = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const exportPdf = () => {
    const win = window.open('', '_blank')
    win.document.write(`
      <html><head><title>${startup.name} — Pitch Deck</title>
      <style>
        body { font-family: Georgia, serif; max-width: 760px; margin: 40px auto; padding: 0 20px; color: #111; line-height: 1.6; }
        h2 { border-bottom: 2px solid #333; padding-bottom: 6px; margin-top: 34px; }
      </style></head><body>
      <div id="c"></div>
      <script>
        document.getElementById('c').innerText = ${JSON.stringify(text)};
      </script>
      </body></html>
    `)
    win.document.close()
    setTimeout(() => win.print(), 400)
  }

  return (
    <>
      <TopNav title="Pitch Deck Generator" subtitle="Eleven investor-ready slides, from problem to funding ask." />
      <div className="module-body">
        {status === 'done' && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <button className="btn" onClick={run}>Regenerate</button>
            <button className="btn" onClick={copyMarkdown}>
              {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Copied' : 'Copy as markdown'}
            </button>
            <button className="btn" onClick={exportPdf}><FileDown size={15} /> Export as PDF</button>
          </div>
        )}
        {error && <p style={{ color: 'var(--red)', marginBottom: 12, fontSize: 13.5 }}>{error}</p>}
        <StreamPanel
          text={text}
          status={status}
          emptyTitle="No deck generated yet"
          emptyBody="Claude will draft Problem, Solution, Market, Business Model, Traction, Funding Ask, and five more slides."
          onRun={run}
          runLabel={<><Presentation size={15} /> Generate deck</>}
        />
      </div>
    </>
  )
}
