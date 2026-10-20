import { ChevronRight } from 'lucide-react'

import MailIcon from '@/assets/figma/replies-mail.svg?react'
import { Card, CardTitle } from '@/components/ui/Card'
import { AvatarStack } from '@/components/ui/Avatar'
import type { Replier } from '@/types'

/**
 * Reply count with the accounts that replied. The teal panel is 80px tall with
 * a 48px icon chip, measured from the export.
 */
export function RepliesCard({
  count,
  repliers,
}: {
  count: number
  repliers: Replier[]
}) {
  return (
    <Card className="flex h-full flex-col p-4">
      <div className="flex items-center justify-between">
        <CardTitle>Replies</CardTitle>
        {/* A button, not a link: there is no router on this screen, and an
            anchor to a fragment that does not exist is a broken affordance. */}
        <button
          type="button"
          className="inline-flex items-center gap-1 text-body leading-[18px] font-medium text-brand-strong transition-opacity hover:opacity-80"
        >
          Open inbox
          <ChevronRight size={16} strokeWidth={2} aria-hidden />
        </button>
      </div>

      <div className="mt-1.5 flex h-20 items-center rounded-tile bg-brand-soft pr-6 pl-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-chip">
          <MailIcon aria-hidden className="size-6 text-brand-strong" />
        </span>
        <span className="ml-[18px] text-stat font-medium text-ink-soft">
          {count}
        </span>
        <AvatarStack people={repliers} size={32} className="ml-auto" />
      </div>
    </Card>
  )
}
