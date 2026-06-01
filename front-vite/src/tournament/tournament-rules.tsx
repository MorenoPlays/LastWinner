import { cn } from '@/lib/utils'

interface TournamentRulesProps {
  rules: string
  className?: string
}

export function TournamentRules({ rules, className }: TournamentRulesProps) {
  return (
    <div className={cn('prose prose-invert max-w-none', className)}>
      <div className="whitespace-pre-wrap text-foreground">
        {rules}
      </div>
    </div>
  )
}