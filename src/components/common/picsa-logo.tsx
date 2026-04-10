import { cn } from '@/lib/utils'

interface PicsaLogoProps {
  className?: string
  imageClassName?: string
  size?: number
}

export function PicsaLogo({
  className,
  imageClassName,
  size = 44,
}: PicsaLogoProps) {
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-background/90 shadow-none',
        className,
      )}
      style={{ width: size, height: size }}
    >
      <img
        src="/icon-dark-32x32.png"
        alt="Picsa logo"
        width="32"
        height="32"
        className={cn('block h-[72%] w-[72%] object-contain dark:hidden', imageClassName)}
       
      />
      <img
        src="/icon-light-32x32.png"
        alt=""
        aria-hidden="true"
        width="32"
        height="32"
        className={cn('hidden h-[72%] w-[72%] object-contain dark:block', imageClassName)}
       
      />
    </span>
  )
}
