import { create } from 'zustand'
import type { ConnectionStatus } from '@omnia/types'

interface ConnectionState {
  status: ConnectionStatus
  uptime: number
  setStatus: (status: ConnectionStatus) => void
  setUptime: (uptime: number) => void
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  status: 'disconnected',
  uptime: 0,
  setStatus: (status) => set({ status }),
  setUptime: (uptime) => set({ uptime }),
}))
