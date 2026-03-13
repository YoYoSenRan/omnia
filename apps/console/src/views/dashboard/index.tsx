import { useTranslation } from 'react-i18next'

export function Dashboard() {
  const { t } = useTranslation()

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground">{t('dashboard.title')}</h2>
      <p className="mt-2 text-muted-foreground">{t('dashboard.subtitle')}</p>
    </div>
  )
}
