/**
 * 应用入口
 *
 * 初始化 React 根节点，挂载应用组件。
 *
 * @module main
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
