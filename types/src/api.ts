export interface ApiResponse<T = unknown> {
  ok: boolean
  code: number | string
  msg: string
  data: T | null
}
