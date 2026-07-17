import { Routes, Route } from 'react-router-dom'
import { StartupProvider } from './lib/StartupContext.jsx'
import Landing from './pages/Landing.jsx'
import DashboardLayout from './pages/DashboardLayout.jsx'
import StartupIntake from './pages/StartupIntake.jsx'
import RequireStartup from './pages/RequireStartup.jsx'
import Validator from './pages/Validator.jsx'
import Critic from './pages/Critic.jsx'
import Canvas from './pages/Canvas.jsx'
import PitchDeck from './pages/PitchDeck.jsx'
import Mentor from './pages/Mentor.jsx'

export default function App() {
  return (
    <StartupProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<StartupIntake />} />
          <Route element={<RequireStartup />}>
            <Route path="validator" element={<Validator />} />
            <Route path="critic" element={<Critic />} />
            <Route path="canvas" element={<Canvas />} />
            <Route path="pitchdeck" element={<PitchDeck />} />
            <Route path="mentor" element={<Mentor />} />
          </Route>
        </Route>
      </Routes>
    </StartupProvider>
  )
}
