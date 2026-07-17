import { useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import './TopNav.css'

export default function TopNav({ title, subtitle }) {
  const [light, setLight] = useState(false)

  const toggleTheme = () => {
    setLight((v) => !v)
    document.documentElement.classList.toggle('light-theme')
  }

  return (
    <header className="topnav">
      <div>
        <h1 className="topnav-title">{title}</h1>
        {subtitle && <p className="topnav-subtitle">{subtitle}</p>}
      </div>
      <button className="btn theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
        {light ? <Moon size={16} /> : <Sun size={16} />}
      </button>
    </header>
  )
}
