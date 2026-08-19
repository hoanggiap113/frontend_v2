import type { ComponentPropsWithRef } from 'react'
import { cn } from '#/lib/utils'

type ScrollAreaProps = ComponentPropsWithRef<'div'>

export default function ScrollArea({
  className,
  children,
  ref,
  ...props
}: ScrollAreaProps) {
  return (
    <div
      ref={ref}
      className={cn('app-scrollbar overflow-y-auto', className)}
      {...props}
    >
      {children}
    </div>
  )
}
