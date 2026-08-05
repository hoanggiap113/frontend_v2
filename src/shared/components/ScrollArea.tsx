import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { cn } from '#/shared/lib/utils'

type ScrollAreaProps = ComponentPropsWithoutRef<'div'>

const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('app-scrollbar overflow-y-auto', className)}
        {...props}
      >
        {children}
      </div>
    )
  },
)

ScrollArea.displayName = 'ScrollArea'

export default ScrollArea
