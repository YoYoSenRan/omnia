import { motion } from 'framer-motion'
import { useConnectionStore } from '@/stores/connection-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, Puzzle, Activity, Clock } from 'lucide-react'
import { staggerContainer, staggerItem } from '@/lib/motion'

const cards = [
  { label: 'Agents', value: '—', icon: Bot, color: 'text-primary' },
  { label: 'Skills', value: '—', icon: Puzzle, color: 'text-info' },
  { label: 'Sessions', value: '—', icon: Activity, color: 'text-success' },
  { label: 'Uptime', value: '—', icon: Clock, color: 'text-warning' },
]

export function Dashboard() {
  const uptime = useConnectionStore((s) => s.uptime)
  const status = useConnectionStore((s) => s.status)

  const displayCards = cards.map((card) => {
    if (card.label === 'Uptime' && status === 'connected') {
      return { ...card, value: `${Math.floor(uptime)}s` }
    }
    return card
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your OpenClaw instance
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {displayCards.map(({ label, value, icon: Icon, color }) => (
          <motion.div key={label} variants={staggerItem}>
            <Card className="transition-colors hover:border-muted-foreground/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  {label}
                </CardTitle>
                <Icon size={18} className={color} strokeWidth={1.8} />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-foreground">{value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {status !== 'connected' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="pt-6">
              <p className="text-sm text-warning">
                Gateway is not connected. Make sure OpenClaw is running and check your configuration.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
