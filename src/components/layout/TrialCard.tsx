import GiftIcon from '@/assets/figma/gift.svg?react'
import swooshUrl from '@/assets/figma/trial-swoosh.svg'

/**
 * "Trial ends in 2 days" panel above the sidebar footer. Measured at 64px tall
 * with an 8px inset and a 116x24 button.
 *
 * The swoosh is a 40x64 export — exactly the card's height — pinned to the
 * right edge and marked decorative, since it carries no meaning the text does
 * not already give.
 */
export function TrialCard({ daysLeft }: { daysLeft: number }) {
  return (
    <div className="relative h-16 overflow-hidden rounded-callout bg-accent-amber-soft px-2 pt-1.5">
      <img
        src={swooshUrl}
        alt=""
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 h-16 w-10 mix-blend-color-burn select-none"
      />
      <p className="relative text-body font-semibold text-ink">
        Trial ends in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
      </p>
      <button
        type="button"
        className="relative mt-1.5 inline-flex h-6 items-center gap-1.5 rounded-chip bg-accent-amber px-2 text-meta font-medium text-card transition hover:brightness-95"
      >
        Upgrade plan
        <GiftIcon aria-hidden className="size-3" />
      </button>
    </div>
  )
}
