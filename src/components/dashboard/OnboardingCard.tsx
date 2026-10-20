import { Card, CardTitle } from '@/components/ui/Card'
import type { OnboardingStep } from '@/types'

/**
 * The rail's checklist. Five 40px rows separated by a 1px rule.
 *
 * The rules are not decoration — they are why the list measures 332px rather
 * than 264: every gap is 16 + 1 + 16, expressed here as the list's own 16px
 * gap plus a top border and 16px padding on each row after the first.
 *
 * The rows are 373px wide, which inside a 408px card leaves an asymmetric
 * gutter — that asymmetry is in the export, not a rounding slip here. The
 * paddings read 15/18 rather than 16/19 because Figma measures padding from a
 * frame's outer edge and CSS measures it from inside the 1px border.
 */
export function OnboardingCard({ steps }: { steps: OnboardingStep[] }) {
  return (
    <Card className="min-h-[412px] pt-4 pr-[18px] pb-4 pl-[15px]">
      <CardTitle>Onboarding</CardTitle>

      <ul className="mt-[11px] flex flex-col gap-4">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className={i > 0 ? 'border-t border-border pt-4' : undefined}
          >
            {/* A button, not a div: a checklist row with a duration on it is an
                affordance, and it was neither focusable nor clickable. The box
                is unchanged, so the hover tint sits exactly on the 40px row. */}
            <button
              type="button"
              className="flex h-10 w-full items-center justify-between rounded-lg pr-2 text-left transition-colors hover:bg-page"
            >
              <div className="flex items-center gap-4">
                <img src={step.icon} alt="" className="size-10 shrink-0" />
                <span className="text-body leading-[22px] font-semibold text-ink">
                  {step.title}
                </span>
              </div>
              <span className="text-body leading-6 text-muted">
                {step.minutes} min
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  )
}
