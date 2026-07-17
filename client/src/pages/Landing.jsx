import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Gauge, Swords, LayoutGrid, Presentation, MessagesSquare, ArrowRight, Compass } from 'lucide-react'
import './Landing.css'

const features = [
  { icon: Gauge, title: 'Idea Validator', body: 'Score your concept 0–100 across market need, audience, and edge — with a clear verdict, not vague encouragement.' },
  { icon: Swords, title: 'VC Pitch Critic', body: 'A blunt AI investor asks the questions a real partner meeting would, and tells you where funding readiness falls short.' },
  { icon: LayoutGrid, title: 'Business Model Canvas', body: 'Nine building blocks, generated from your idea and laid out as a real canvas — not a wall of text.' },
  { icon: Presentation, title: 'Pitch Deck Generator', body: 'Eleven investor-ready slides, from problem to funding ask, exportable in one click.' },
  { icon: MessagesSquare, title: 'Startup Mentor', body: 'An always-available, supportive co-founder for pricing, growth, hiring, and the decisions in between.' },
]

const steps = [
  { n: '01', title: 'Describe your startup once', body: 'Name, problem, audience, industry — enter it a single time.' },
  { n: '02', title: 'Route it through five modules', body: 'Every module reuses that context automatically. No repeat questions.' },
  { n: '03', title: 'Leave with something real', body: 'A score, a canvas, a deck, and a mentor thread you can return to.' },
]

const faqs = [
  { q: 'Do I need to re-enter my startup details for each module?', a: 'No. You enter it once on the dashboard and every module — validator, critic, canvas, deck, mentor — reuses that same context.' },
  { q: 'Is my data stored anywhere?', a: 'No. VenturePilot is fully stateless — everything lives in memory for your current session only, and nothing is written to a database.' },
  { q: 'Which AI model powers this?', a: 'VenturePilot runs on the Anthropic Claude API by default, configured through an environment variable so the provider can be swapped.' },
  { q: 'Can I export the pitch deck?', a: 'Yes — copy it as markdown or export it as a PDF directly from the deck module.' },
]

export default function Landing() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-brand"><Compass size={20} color="var(--gold)" /> VenturePilot</div>
        <Link to="/dashboard" className="btn btn-primary">Launch app <ArrowRight size={15} /></Link>
      </nav>

      <section className="hero">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="pill">Five modules · one context · zero repetition</span>
          <h1 className="hero-title">
            Validate, improve<br />& pitch your startup<br /><span className="hero-accent">with AI.</span>
          </h1>
          <p className="hero-sub">
            VenturePilot is the instrument panel for early founders — a score for your idea, a
            VC who won't flatter you, a canvas, a deck, and a mentor who will. All from one
            description of your startup.
          </p>
          <div className="hero-cta">
            <Link to="/dashboard" className="btn btn-primary">Start flying <ArrowRight size={15} /></Link>
            <a href="#how" className="btn">See how it works</a>
          </div>
        </motion.div>

        <motion.div
          className="hero-instrument"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        >
          <div className="instrument-ring">
            <span className="instrument-value">82</span>
            <span className="instrument-label">Idea Score</span>
          </div>
          <div className="instrument-tag">✅ Invest — VC verdict</div>
        </motion.div>
      </section>

      <section className="features" id="features">
        <h2 className="section-title">Five instruments, one flight</h2>
        <div className="feature-grid">
          {features.map(({ icon: Icon, title, body }) => (
            <div className="feature-card" key={title}>
              <Icon size={20} color="var(--gold)" />
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="how" id="how">
        <h2 className="section-title">How it works</h2>
        <div className="how-grid">
          {steps.map((s) => (
            <div className="how-step" key={s.n}>
              <span className="how-n">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="screenshot">
        <h2 className="section-title">Inside the cockpit</h2>
        <div className="screenshot-frame glass">
          <div className="screenshot-fake-sidebar" />
          <div className="screenshot-fake-body">
            <div className="skel-line" style={{ width: '30%' }} />
            <div className="skel-line" style={{ width: '90%' }} />
            <div className="skel-line" style={{ width: '75%' }} />
          </div>
        </div>
      </section>

      <section className="faq" id="faq">
        <h2 className="section-title">Questions before takeoff</h2>
        <div className="faq-list">
          {faqs.map((f) => (
            <details className="faq-item" key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="cta-final">
        <h2>Your co-pilot is idling on the runway.</h2>
        <Link to="/dashboard" className="btn btn-primary">Launch VenturePilot <ArrowRight size={15} /></Link>
      </section>

      <footer className="footer">
        <span>VenturePilot AI — built with Claude.</span>
        <span>© 2026</span>
      </footer>
    </div>
  )
}
