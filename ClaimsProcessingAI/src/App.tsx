import { Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import OperationalDashboard from '@/pages/dashboard/operational'
import DecisionPage from '@/pages/dashboard/decision'
import IntakePage from '@/pages/intake'
import Auditor from '@/pages/dashboard/Auditor'
import Admin from '@/pages/dashboard/Admin'
import ExecutiveDashboard from '@/pages/dashboard/ExecutiveDashboard'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<OperationalDashboard />} />
        <Route path="/dashboard/cases/:caseId" element={<DecisionPage />} />
        <Route path="/intake" element={<IntakePage />} />
        <Route path="/auditor" element={<Auditor />} />
        <Route path="/executive" element={<ExecutiveDashboard />} />
        <Route path="/admin" element={<Admin />} />
      </Route>
    </Routes>
  )
}

export default App
