// All routes in one place (like the routes list of go_router)
import { Route, Routes } from 'react-router'
import AppLayout from './components/AppLayout.tsx'
import AboutPage from './pages/AboutPage.tsx'
import DashboardPage from './pages/DashboardPage.tsx'
import NotFoundPage from './pages/NotFoundPage.tsx'
import TaskDetailPage from './pages/TaskDetailPage.tsx'
import TasksPage from './pages/TasksPage.tsx'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="tasks/:taskId" element={<TaskDetailPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
