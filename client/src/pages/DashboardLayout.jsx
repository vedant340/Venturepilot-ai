import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import './DashboardLayout.css'

export default function DashboardLayout({ title, subtitle }) {
  return (
    <div className="dash-shell">
      <Sidebar />
      <main className="dash-main scrollbar-thin">
        <Outlet />
      </main>
    </div>
  )
}
