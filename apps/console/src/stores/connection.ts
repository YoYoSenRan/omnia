import { create } from "zustand"

interface ConnectionState {
  /** SSE 是否已连接 */
  sseConnected: boolean
  /** 设置 SSE 连接状态 */
  setSseConnected: (connected: boolean) => void
}

/** 连接状态 store */
export const useConnectionStore = create<ConnectionState>((set) => ({
  sseConnected: false,
  setSseConnected: (connected) => set({ sseConnected: connected }),
}))
