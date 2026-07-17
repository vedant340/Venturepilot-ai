import { Navigate, Outlet } from 'react-router-dom'
import { useStartup } from '../lib/StartupContext.jsx'

export default function RequireStartup() {
  const { isReady } = useStartup()
  if (!isReady) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
