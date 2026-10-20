import avatarUrl from '@/assets/figma/user-avatar.svg'

/**
 * Signed-in user, pinned to the bottom of the sidebar.
 *
 * The avatar is the Crono mark on a disc rather than a photo, supplied as a
 * single 32px export with its background baked in.
 *
 * The name is held on one line: the export gives it exactly 126px, which the
 * browser renders a hair wider, so without `nowrap` it wraps and pushes the
 * whole block out of position.
 */
export function SidebarUser({
  name,
  jobTitle,
  collapsed = false,
}: {
  name: string
  jobTitle: string
  collapsed?: boolean
}) {
  return (
    <div className="flex items-center gap-[9px] overflow-hidden border-t border-border px-1 pt-[17px] pb-5">
      <img src={avatarUrl} alt="" className="size-8 shrink-0" />
      {!collapsed && (
        <span className="min-w-0">
          <span className="block text-body leading-5 whitespace-nowrap text-ink">
            {name}
          </span>
          <span className="block text-body leading-5 text-muted">
            {jobTitle}
          </span>
        </span>
      )}
    </div>
  )
}
