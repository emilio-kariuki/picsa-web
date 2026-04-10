import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_marketing')({
  component: MarketingSiteLayout,
})

function MarketingSiteLayout() {
  return (
    <div
      data-site="marketing"
      className="grain-overlay relative min-h-screen overflow-x-hidden bg-background text-foreground font-sans"
    >
      <Outlet />
    </div>
  )
}
