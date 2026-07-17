import { NavLink } from 'react-router-dom'
import { Gauge, Swords, LayoutGrid, Presentation, MessagesSquare, Compass } from 'lucide-react'
import { useStartup } from '../lib/StartupContext.jsx'
import './Sidebar.css'

const links = [
  { to: '/dashboard/validator', label: 'Idea Validator', icon: Gauge },
  { to: '/dashboard/critic', label: 'VC Pitch Critic', icon: Swords },
  // { to: '/dashboard/canvas', label: 'Business Canvas', icon: LayoutGrid },
  { to: '/dashboard/pitchdeck', label: 'Pitch Deck', icon: Presentation },
  { to: '/dashboard/mentor', label: 'Startup Mentor', icon: MessagesSquare },
]

export default function Sidebar() {
  const { startup } = useStartup()
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Compass size={20} color="var(--gold)" />
        <span>VenturePilot</span>
      </div>

      {startup.name && (
        <div className="sidebar-startup">
          <span className="pill">Flying</span>
          <p>{startup.name}</p>
        </div>
      )}

      <nav className="sidebar-nav">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <NavLink to="/dashboard" className="sidebar-reset">
        Change startup
      </NavLink>
    </aside>
  )
}
