export interface Skill {
  name: string
  description?: string
  source: 'bundled' | 'managed' | 'workspace'
  version?: string
  enabled: boolean
}
