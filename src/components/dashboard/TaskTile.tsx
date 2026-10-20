import { ChevronRight } from 'lucide-react'

import WarningIcon from '@/assets/figma/warning.svg?react'
import { cn } from '@/lib/cn'
import type { TaskTone } from '@/types'

/** Tailwind needs literal class names, so the tones are a lookup. */
const TONES: Record<TaskTone, { surface: string; count: string }> = {
  overdue: { surface: 'bg-accent-red-soft', count: 'text-accent-red' },
  pendingManual: {
    surface: 'bg-accent-amber-soft',
    count: 'text-accent-amber-ink',
  },
  pendingAuto: { surface: 'bg-accent-blue-soft', count: 'text-accent-blue' },
  completed: { surface: 'bg-accent-green-soft', count: 'text-accent-green' },
}

export function TaskTile({
  tone,
  count,
  label,
  errors = 0,
  actionable = false,
}: {
  tone: TaskTone
  count: number
  label: string
  /** Renders the white "N error" badge, as on Pending Auto. */
  errors?: number
  /** Renders the trailing chevron. Completed has none in the export. */
  actionable?: boolean
}) {
  const { surface, count: countColour } = TONES[tone]

  const body = (
    <>
      <span className={cn('text-display font-medium', countColour)}>
        {count}
      </span>
      <span className="flex items-center text-body leading-4 font-medium text-ink-soft">
        {label}
        {actionable && (
          <ChevronRight
            size={16}
            strokeWidth={2}
            aria-hidden
            className="ml-auto"
          />
        )}
      </span>

      {errors > 0 && (
        <span className="absolute top-2 right-2.5 inline-flex h-6 items-center gap-1 rounded-full bg-card px-2 text-meta font-medium text-accent-red">
          {errors} {errors === 1 ? 'error' : 'errors'}
          <WarningIcon aria-hidden className="size-3.5" />
        </span>
      )}
    </>
  )

  const shell = cn(
    'relative flex h-[86px] flex-1 flex-col justify-between rounded-tile p-4 text-left',
    surface,
  )

  return actionable ? (
    <button
      type="button"
      className={cn(shell, 'transition hover:brightness-95')}
    >
      {body}
    </button>
  ) : (
    <div className={shell}>{body}</div>
  )
}
