import { useState, useRef, useEffect } from 'react'
import { Send, MessagesSquare } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import TopNav from '../components/TopNav.jsx'
import { useStartup } from '../lib/StartupContext.jsx'
import { streamModule } from '../lib/api.js'
import './Mentor.css'

export default function Mentor() {
  const { startup } = useStartup()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const trimmed = input.trim()
    if (!trimmed || loading) return
    const history = messages.map(({ role, content }) => ({ role, content }))
    const next = [...messages, { role: 'user', content: trimmed }]
    setMessages(next)
    setInput('')
    setLoading(true)

    let assistantText = ''
    setMessages([...next, { role: 'assistant', content: '' }])

    try {
      await streamModule(
        '/mentor',
        { startup, message: trimmed, history },
        (_, full) => {
          assistantText = full
          setMessages([...next, { role: 'assistant', content: assistantText }])
        },
        (err) => setMessages([...next, { role: 'assistant', content: `⚠️ ${err}` }])
      )
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      <TopNav title="Startup Mentor" subtitle="Supportive, not a pushover — pricing, growth, hiring, roadmap." />
      <div className="module-body mentor-body">
        <div className="mentor-thread scrollbar-thin">
          {messages.length === 0 && (
            <div className="stream-empty">
              <MessagesSquare size={22} color="var(--gold)" />
              <h3>Ask your mentor anything</h3>
              <p>Pricing strategy, go-to-market, what to build next — this thread remembers your session.</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`mentor-msg ${m.role}`}>
              <span className="mentor-role">{m.role === 'user' ? 'You' : 'Mentor'}</span>
              <div className="mentor-bubble">
                <ReactMarkdown>{m.content || '…'}</ReactMarkdown>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="mentor-input-row">
          <textarea
            rows={1}
            placeholder={`Ask about ${startup.name || 'your startup'}…`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <button className="btn btn-primary" onClick={send} disabled={loading || !input.trim()}>
            <Send size={15} />
          </button>
        </div>
      </div>
    </>
  )
}
