import { createBrowserRouter } from 'react-router-dom'
import { ProjectGate } from '@/pages/ProjectGate'
import { Welcome } from '@/pages/Welcome'
import { ProjectShell } from '@/components/layout/ProjectShell'
import { Dashboard } from '@/pages/Dashboard'
import { Agents } from '@/pages/Agents'
import { Skills } from '@/pages/Skills'
import { Workspace } from '@/pages/Workspace'
import { Chat } from '@/pages/Chat'
import { Settings } from '@/pages/Settings'

export const router = createBrowserRouter([
  { path: '/', element: <ProjectGate /> },
  { path: '/welcome', element: <Welcome /> },
  {
    path: '/p/:projectId',
    element: <ProjectShell />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'agents', element: <Agents /> },
      { path: 'skills', element: <Skills /> },
      { path: 'workspace', element: <Workspace /> },
      { path: 'chat', element: <Chat /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
])
