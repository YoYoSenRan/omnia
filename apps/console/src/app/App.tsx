/**
 * 根组件
 *
 * 组合 Providers 和 Router，作为应用最外层壳。
 *
 * @module app/App
 */

import { Providers } from './providers'
import { AppRouter } from './router'

export function App() {
  return (
    <Providers>
      <AppRouter />
    </Providers>
  )
}
