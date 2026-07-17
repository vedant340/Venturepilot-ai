import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Rocket } from 'lucide-react'
import { useStartup } from '../lib/StartupContext.jsx'
import TopNav from '../components/TopNav.jsx'
import './StartupIntake.css'
import './StartupIntake.css'

const FIELDS = [
  { key: 'name', label: 'Startup name', placeholder: 'e.g. Fieldnote' },
  { key: 'description', label: 'Startup description', placeholder: 'What does it do, in a sentence or two?', textarea: true },
  { key: 'industry', label: 'Industry', placeholder: 'e.g. AgriTech, FinTech, EdTech' },
  { key: 'audience', label: 'Target audience', placeholder: 'Who is this for?' },
  { key: 'problem', label: 'Problem solved', placeholder: 'What pain point does this remove?', textarea: true },
]

export default function StartupIntake() {
  const { startup, setStartup } = useStartup()
  const [form, setForm] = useState(startup)
  const navigate = useNavigate()

  const canSubmit = form.name.trim() && form.description.trim()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setStartup(form)
    navigate('/dashboard/validator')
  }

  return (
    <>
      <TopNav title="Set your flight plan" subtitle="Describe your startup once — every module below will reuse it." />
      <div className="module-body">
        <form className="intake-form card" onSubmit={handleSubmit}>
          {FIELDS.map((f) => (
            <label className="intake-field" key={f.key}>
              <span>{f.label}</span>
              {f.textarea ? (
                <textarea
                  rows={3}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
              ) : (
                <input
                  type="text"
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
              )}
            </label>
          ))}
          <button className="btn btn-primary" type="submit" disabled={!canSubmit}>
            <Rocket size={15} /> Take off
          </button>
        </form>
      </div>
    </>
  )
}
