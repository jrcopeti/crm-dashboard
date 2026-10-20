import PencilIcon from '@/assets/figma/edit-kpis.svg?react'
import { KpiTile } from '@/components/dashboard/KpiTile'
import { Card, CardTitle } from '@/components/ui/Card'
import type { Kpi } from '@/types'

/**
 * The right rail's KPI panel: a 2×3 grid of 184×71 tiles with an 8px gutter.
 *
 * The horizontal padding is 15px, not the 16 Figma reports: Figma measures a
 * frame's padding from its outer edge and CSS measures it from inside the
 * border, so 16 here would leave 374px for the grid and 183px tiles.
 *
 * The export draws every bar but Contacts engaged at exactly 88px of 166 —
 * 53% — regardless of the figures printed beside them, so "Companies engaged
 * 0/500" is half full. Fidelity to the design is the brief, so each KPI
 * carries the fill the export draws; `aria-valuenow` still reports the real
 * figure. See the deviations table in the README.
 */
export function PerformanceCard({
  month,
  kpis,
}: {
  month: string
  kpis: Kpi[]
}) {
  return (
    <Card className="px-[15px] pt-4 pb-[14px]">
      <div className="flex items-center justify-between">
        <CardTitle>{month}&rsquo;s performance</CardTitle>
        <button
          type="button"
          className="inline-flex -translate-y-[3px] items-center gap-1.5 text-body leading-[22px] font-semibold text-brand-strong transition-opacity hover:opacity-80"
        >
          Edit KPIs
          <PencilIcon aria-hidden className="size-3.5" />
        </button>
      </div>

      <div className="mt-[10px] grid grid-cols-2 gap-2">
        {kpis.map((kpi) => (
          <KpiTile key={kpi.label} kpi={kpi} />
        ))}
      </div>
    </Card>
  )
}
